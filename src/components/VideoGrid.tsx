import VideoCard, { VideoCardData } from "./VideoCard";
import AdSlot from "./AdSlot";
import LeadAdBlock from "./LeadAdBlock";
import { ADSTERRA_ENABLED } from "@/lib/adsterra";

interface VideoGridProps {
  posts: VideoCardData[];
  /** Show one in-feed ad in the first block (random slot per load). */
  showAd?: boolean;
  /** Priority-load the first N thumbnails for LCP. */
  priorityCount?: number;
}

export default function VideoGrid({
  posts,
  showAd = true,
  priorityCount = 4,
}: VideoGridProps) {
  if (posts.length === 0) {
    return (
      <p className="text-deama-muted text-center py-16">No videos yet.</p>
    );
  }

  const gridClass = "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4";

  // No ad → plain grid of every video.
  if (!showAd || !ADSTERRA_ENABLED) {
    return (
      <div className={gridClass}>
        {posts.map((p, i) => (
          <VideoCard key={p.slug} post={p} priority={i < priorityCount} />
        ))}
      </div>
    );
  }

  // ONE in-feed ad, dropped into the first 2x2 block: the first 3 videos plus
  // the ad make four cells, with the ad in a random slot each page load. The
  // rest of the videos flow normally below.
  const leadVideos = posts.slice(0, 3);
  const rest = posts.slice(3);

  return (
    <div className={gridClass}>
      <LeadAdBlock
        ad={<AdSlot key="infeed-ad" id="infeed" size="grid-card" />}
        videos={leadVideos.map((p, i) => (
          <VideoCard key={p.slug} post={p} priority={i < priorityCount} />
        ))}
      />
      {rest.map((p) => (
        <VideoCard key={p.slug} post={p} priority={false} />
      ))}
    </div>
  );
}
