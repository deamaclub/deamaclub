"use client";

import Link from "next/link";
import Image from "next/image";
import { Play, Eye, Clock } from "lucide-react";
import VideoPlayer from "./VideoPlayer";
import PostInteractionBar from "./PostInteractionBar";
import type { FeedPostData } from "@/lib/feed";
import { absoluteUrl, formatViews, timeAgo } from "@/lib/utils";

function formatDuration(s?: number | null) {
  if (!s) return null;
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
}

/**
 * One post in the feed: title, video, like/comment/share.
 *
 * The video shows as a thumbnail with a play button until the visitor taps
 * it — only then is the real player mounted (and the view counted). Keeps a
 * long scrolled feed light: at most one live player at a time.
 */
export default function FeedPost({
  post,
  active,
  onPlay,
  priority = false,
}: {
  post: FeedPostData;
  active: boolean;
  onPlay: () => void;
  priority?: boolean;
}) {
  const href = `/video/${post.slug}`;
  const duration = formatDuration(post.durationSec);

  return (
    <article className="bg-deama-ink border border-deama-border rounded-lg overflow-hidden">
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-2 text-[11px] text-deama-muted">
          <Link
            href={`/category/${post.category.slug}`}
            className="uppercase tracking-wider font-semibold text-deama-red hover:text-deama-gold-bright"
          >
            {post.category.name}
          </Link>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1" suppressHydrationWarning>
            <Clock size={11} /> {timeAgo(post.publishedAt)}
          </span>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            <Eye size={11} /> {formatViews(post.viewCount)}
          </span>
        </div>
        <h2 className="mt-1.5 text-base md:text-lg font-semibold leading-snug">
          <Link href={href} className="hover:text-deama-gold-bright transition-colors">
            {post.title}
          </Link>
        </h2>
      </div>

      {active ? (
        <VideoPlayer
          postId={post.id}
          embedUrl={post.embedUrl}
          videoUrl={post.videoUrl}
          thumbnailUrl={post.thumbnailUrl}
          title={post.title}
          autoplay
        />
      ) : (
        <button
          type="button"
          onClick={onPlay}
          aria-label={`Play: ${post.title}`}
          className="group relative block w-full aspect-video bg-black border-y border-deama-border"
        >
          {post.thumbnailUrl && (
            <Image
              src={post.thumbnailUrl}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              priority={priority}
              className="object-cover"
            />
          )}
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/60 border border-white/30 group-hover:bg-deama-red transition-colors">
              <Play size={28} fill="white" className="text-white ml-1" />
            </span>
          </span>
          {duration && (
            <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[11px] font-mono px-1.5 py-0.5 rounded">
              {duration}
            </span>
          )}
        </button>
      )}

      <div className="px-4 pb-4">
        <PostInteractionBar
          postId={post.id}
          url={absoluteUrl(href)}
          title={post.title}
          initialLikeCount={post.likeCount}
          commentCount={post.commentCount}
          commentsHref={`${href}#comments`}
        />
      </div>
    </article>
  );
}
