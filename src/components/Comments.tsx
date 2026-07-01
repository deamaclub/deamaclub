"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { Heart, MessageSquare, EyeOff } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import { useAuthModal } from "./AuthModalProvider";

interface CommentNode {
  id: string;
  parentId: string | null;
  body: string;
  createdAt: string;
  likeCount: number;
  username: string;
  likedByMe: boolean;
  hidden?: boolean;
}

interface CommentTree extends CommentNode {
  children: CommentTree[];
}

function buildTree(flat: CommentNode[]): CommentTree[] {
  const map = new Map<string, CommentTree>();
  flat.forEach((c) => map.set(c.id, { ...c, children: [] }));
  const roots: CommentTree[] = [];
  flat.forEach((c) => {
    const node = map.get(c.id)!;
    if (c.parentId && map.has(c.parentId)) {
      map.get(c.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  // Top-level: newest first. Replies: oldest first (chronological conversation flow)
  roots.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  function sortReplies(node: CommentTree) {
    node.children.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    node.children.forEach(sortReplies);
  }
  roots.forEach(sortReplies);
  return roots;
}

export default function Comments({ postId }: { postId: string }) {
  const { data: session, status } = useSession();
  const { openModal } = useAuthModal();
  const [comments, setComments] = useState<CommentNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/comments?postId=${postId}`)
      .then((r) => r.json())
      .then((d: { comments: CommentNode[] }) => {
        if (!cancelled) setComments(d.comments || []);
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [postId]);

  // Re-fetch likedByMe state when auth status changes (sign-in/out)
  useEffect(() => {
    if (status === "loading") return;
    fetch(`/api/comments?postId=${postId}`)
      .then((r) => r.json())
      .then((d: { comments: CommentNode[] }) => setComments(d.comments || []))
      .catch(() => {});
  }, [postId, status]);

  const tree = useMemo(() => buildTree(comments), [comments]);

  function postComment(text: string, parentId: string | null) {
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, body: text, parentId }),
      });
      if (res.status === 401) {
        openModal({
          mode: "signup",
          after: () => postComment(text, parentId),
        });
        return;
      }
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setError(j.error || "Couldn't post comment.");
        return;
      }
      const { comment } = (await res.json()) as { comment: CommentNode };
      setComments((prev) => [comment, ...prev]);
      if (!parentId) setBody("");
    });
  }

  async function toggleLike(commentId: string) {
    if (!session?.user) {
      openModal({ mode: "signup", after: () => toggleLike(commentId) });
      return;
    }
    // Optimistic
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? {
              ...c,
              likedByMe: !c.likedByMe,
              likeCount: c.likeCount + (c.likedByMe ? -1 : 1),
            }
          : c
      )
    );
    const res = await fetch(`/api/comments/${commentId}/like`, {
      method: "POST",
    });
    if (!res.ok) {
      // Revert
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? {
                ...c,
                likedByMe: !c.likedByMe,
                likeCount: c.likeCount + (c.likedByMe ? -1 : 1),
              }
            : c
        )
      );
      return;
    }
    const data = (await res.json()) as { liked: boolean; likeCount: number };
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, likedByMe: data.liked, likeCount: data.likeCount }
          : c
      )
    );
  }

  function onTopLevelSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!text) return;
    if (!session?.user) {
      openModal({
        mode: "signup",
        after: () => postComment(text, null),
      });
      return;
    }
    postComment(text, null);
  }

  const totalCount = comments.length;

  return (
    <section className="mt-8" aria-label="Comments">
      <h2 className="font-display tracking-wider text-2xl mb-4 text-deama-gold-bright">
        COMMENTS{" "}
        <span className="text-deama-muted text-base">({totalCount})</span>
      </h2>

      <form
        onSubmit={onTopLevelSubmit}
        className="bg-deama-ink border border-deama-border rounded-lg p-4 mb-6"
      >
        <textarea
          required
          maxLength={2000}
          placeholder={
            session?.user
              ? `Comment as @${session.user.username}…`
              : "Sign in to comment…"
          }
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
      ) : tree.length === 0 ? (
        <p className="text-deama-muted text-sm">
          No comments yet. Be the first.
        </p>
      ) : (
        <ul className="space-y-4">
          {tree.map((c) => (
            <CommentNodeView
              key={c.id}
              node={c}
              depth={0}
              onLike={toggleLike}
              postComment={postComment}
              forceReveal={false}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

interface CommentNodeViewProps {
  node: CommentTree;
  depth: number;
  onLike: (commentId: string) => void;
  postComment: (text: string, parentId: string) => void;
  /** When true, skip the hidden check for this node and all descendants
      (used when a parent hidden comment has been revealed). */
  forceReveal: boolean;
}

function CommentNodeView({
  node,
  depth,
  onLike,
  postComment,
  forceReveal,
}: CommentNodeViewProps) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [reply, setReply] = useState("");
  const [locallyRevealed, setLocallyRevealed] = useState(false);
  const maxIndent = 4;
  const visualDepth = Math.min(depth, maxIndent);
  const indentClass = visualDepth > 0 ? "border-l border-deama-border pl-3 md:pl-4" : "";

  const isHidden = Boolean(node.hidden) && !forceReveal && !locallyRevealed;

  function submitReply(e: React.FormEvent) {
    e.preventDefault();
    const text = reply.trim();
    if (!text) return;
    postComment(text, node.id);
    setReply("");
    setReplyOpen(false);
  }

  // Count all descendants (used in the hidden placeholder for context).
  function countDescendants(n: CommentTree): number {
    return n.children.reduce((sum, c) => sum + 1 + countDescendants(c), 0);
  }

  if (isHidden) {
    const hiddenReplies = countDescendants(node);
    return (
      <li className={visualDepth > 0 ? `ml-3 md:ml-4 ${indentClass}` : ""}>
        <div className="bg-deama-ink/60 border border-dashed border-deama-border rounded p-3 text-center">
          <p className="text-xs text-deama-muted inline-flex items-center gap-1.5">
            <EyeOff size={12} />
            Comment hidden by moderation
            {hiddenReplies > 0 && (
              <span>· {hiddenReplies} repl{hiddenReplies === 1 ? "y" : "ies"} hidden</span>
            )}
          </p>
          <button
            type="button"
            onClick={() => setLocallyRevealed(true)}
            className="mt-2 text-xs uppercase tracking-wider font-semibold text-deama-gold-bright hover:text-deama-red"
          >
            View hidden message
          </button>
        </div>
      </li>
    );
  }

  // If this node was hidden but the user chose to reveal it, cascade reveal
  // to descendants so the whole thread opens together.
  const descendantForceReveal = forceReveal || (Boolean(node.hidden) && locallyRevealed);

  return (
    <li className={visualDepth > 0 ? `ml-3 md:ml-4 ${indentClass}` : ""}>
      <div className="bg-deama-ink border border-deama-border rounded p-3">
        <div className="flex items-center gap-2 text-xs text-deama-muted mb-1">
          <span className="font-semibold text-deama-gold">@{node.username}</span>
          <span>·</span>
          <span>{timeAgo(node.createdAt)}</span>
        </div>
        <p className="text-sm whitespace-pre-wrap break-words">{node.body}</p>
        <div className="flex items-center gap-3 mt-2 text-xs">
          <button
            type="button"
            onClick={() => onLike(node.id)}
            className={`inline-flex items-center gap-1 hover:text-deama-red transition-colors ${
              node.likedByMe ? "text-deama-red" : "text-deama-muted"
            }`}
            aria-label={node.likedByMe ? "Unlike" : "Like"}
          >
            <Heart
              size={13}
              fill={node.likedByMe ? "currentColor" : "none"}
            />
            {node.likeCount > 0 && <span>{node.likeCount}</span>}
          </button>
          <button
            type="button"
            onClick={() => setReplyOpen((v) => !v)}
            className="inline-flex items-center gap-1 text-deama-muted hover:text-deama-text"
          >
            <MessageSquare size={13} /> Reply
          </button>
        </div>
        {replyOpen && (
          <form onSubmit={submitReply} className="mt-3">
            <textarea
              autoFocus
              rows={2}
              maxLength={2000}
              required
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder={`Reply to @${node.username}…`}
              className="w-full bg-deama-black border border-deama-border rounded px-3 py-2 text-sm focus:outline-none focus:border-deama-red resize-y"
            />
            <div className="flex gap-2 mt-2">
              <button
                type="submit"
                className="bg-deama-red hover:bg-deama-red-hover text-white text-xs uppercase tracking-wider font-bold px-3 py-1.5 rounded"
              >
                Reply
              </button>
              <button
                type="button"
                onClick={() => setReplyOpen(false)}
                className="text-xs text-deama-muted hover:text-deama-text px-3 py-1.5"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
      {node.children.length > 0 && (
        <ul className="mt-3 space-y-3">
          {node.children.map((c) => (
            <CommentNodeView
              key={c.id}
              node={c}
              depth={depth + 1}
              onLike={onLike}
              postComment={postComment}
              forceReveal={descendantForceReveal}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
