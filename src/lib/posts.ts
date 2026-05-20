import { prisma } from "@/lib/prisma";
import type { VideoCardData } from "@/components/VideoCard";

export const POSTS_PER_PAGE = 24;

const cardSelect = {
  slug: true,
  title: true,
  thumbnailUrl: true,
  viewCount: true,
  publishedAt: true,
  durationSec: true,
  category: { select: { name: true, slug: true } },
} as const;

export async function getTrendingPosts(limit = 5): Promise<VideoCardData[]> {
  return prisma.post.findMany({
    where: { published: true, trending: true },
    orderBy: [{ publishedAt: "desc" }],
    take: limit,
    select: cardSelect,
  });
}

export async function getLatestPosts(opts: {
  page?: number;
  perPage?: number;
  categorySlug?: string;
}): Promise<{ posts: VideoCardData[]; total: number; page: number; perPage: number }> {
  const page = Math.max(1, opts.page ?? 1);
  const perPage = opts.perPage ?? POSTS_PER_PAGE;
  const where = {
    published: true,
    ...(opts.categorySlug
      ? { category: { slug: opts.categorySlug } }
      : {}),
  };

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }],
      skip: (page - 1) * perPage,
      take: perPage,
      select: cardSelect,
    }),
    prisma.post.count({ where }),
  ]);

  return { posts, total, page, perPage };
}

export async function searchPosts(
  q: string,
  limit = 48
): Promise<VideoCardData[]> {
  const term = q.trim();
  if (!term) return [];
  return prisma.post.findMany({
    where: {
      published: true,
      OR: [
        { title: { contains: term, mode: "insensitive" } },
        { description: { contains: term, mode: "insensitive" } },
      ],
    },
    orderBy: [{ publishedAt: "desc" }],
    take: limit,
    select: cardSelect,
  });
}

export async function getRelatedPosts(
  postId: string,
  categoryId: string,
  limit = 8
): Promise<VideoCardData[]> {
  return prisma.post.findMany({
    where: {
      published: true,
      id: { not: postId },
      categoryId,
    },
    orderBy: [{ publishedAt: "desc" }],
    take: limit,
    select: cardSelect,
  });
}
