"use client";

import { useEffect, useState, useTransition } from "react";
import { timeAgo } from "@/lib/utils";

interface Comment {
  id: string;
  author: string;
  body: string;
  createdAt: string;
}

export default function Comments({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [author, setAuthor] = useState("");
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/comments?postId=${postId}`)
      .then((r) => r.json())
      .then((d: { comments: Comment[] }) => {
        if (!cancelled) setComments(d.comments || []);
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [postId]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!author.trim() || !body.trim()) return;
    startTransition(async () => {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, author, body }),
      });
      if (!res.ok) {
        setError("Could not post comment.");
        return;
      }
      const { comment } = (await res.json()) as { comment: Comment };
      setComments((c) => [comment, ...c]);
      setBody("");
    });
  }

  return (
    <section className="mt-8" aria-label="Comments">
      <h2 className="font-display tracking-wider text-2xl mb-4 text-deama-gold-bright">
        COMMENTS{" "}
        <span className="text-deama-muted text-base">({comments.length})</span>
      </h2>

      <form
        onSubmit={submit}
        className="bg-deama-ink border border-deama-border rounded-lg p-4 mb-6"
      >
        <input
          type="text"
          required
          maxLength={40}
          placeholder="Your name"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="w-full bg-deama-black border border-deama-border rounded px-3 py-2 mb-2 text-sm focus:outline-none focus:border-deama-red"
        />
        <textarea
          required
          maxLength={2000}
          placeholder="Drop a comment…"
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full bg-deama-black border border-deama-border rounded px-3 py-2 text-sm focus:outline-none focus:border-deama-red resize-y"
        />
        {error && <p className="text-deama-red text-xs mt-2">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="mt-3 bg-deama-red hover:bg-deama-red-hover disabled:opacity-60 text-white text-xs uppercase tracking-wider font-bold px-4 py-2 rounded transition-colors"
        >
          {pending ? "Posting…" : "Post comment"}
        </button>
      </form>

      {loading ? (
        <p className="text-deama-muted text-sm">Loading comments…</p>
      ) : comments.length === 0 ? (
        <p className="text-deama-muted text-sm">
          No comments yet. Be the first.
        </p>
      ) : (
        <ul className="space-y-4">
          {comments.map((c) => (
            <li
              key={c.id}
              className="bg-deama-ink border border-deama-border rounded p-3"
            >
              <div className="flex items-center gap-2 text-xs text-deama-muted mb-1">
                <span className="font-semibold text-deama-gold">
                  {c.author}
                </span>
                <span>·</span>
                <span>{timeAgo(c.createdAt)}</span>
              </div>
              <p className="text-sm whitespace-pre-wrap break-words">
                {c.body}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
