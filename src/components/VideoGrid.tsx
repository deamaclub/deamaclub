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
  posts.forEach((p, i) => {
    out.push(
      <VideoCard
        key={p.slug}
        post={p}
        priority={i < priorityCount}
      />
    );
    if (adEvery > 0 && (i + 1) % adEvery === 0 && i !== posts.length - 1) {
      out.push(
        <div
          key={`ad-${i}`}
          className="col-span-2 md:col-span-3 lg:col-span-4"
        >
          <AdSlot id={`infeed-${Math.floor(i / adEvery)}`} size="in-article" />
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
