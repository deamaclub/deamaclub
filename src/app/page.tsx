import type { Metadata } from "next";
import { getLatestPosts, getTrendingPosts, POSTS_PER_PAGE } from "@/lib/posts";
import { absoluteUrl } from "@/lib/utils";
import VideoGrid from "@/components/VideoGrid";
import TrendingHero from "@/components/TrendingHero";
import Pagination from "@/components/Pagination";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Deamaclub — Viral Videos, Fights, Hip Hop & Street Culture",
  description:
    "Deamaclub is the home of viral videos — fights, hip hop, sports, wild moments and celebrity drama from across America. New clips added every day.",
  alternates: { canonical: "/" },
};

interface HomePageProps {
  searchParams: { page?: string };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const page = Math.max(1, parseInt(searchParams.page || "1", 10) || 1);
  const [trending, { posts, total }] = await Promise.all([
    page === 1 ? getTrendingPosts(5) : Promise.resolve([]),
    getLatestPosts({ page, perPage: POSTS_PER_PAGE }),
  ]);

  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Deamaclub",
    url: absoluteUrl("/"),
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: absoluteUrl("/search?q={search_term_string}"),
      },
      "query-input": "required name=search_term_string",
    },
  };
  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Deamaclub",
    url: absoluteUrl("/"),
    logo: absoluteUrl("/logo.svg"),
    sameAs: [
      "https://twitter.com/deamaclub",
      "https://instagram.com/deamaclub",
      "https://youtube.com/@deamaclub",
    ],
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }}
      />
      <div>
        {/* Crawlable H1 for the homepage (visually compact). */}
        <h1 className="sr-only">
          Deamaclub — Viral Videos, Fights, Hip Hop, Sports & Street Culture
        </h1>
        {page === 1 && <TrendingHero posts={trending} />}

        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-display tracking-wider text-xl text-deama-gold-bright">
            LATEST
          </h2>
          <span className="text-xs text-deama-muted">
            Page {page} · {total.toLocaleString()} videos
          </span>
        </div>

        <VideoGrid posts={posts} />

        <Pagination
          page={page}
          perPage={POSTS_PER_PAGE}
          total={total}
          basePath="/"
        />
      </div>
    </div>
  );
}
