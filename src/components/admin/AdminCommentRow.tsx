"use client";

import Link from "next/link";
import { useState } from "react";
import { Trash2, Heart, EyeOff, ExternalLink } from "lucide-react";
import { timeAgo } from "@/lib/utils";

interface AdminCommentRowProps {
  id: string;
  body: string;
  createdAt: string;
  likeCount: number;
  postSlug: string;
  postTitle: string;
  hidden: boolean;
}

export default function AdminCommentRow({
  id,
  body,
  createdAt,
  likeCount,
  postSlug,
  postTitle,
  hidden,
}: AdminCommentRowProps) {
  const [deleted, setDeleted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function del() {
    if (!confirm("Delete this comment (and any replies)?")) return;
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/admin/comments/${id}`, { method: "DELETE" });
    setBusy(false);
    if (!res.ok) {
      setError("Delete failed.");
      return;
    }
    setDeleted(true);
  }

  if (deleted) {
    return (
      <li className="bg-deama-ink/40 border border-dashed border-deama-border rounded p-3">
        <p className="text-xs text-deama-muted text-center">Comment deleted.</p>
      </li>
    );
  }

  return (
    <li className="bg-deama-ink border border-deama-border rounded p-3">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs text-deama-muted mb-1 flex-wrap">
            <span>{timeAgo(createdAt)}</span>
            <span>·</span>
            <Link
              href={`/video/${postSlug}`}
              target="_blank"
              className="inline-flex items-center gap-1 hover:text-deama-red truncate"
            >
              <ExternalLink size={11} />
              <span className="truncate max-w-[300px]">{postTitle}</span>
            </Link>
            {hidden && (
              <span className="inline-flex items-center gap-1 text-deama-red">
                <EyeOff size={11} /> hidden
              </span>
            )}
            {likeCount > 0 && (
              <span className="inline-flex items-center gap-1">
                <Heart size={11} /> {likeCount}
              </span>
            )}
          </div>
          <p className="text-sm whitespace-pre-wrap break-words">{body}</p>
        </div>
        <button
          type="button"
          onClick={del}
          disabled={busy}
          className="inline-flex items-center gap-1 text-xs text-deama-muted hover:text-deama-red disabled:opacity-60 shrink-0"
          aria-label="Delete comment"
        >
          <Trash2 size={14} />
          {busy ? "Deleting…" : "Delete"}
        </button>
      </div>
      {error && (
        <p className="text-xs text-deama-red mt-2">{error}</p>
      )}
    </li>
  );
}
