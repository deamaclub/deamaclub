import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/categories";
import { absoluteUrl } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    select: { slug: true, updatedAt: true, publishedAt: true },
    take: 5000,
  });

  const now = new Date();
  return [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "hourly",
      priority: 1,
    },
    ...CATEGORIES.map((c) => ({
      url: absoluteUrl(`/category/${c.slug}`),
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...["about", "contact", "privacy", "terms"].map((p) => ({
      url: absoluteUrl(`/${p}`),
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
    ...posts.map((p) => ({
      url: absoluteUrl(`/video/${p.slug}`),
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
