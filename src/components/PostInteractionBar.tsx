"use client";

import { useState } from "react";
import { Heart, MessageSquare } from "lucide-react";
import ShareMenu from "./ShareMenu";
import { formatViews } from "@/lib/utils";

interface PostInteractionBarProps {
  postId: string;
  url: string;
  title: string;
  initialLikeCount: number;
  /** Kept for backward compatibility with the video page; ignored now
      that likes are unauthenticated + pure-counter. */
  initialLikedByMe?: boolean;
  commentCount: number;
}

export default function PostInteractionBar({
  postId,
  url,
  title,
  initialLikeCount,
  commentCount,
}: PostInteractionBarProps) {
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [pulseKey, setPulseKey] = useState(0);
  const [pending, setPending] = useState(false);

  async function like() {
    if (pending) return;
    setPending(true);
    // Optimistic bump + heart pulse
    setLikeCount((c) => c + 1);
    setPulseKey((k) => k + 1);
    const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
    if (!res.ok) {
      setLikeCount((c) => Math.max(0, c - 1));
      setPending(false);
      return;
    }
    const data = (await res.json()) as { likeCount: number };
    setLikeCount(data.likeCount);
    setPending(false);
  }

  const btnBase =
    "inline-flex items-center gap-1.5 px-3 py-2 text-xs uppercase tracking-wider font-semibold border border-deama-border rounded transition-colors";

  return (
    <div className="flex flex-wrap items-center gap-2 mt-4">
      <button
        type="button"
        onClick={like}
        disabled={pending}
        aria-label="Like this post"
        className={`${btnBase} disabled:opacity-60 border-deama-red text-deama-red hover:bg-deama-red hover:text-white`}
      >
        <Heart
          key={pulseKey}
          size={14}
          fill="currentColor"
          className="animate-[pulse-red_0.6s_ease-out]"
        />
        Like
        {likeCount > 0 && (
          <span className="opacity-90">· {formatViews(likeCount)}</span>
        )}
      </button>

      <a
        href="#comments"
        className={`${btnBase} hover:border-deama-red hover:text-deama-red`}
      >
        <MessageSquare size={14} /> Comment
        {commentCount > 0 && (
          <span className="opacity-75">· {formatViews(commentCount)}</span>
        )}
      </a>

      <ShareMenu url={url} title={title} />
    </div>
  );
}
