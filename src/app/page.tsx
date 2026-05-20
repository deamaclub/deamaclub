import { getLatestPosts, getTrendingPosts, POSTS_PER_PAGE } from "@/lib/posts";
import VideoGrid from "@/components/VideoGrid";
import TrendingHero from "@/components/TrendingHero";
import Pagination from "@/components/Pagination";
import AdSlot from "@/components/AdSlot";

export const revalidate = 60;

interface HomePageProps {
  searchParams: { page?: string };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const page = Math.max(1, parseInt(searchParams.page || "1", 10) || 1);
  const [trending, { posts, total }] = await Promise.all([
    page === 1 ? getTrendingPosts(5) : Promise.resolve([]),
    getLatestPosts({ page, perPage: POSTS_PER_PAGE }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 grid gap-6 lg:grid-cols-[1fr_300px]">
      <div>
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

      <aside className="space-y-4">
        <AdSlot id="home-sidebar-1" size="halfpage" />
        <AdSlot id="home-sidebar-2" size="rectangle" />
      </aside>
    </div>
  );
}
