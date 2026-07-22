import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getRelatedPosts } from "@/lib/posts";
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

/** Plain-text, single-line excerpt for meta tags (strips markdown images). */
function metaExcerpt(text: string | null, fallback: string, max = 160): string {
  const clean = (text || fallback)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 1).replace(/\s+\S*$/, "") + "…";
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
  const desc = metaExcerpt(post.description, post.title);

  return {
    title: post.title,
    description: desc,
    keywords: [
      post.title,
      post.category.name,
      ...post.tags.map((t) => t.name),
      "video",
      "deamaclub",
    ],
    alternates: { canonical: url },
    openGraph: {
      type: "video.other",
      url,
      title: post.title,
      description: desc,
      images: [{ url: image, width: 1280, height: 720, alt: post.title }],
      ...(post.embedUrl
        ? { videos: [{ url: post.embedUrl, width: 1280, height: 720 }] }
        : post.videoUrl
        ? {
            videos: [
              {
                url: post.videoUrl,
                type: "video/mp4",
                width: 1280,
                height: 720,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: "player",
      title: post.title,
      description: desc,
      images: [image],
    },
  };
}

export default async function VideoPage({ params }: PageProps) {
  const post = await loadPost(params.slug);
  if (!post || !post.published) notFound();

  const related = await getRelatedPosts(post.id, post.category.id, 8);
  const url = absoluteUrl(`/video/${post.slug}`);

  // Option C: cap the article body to a single in-article ad so the same
  // Adsterra native creative can't repeat down the page. Count description
  // "ad sections" (split on triple-newlines) to decide placement.
  const descSectionCount = post.description
    ? post.description.split(/\n{3,}/).map((s) => s.trim()).filter(Boolean)
        .length
    : 0;

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

  const publishedIso = (post.publishedAt || post.createdAt).toISOString();
  const articleDesc = metaExcerpt(post.description, post.title, 300);

  // NewsArticle — qualifies the page for Google News / Discover surfacing,
  // where viral entertainment content gets massive reach.
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title.slice(0, 110),
    description: articleDesc,
    image: post.thumbnailUrl ? [post.thumbnailUrl] : undefined,
    datePublished: publishedIso,
    dateModified: post.updatedAt.toISOString(),
    articleSection: post.category.name,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: { "@type": "Organization", name: "Deamaclub", url: absoluteUrl("/") },
    publisher: {
      "@type": "Organization",
      name: "Deamaclub",
      logo: { "@type": "ImageObject", url: absoluteUrl("/logo.svg") },
    },
  };

  // Breadcrumb — Home › Category › Title (breadcrumb rich result in SERPs).
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      {
        "@type": "ListItem",
        position: 2,
        name: post.category.name,
        item: absoluteUrl(`/category/${post.category.slug}`),
      },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  };

  return (
    <article className="mx-auto max-w-7xl px-4 py-6 grid gap-6 lg:grid-cols-[1fr_320px]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <div>
        <nav aria-label="Breadcrumb" className="text-xs text-deama-muted mb-3">
          <Link href="/" className="hover:text-deama-red">
            Home
          </Link>{" "}
          <span className="mx-1">/</span>{" "}
          <Link
            href={`/category/${post.category.slug}`}
            className="hover:text-deama-red"
          >
            {post.category.name}
          </Link>{" "}
          <span className="mx-1">/</span>{" "}
          <span className="text-deama-text line-clamp-1 inline">
            {post.title}
          </span>
        </nav>

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
              // Description rules:
              //   single \n        → line break inside a paragraph
              //   \n\n             → paragraph break, NO ad
              //   \n\n\n+          → paragraph break, ad here
              //   ![](url)         → inline image. If the paragraph is ONLY
              //                      an image, render as a standalone figure;
              //                      if mixed with text, render inline.
              const IMG_RE = /!\[([^\]]*)\]\(([^)\s]+)\)/g;

              function renderParagraph(
                para: string,
                key: string
              ): React.ReactNode {
                const onlyImageMatch = para.match(
                  /^!\[([^\]]*)\]\(([^)\s]+)\)$/
                );
                if (onlyImageMatch) {
                  const [, alt, url] = onlyImageMatch;
                  return (
                    <figure key={key} className="my-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={alt}
                        loading="lazy"
                        className="w-full h-auto rounded border border-deama-border"
                      />
                      {alt && (
                        <figcaption className="text-xs text-deama-muted mt-1.5 text-center">
                          {alt}
                        </figcaption>
                      )}
                    </figure>
                  );
                }
                // Mixed text + (optionally) inline images
                const parts: React.ReactNode[] = [];
                let lastIdx = 0;
                let m: RegExpExecArray | null;
                IMG_RE.lastIndex = 0;
                let i = 0;
                while ((m = IMG_RE.exec(para)) !== null) {
                  if (m.index > lastIdx) {
                    parts.push(
                      <span key={`${key}-t-${i}`}>
                        {para.slice(lastIdx, m.index)}
                      </span>
                    );
                  }
                  parts.push(
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      key={`${key}-img-${i}`}
                      src={m[2]}
                      alt={m[1]}
                      loading="lazy"
                      className="my-2 max-w-full h-auto rounded border border-deama-border"
                    />
                  );
                  lastIdx = m.index + m[0].length;
                  i++;
                }
                if (lastIdx < para.length) {
                  parts.push(
                    <span key={`${key}-t-final`}>
                      {para.slice(lastIdx)}
                    </span>
                  );
                }
                if (parts.length === 0) return null;
                return (
                  <p key={key} className="whitespace-pre-wrap break-words">
                    {parts}
                  </p>
                );
              }

              const sections = post.description
                .split(/\n{3,}/)
                .map((s) => s.trim())
                .filter(Boolean);
              const nodes: React.ReactNode[] = [];
              sections.forEach((section, sIdx) => {
                const paragraphs = section
                  .split(/\n{2}/)
                  .map((p) => p.trim())
                  .filter(Boolean);
                paragraphs.forEach((para, pIdx) => {
                  const node = renderParagraph(para, `p-${sIdx}-${pIdx}`);
                  if (node) nodes.push(node);
                });
                // Only ONE in-article ad, placed after the first section.
                // (Posts with 0–1 sections get their single ad from the
                // article-mid slot below instead.)
                if (sIdx === 0 && sections.length > 1) {
                  nodes.push(
                    <AdSlot
                      key="ad-inline"
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

        {descSectionCount <= 1 && (
          <AdSlot id="article-mid" size="in-article" className="my-6" />
        )}

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
      </aside>
    </article>
  );
}
