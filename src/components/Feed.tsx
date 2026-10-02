"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import FeedPost from "./FeedPost";
import type { FeedPostData } from "@/lib/feed";

/**
 * Endless scrolling feed. Starts with the server-rendered posts, then pulls
 * the next page of the same shuffled sequence (/api/feed with this seed) as
 * the visitor nears the bottom. The sequence reshuffles itself when it runs
 * out, so it never ends.
 */
export default function Feed({
  initialPosts,
  seed,
  excludeId,
  nextOffset,
  priorityFirst = false,
}: {
  initialPosts: FeedPostData[];
  seed: number;
  /** Post pinned above the random part (never repeated in it). */
  excludeId?: string;
  /** Offset in the random sequence where the next page starts. */
  nextOffset: number;
  priorityFirst?: boolean;
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [offset, setOffset] = useState(nextOffset);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [failed, setFailed] = useState(false);
  // Position in the list, not post id: the endless sequence can repeat a
  // post in a later cycle.
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const sentinel = useRef<HTMLDivElement | null>(null);
  const busy = useRef(false);

  const loadMore = useCallback(async () => {
    if (busy.current || done) return;
    busy.current = true;
    setLoading(true);
    setFailed(false);
    try {
      const qs = new URLSearchParams({ seed: String(seed), offset: String(offset) });
      if (excludeId) qs.set("exclude", excludeId);
      const res = await fetch(`/api/feed?${qs}`);
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { posts: FeedPostData[] };
      if (data.posts.length === 0) {
        setDone(true);
      } else {
        setPosts((p) => [...p, ...data.posts]);
        setOffset((o) => o + data.posts.length);
      }
    } catch {
      setFailed(true);
    } finally {
      busy.current = false;
      setLoading(false);
    }
  }, [seed, offset, excludeId, done]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || done || failed) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) loadMore();
      },
      // Start fetching well before the bottom so scrolling never stalls.
      { rootMargin: "1200px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [loadMore, done, failed]);

  return (
    <div className="space-y-5">
      {posts.map((post, i) => (
        <FeedPost
          key={`${i}-${post.id}`}
          post={post}
          active={activeIndex === i}
          onPlay={() => setActiveIndex(i)}
          priority={priorityFirst && i === 0}
        />
      ))}

      <div ref={sentinel} aria-hidden className="h-px" />

      {loading && (
        <p className="text-center text-xs text-deama-muted py-4">Loading more…</p>
      )}
      {failed && (
        <div className="text-center py-4">
          <button
            type="button"
            onClick={loadMore}
            className="text-xs uppercase tracking-wider font-semibold border border-deama-border rounded px-4 py-2 hover:border-deama-red hover:text-deama-red"
          >
            Load more videos
          </button>
        </div>
      )}
    </div>
  );
}
