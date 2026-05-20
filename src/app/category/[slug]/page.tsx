import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getLatestPosts, POSTS_PER_PAGE } from "@/lib/posts";
import VideoGrid from "@/components/VideoGrid";
import Pagination from "@/components/Pagination";
import AdSlot from "@/components/AdSlot";

export const revalidate = 60;

interface PageProps {
  params: { slug: string };
  searchParams: { page?: string };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const cat = await prisma.category.findUnique({
    where: { slug: params.slug },
    select: { name: true, slug: true },
  });
  if (!cat) return { title: "Category" };
  return {
    title: `${cat.name} videos`,
    description: `The latest ${cat.name.toLowerCase()} videos on Deamaclub.`,
    alternates: { canonical: `/category/${cat.slug}` },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps) {
  const cat = await prisma.category.findUnique({
    where: { slug: params.slug },
  });
  if (!cat) notFound();
  const page = Math.max(1, parseInt(searchParams.page || "1", 10) || 1);
  const { posts, total } = await getLatestPosts({
    page,
    perPage: POSTS_PER_PAGE,
    categorySlug: cat.slug,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 grid gap-6 lg:grid-cols-[1fr_300px]">
      <div>
        <header className="mb-6 flex items-center justify-between">
          <h1 className="font-display tracking-wider text-3xl text-deama-gold-bright">
            {cat.name.toUpperCase()}
          </h1>
          <span className="text-xs text-deama-muted">
            {total.toLocaleString()} videos
          </span>
        </header>

        <VideoGrid posts={posts} />

        <Pagination
          page={page}
          perPage={POSTS_PER_PAGE}
          total={total}
          basePath={`/category/${cat.slug}`}
        />
      </div>

      <aside className="space-y-4">
        <AdSlot id={`cat-${cat.slug}-sidebar-1`} size="halfpage" />
        <AdSlot id={`cat-${cat.slug}-sidebar-2`} size="rectangle" />
      </aside>
    </div>
  );
}
