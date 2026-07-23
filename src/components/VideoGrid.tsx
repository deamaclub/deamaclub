import VideoCard, { VideoCardData } from "./VideoCard";
import AdSlot from "./AdSlot";

interface VideoGridProps {
  posts: VideoCardData[];
  /** Insert an in-feed ad after every Nth card (default 8). 0 to disable. */
  adEvery?: number;
  /** Priority-load the first N thumbnails for LCP. */
  priorityCount?: number;
}

export default function VideoGrid({
  posts,
  adEvery = 8,
  priorityCount = 4,
}: VideoGridProps) {
  if (posts.length === 0) {
    return (
      <p className="text-deama-muted text-center py-16">No videos yet.</p>
    );
  }
  const out: React.ReactNode[] = [];
  // Option C: at most ONE in-feed ad so the same native creative doesn't
  // repeat between the cards.
  let infeedPlaced = false;
  posts.forEach((p, i) => {
    out.push(
      <VideoCard
        key={p.slug}
        post={p}
        priority={i < priorityCount}
      />
    );
    if (
      adEvery > 0 &&
      !infeedPlaced &&
      (i + 1) % adEvery === 0 &&
      i !== posts.length - 1
    ) {
      infeedPlaced = true;
      // Occupy exactly 2 grid columns (a full mobile row / a 2-wide block on
      // desktop) so a 2x2 native renders as card-width tiles that line up
      // with the video cards, instead of one full-width stretched banner.
      out.push(
        <div key={`ad-${i}`} className="col-span-2 rounded-lg overflow-hidden">
          <AdSlot id="infeed-0" size="in-feed" />
        </div>
      );
    }
  });

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {out}
    </div>
  );
}
