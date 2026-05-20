import type { Metadata } from "next";
import { searchPosts } from "@/lib/posts";
import VideoGrid from "@/components/VideoGrid";
import AdSlot from "@/components/AdSlot";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: { q?: string };
}

export function generateMetadata({ searchParams }: PageProps): Metadata {
  const q = (searchParams.q || "").trim();
  return {
    title: q ? `Search: ${q}` : "Search",
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const q = (searchParams.q || "").trim();
  const posts = q ? await searchPosts(q, 60) : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 grid gap-6 lg:grid-cols-[1fr_300px]">
      <div>
        <header className="mb-6">
          <h1 className="font-display tracking-wider text-3xl text-deama-gold-bright">
            SEARCH
          </h1>
          {q && (
            <p className="text-sm text-deama-muted mt-1">
              {posts.length} result{posts.length === 1 ? "" : "s"} for{" "}
              <span className="text-deama-text font-semibold">“{q}”</span>
            </p>
          )}
        </header>

        {!q ? (
          <p className="text-deama-muted">Type something to search.</p>
        ) : (
          <VideoGrid posts={posts} />
        )}
      </div>

      <aside className="space-y-4">
        <AdSlot id="search-sidebar-1" size="halfpage" />
      </aside>
    </div>
  );
}
