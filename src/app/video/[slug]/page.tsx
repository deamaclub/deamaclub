import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { getRelatedPosts } from "@/lib/posts";
import { authOptions } from "@/lib/auth";
import VideoPlayer from "@/components/VideoPlayer";
import PostInteractionBar from "@/components/PostInteractionBar";
import Comments from "@/components/Comments";
import VideoCard from "@/components/VideoCard";
import AdSlot from "@/components/AdSlot";
import { absoluteUrl, timeAgo, formatViews } from "@/lib/utils";
import { Eye, Clock } from "lucide-react";

// Disable static caching: we need session-aware `likedByMe` per request.
export const dynamic = "force-dynamic";

interface PageProps {
  params: { slug: string };
}

async function loadPost(slug: string) {
  return prisma.post.findUnique({
    where: { slug },
    include: {
      category: { select: { name: true, slug: true, id: true } },
      tags: { select: { name: true, slug: true } },
      _count: { select: { comments: true } },
    },
  });
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const post = await loadPost(params.slug);
  if (!post || !post.published) {
    return { title: "Video not found" };
  }
  const url = absoluteUrl(`/video/${post.slug}`);
  const image = post.thumbnailUrl || "/og-default.jpg";
  return {
    title: post.title,
    description: post.description || undefined,
    alternates: { canonical: url },
    openGraph: {
      type: "video.other",
      url,
      title: post.title,
      description: post.description || undefined,
      images: [image],
    },
    twitter: {
      card: "player",
      title: post.title,
      description: post.description || undefined,
      images: [image],
    },
  };
}

export default async function VideoPage({ params }: PageProps) {
  const [post, session] = await Promise.all([
    loadPost(params.slug),
    getServerSession(authOptions),
  ]);
  if (!post || !post.published) notFound();

  const [related, myLike] = await Promise.all([
    getRelatedPosts(post.id, post.category.id, 8),
    session?.user?.id
      ? prisma.postLike.findUnique({
          where: { postId_userId: { postId: post.id, userId: session.user.id } },
          select: { id: true },
        })
      : Promise.resolve(null),
  ]);
  const url = absoluteUrl(`/video/${post.slug}`);

  const ldJson = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: post.title,
    description: post.description || post.title,
    thumbnailUrl: post.thumbnailUrl ? [post.thumbnailUrl] : undefined,
    uploadDate: (post.publishedAt || post.createdAt).toISOString(),
    duration: post.durationSec
      ? `PT${Math.floor(post.durationSec / 60)}M${post.durationSec % 60}S`
      : undefined,
    embedUrl: post.embedUrl || undefined,
    contentUrl: post.videoUrl || undefined,
    interactionStatistic: [
      {
        "@type": "InteractionCounter",
        interactionType: { "@type": "WatchAction" },
        userInteractionCount: post.viewCount,
      },
      {
        "@type": "InteractionCounter",
        interactionType: { "@type": "LikeAction" },
        userInteractionCount: post.likeCount,
      },
    ],
    publisher: {
      "@type": "Organization",
      name: "Deamaclub",
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/logo.svg"),
      },
    },
  };

  return (
    <article className="mx-auto max-w-7xl px-4 py-6 grid gap-6 lg:grid-cols-[1fr_320px]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
      />

      <div>
        <AdSlot id="article-top" size="leaderboard" className="mb-4" />

        <VideoPlayer
          postId={post.id}
          embedUrl={post.embedUrl}
          videoUrl={post.videoUrl}
          thumbnailUrl={post.thumbnailUrl}
          title={post.title}
          relatedPosts={related.slice(0, 2).map((r) => ({
            slug: r.slug,
            title: r.title,
            thumbnailUrl: r.thumbnailUrl,
          }))}
        />

        <PostInteractionBar
          postId={post.id}
          url={url}
          title={post.title}
          initialLikeCount={post.likeCount}
          initialLikedByMe={Boolean(myLike)}
          commentCount={post._count.comments}
        />

        <header className="mt-4">
          <Link
            href={`/category/${post.category.slug}`}
            className="inline-block bg-deama-red text-white text-[11px] font-bold uppercase tracking-widest px-2 py-1 rounded mb-2"
          >
            {post.category.name}
          </Link>
          <h1 className="font-display tracking-wide text-3xl md:text-4xl leading-tight">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs text-deama-muted mt-3">
            <span className="inline-flex items-center gap-1">
              <Eye size={12} /> {formatViews(post.viewCount)} views
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock size={12} /> {timeAgo(post.publishedAt || post.createdAt)}
            </span>
          </div>
        </header>

        {post.description && (
          <div className="mt-5 text-[15px] text-deama-text/90 leading-relaxed space-y-4">
            {(() => {
              // Split on blank lines so admins can paragraph-break by hitting Enter twice.
              const paragraphs = post.description
                .split(/\n\s*\n+/)
                .map((p) => p.trim())
                .filter(Boolean);
              const AD_EVERY = 1; // ad after every paragraph (except the last)
              const nodes: React.ReactNode[] = [];
              paragraphs.forEach((para, i) => {
                nodes.push(
                  <p
                    key={`p-${i}`}
                    className="whitespace-pre-wrap break-words"
                  >
                    {para}
                  </p>
                );
                const isLast = i === paragraphs.length - 1;
                if (!isLast && (i + 1) % AD_EVERY === 0) {
                  // Single zone id ('article-inline') for all inline slots so
                  // one AdSense ad unit / Mediavine container fills them all.
                  nodes.push(
                    <AdSlot
                      key={`ad-${i}`}
                      id="article-inline"
                      size="in-article"
                      className="my-2"
                    />
                  );
                }
              });
              return nodes;
            })()}
          </div>
        )}

        <AdSlot id="article-mid" size="in-article" className="my-6" />

        <div id="comments">
          <Comments postId={post.id} />
        </div>

        <AdSlot id="article-bottom" size="leaderboard" className="mt-8" />
      </div>

      <aside className="space-y-4">
        <AdSlot id="video-sidebar-1" size="halfpage" />
        <section>
          <h2 className="font-display tracking-wider text-lg text-deama-gold-bright mb-3">
            UP NEXT
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {related.map((r) => (
              <VideoCard key={r.slug} post={r} size="sm" />
            ))}
          </div>
        </section>
        <AdSlot id="video-sidebar-2" size="rectangle" />
      </aside>
    </article>
  );
}
