"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Heart, MessageSquare } from "lucide-react";
import ShareMenu from "./ShareMenu";
import { useAuthModal } from "./AuthModalProvider";
import { formatViews } from "@/lib/utils";

interface PostInteractionBarProps {
  postId: string;
  url: string;
  title: string;
  initialLikeCount: number;
  initialLikedByMe: boolean;
  commentCount: number;
}

export default function PostInteractionBar({
  postId,
  url,
  title,
  initialLikeCount,
  initialLikedByMe,
  commentCount,
}: PostInteractionBarProps) {
  const { data: session } = useSession();
  const { openModal } = useAuthModal();
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [liked, setLiked] = useState(initialLikedByMe);
  const [pending, setPending] = useState(false);

  async function toggleLike() {
    if (!session?.user) {
      openModal({ mode: "signup", after: toggleLike });
      return;
    }
    if (pending) return;
    setPending(true);
    const prevLiked = liked;
    const prevCount = likeCount;
    setLiked(!prevLiked);
    setLikeCount(prevCount + (prevLiked ? -1 : 1));
    const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
    if (!res.ok) {
      setLiked(prevLiked);
      setLikeCount(prevCount);
      setPending(false);
      return;
    }
    const data = (await res.json()) as { liked: boolean; likeCount: number };
    setLiked(data.liked);
    setLikeCount(data.likeCount);
    setPending(false);
  }

  const btnBase =
    "inline-flex items-center gap-1.5 px-3 py-2 text-xs uppercase tracking-wider font-semibold border border-deama-border rounded transition-colors";

  return (
    <div className="flex flex-wrap items-center gap-2 mt-4">
      <button
        type="button"
        onClick={toggleLike}
        disabled={pending}
        aria-pressed={liked}
        className={`${btnBase} disabled:opacity-60 ${
          liked
            ? "border-deama-red text-deama-red"
            : "hover:border-deama-red hover:text-deama-red"
        }`}
      >
        <Heart size={14} fill={liked ? "currentColor" : "none"} />
        {liked ? "Liked" : "Like"}
        {likeCount > 0 && (
          <span className="opacity-75">· {formatViews(likeCount)}</span>
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
