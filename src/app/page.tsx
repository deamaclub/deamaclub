import type { Metadata } from "next";
import { getFeedPage, getNewestFeedPost, newFeedSeed } from "@/lib/feed";
import { absoluteUrl } from "@/lib/utils";
import Feed from "@/components/Feed";

// Rendered per request so every visit gets its own shuffle.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Deamaclub — Viral Videos, Fights, Hip Hop & Street Culture",
  description:
    "Deamaclub is the home of viral videos — fights, hip hop, sports, wild moments and celebrity drama from across America. New clips added every day.",
  alternates: { canonical: "/" },
};

/**
 * Homepage = the feed: the newest video first, then an endless random feed
 * (see lib/feed.ts). Opening any video (/video/<slug>) gives the same feed
 * with that video on top.
 */
export default async function HomePage() {
  const seed = newFeedSeed();
  const newest = await getNewestFeedPost();
  const random = await getFeedPage({ seed, offset: 0, excludeId: newest?.id });

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
    <div className="mx-auto max-w-2xl px-4 py-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }}
      />
      {/* Crawlable H1 for the homepage (visually hidden). */}
      <h1 className="sr-only">
        Deamaclub — Viral Videos, Fights, Hip Hop, Sports & Street Culture
      </h1>
      {newest || random.length > 0 ? (
        <Feed
          initialPosts={newest ? [newest, ...random] : random}
          seed={seed}
          excludeId={newest?.id}
          nextOffset={random.length}
          priorityFirst
        />
      ) : (
        <p className="text-deama-muted text-center py-16">No videos yet.</p>
      )}
    </div>
  );
}
