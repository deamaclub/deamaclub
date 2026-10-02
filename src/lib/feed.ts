import { prisma } from "@/lib/prisma";

/**
 * Endless random feed.
 *
 * Every visitor gets a `seed`. The feed is ALL published posts shuffled by
 * that seed, read in pages by `offset`. When the offset runs past the end,
 * the next "cycle" reshuffles with a derived seed — so the feed never ends
 * and never repeats a video until every one has been shown.
 *
 * `excludeId` is the post pinned at the top of the page (the opened video, or
 * the newest on the homepage); it's left out of every cycle.
 */

export const FEED_PAGE_SIZE = 5;

export interface FeedPostData {
  id: string;
  slug: string;
  title: string;
  thumbnailUrl: string | null;
  embedUrl: string | null;
  videoUrl: string | null;
  durationSec: number | null;
  viewCount: number;
  likeCount: number;
  publishedAt: string | null;
  category: { name: string; slug: string };
  commentCount: number;
}

const feedSelect = {
  id: true,
  slug: true,
  title: true,
  thumbnailUrl: true,
  embedUrl: true,
  videoUrl: true,
  durationSec: true,
  viewCount: true,
  likeCount: true,
  publishedAt: true,
  category: { select: { name: true, slug: true } },
  _count: { select: { comments: true } },
} as const;

type FeedRow = {
  id: string;
  slug: string;
  title: string;
  thumbnailUrl: string | null;
  embedUrl: string | null;
  videoUrl: string | null;
  durationSec: number | null;
  viewCount: number;
  likeCount: number;
  publishedAt: Date | null;
  category: { name: string; slug: string };
  _count: { comments: number };
};

function toFeedPost(r: FeedRow): FeedPostData {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    thumbnailUrl: r.thumbnailUrl,
    embedUrl: r.embedUrl,
    videoUrl: r.videoUrl,
    durationSec: r.durationSec,
    viewCount: r.viewCount,
    likeCount: r.likeCount,
    publishedAt: r.publishedAt ? r.publishedAt.toISOString() : null,
    category: r.category,
    commentCount: r._count.comments,
  };
}

// Published post ids, cached briefly so scrolling doesn't re-read the whole
// table on every page.
const ID_TTL_MS = 60_000;
let idCache: { ids: string[]; at: number } | null = null;

async function publishedIds(): Promise<string[]> {
  if (idCache && Date.now() - idCache.at < ID_TTL_MS) return idCache.ids;
  const rows = await prisma.post.findMany({
    where: { published: true },
    orderBy: { id: "asc" }, // stable base order so a seed always means the same shuffle
    select: { id: true },
  });
  idCache = { ids: rows.map((r) => r.id), at: Date.now() };
  return idCache.ids;
}

/** Small seeded PRNG (mulberry32). */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled<T>(items: T[], seed: number): T[] {
  const out = items.slice();
  const rand = rng(seed);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function newFeedSeed(): number {
  return Math.floor(Math.random() * 2 ** 31);
}

export async function getFeedPage(opts: {
  seed: number;
  offset: number;
  excludeId?: string | null;
  limit?: number;
}): Promise<FeedPostData[]> {
  const limit = Math.min(Math.max(opts.limit ?? FEED_PAGE_SIZE, 1), 20);
  const pool = (await publishedIds()).filter((id) => id !== opts.excludeId);
  if (pool.length === 0) return [];

  // Walk the endless sequence: cycle k is the pool shuffled by (seed + k).
  const pageIds: string[] = [];
  let cycle = -1;
  let order: string[] = [];
  for (let pos = Math.max(0, opts.offset); pageIds.length < limit; pos++) {
    const c = Math.floor(pos / pool.length);
    if (c !== cycle) {
      cycle = c;
      order = shuffled(pool, opts.seed + c * 7919);
    }
    pageIds.push(order[pos % pool.length]);
  }

  const rows = await prisma.post.findMany({
    where: { id: { in: pageIds }, published: true },
    select: feedSelect,
  });
  const byId = new Map(rows.map((r) => [r.id, r]));
  return pageIds
    .map((id) => byId.get(id))
    .filter((r): r is FeedRow => !!r)
    .map(toFeedPost);
}

/** Newest published post — the top of the homepage feed. */
export async function getNewestFeedPost(): Promise<FeedPostData | null> {
  const row = await prisma.post.findFirst({
    where: { published: true },
    orderBy: [{ publishedAt: "desc" }],
    select: feedSelect,
  });
  return row ? toFeedPost(row) : null;
}
