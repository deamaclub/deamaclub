import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getLatestPosts, POSTS_PER_PAGE } from "@/lib/posts";
import { absoluteUrl } from "@/lib/utils";
import VideoGrid from "@/components/VideoGrid";
import Pagination from "@/components/Pagination";
import AdSlot from "@/components/AdSlot";

export const revalidate = 60;

interface PageProps {
  params: { slug: string };
  searchParams: { page?: string };
}

// Keyword-rich, search-intent-matched copy per category.
const CATEGORY_SEO: Record<string, { title: string; description: string }> = {
  news: {
    title: "Viral News Videos — Breaking Clips & Trending Stories",
    description:
      "Watch the latest viral news videos and breaking clips going viral across America right now. Updated daily on Deamaclub.",
  },
  fights: {
    title: "Fight Videos — Hood Fights, Knockouts & Street Brawls",
    description:
      "The latest fight videos, knockouts, hood fights and street brawls caught on camera. New clips added daily on Deamaclub.",
  },
  "hip-hop": {
    title: "Hip Hop Videos — Rap News, Drops & Behind the Scenes",
    description:
      "Hip hop videos, rap news, freestyles, drops and behind-the-scenes moments from the culture. Updated daily on Deamaclub.",
  },
  sports: {
    title: "Sports Videos — Highlights, Fails & Viral Moments",
    description:
      "Viral sports videos, highlights, fails and can't-miss moments from across the leagues. New clips daily on Deamaclub.",
  },
  wild: {
    title: "Wild Videos — Crazy, Shocking & Caught-on-Camera Clips",
    description:
      "The wildest, craziest, most shocking videos caught on camera. Updated daily on Deamaclub.",
  },
  celebrity: {
    title: "Celebrity Videos — Gossip, Drama & Viral Moments",
    description:
      "Celebrity videos, gossip, drama and viral moments blowing up right now. New clips daily on Deamaclub.",
  },
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const cat = await prisma.category.findUnique({
    where: { slug: params.slug },
    select: { name: true, slug: true },
  });
  if (!cat) return { title: "Category" };
  const seo = CATEGORY_SEO[cat.slug] || {
    title: `${cat.name} Videos`,
    description: `The latest ${cat.name.toLowerCase()} videos on Deamaclub, updated daily.`,
  };
  return {
    title: seo.title,
    description: seo.description,
    keywords: [
      `${cat.name.toLowerCase()} videos`,
      `viral ${cat.name.toLowerCase()}`,
      cat.name,
      "deamaclub",
    ],
    alternates: { canonical: `/category/${cat.slug}` },
    openGraph: {
      type: "website",
      url: absoluteUrl(`/category/${cat.slug}`),
      title: seo.title,
      description: seo.description,
    },
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

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      {
        "@type": "ListItem",
        position: 2,
        name: cat.name,
        item: absoluteUrl(`/category/${cat.slug}`),
      },
    ],
  };
  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${cat.name} Videos`,
    url: absoluteUrl(`/category/${cat.slug}`),
    isPartOf: { "@type": "WebSite", name: "Deamaclub", url: absoluteUrl("/") },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: posts.slice(0, 20).map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absoluteUrl(`/video/${p.slug}`),
        name: p.title,
      })),
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 grid gap-6 lg:grid-cols-[1fr_300px]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
      />
      <div>
        <nav aria-label="Breadcrumb" className="text-xs text-deama-muted mb-3">
          <a href="/" className="hover:text-deama-red">
            Home
          </a>{" "}
          <span className="mx-1">/</span>{" "}
          <span className="text-deama-text">{cat.name}</span>
        </nav>
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
      </aside>
    </div>
  );
}
