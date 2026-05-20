import Link from "next/link";
import Image from "next/image";
import { Eye, Clock } from "lucide-react";
import { formatViews, timeAgo } from "@/lib/utils";

export interface VideoCardData {
  slug: string;
  title: string;
  thumbnailUrl: string | null;
  category: { name: string; slug: string };
  viewCount: number;
  publishedAt: Date | string | null;
  durationSec?: number | null;
}

function formatDuration(s?: number | null) {
  if (!s) return null;
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function VideoCard({
  post,
  priority = false,
  size = "md",
}: {
  post: VideoCardData;
  priority?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const duration = formatDuration(post.durationSec);
  const sizing =
    size === "lg"
      ? "text-base md:text-lg"
      : size === "sm"
      ? "text-xs"
      : "text-sm";

  return (
    <Link
      href={`/video/${post.slug}`}
      className="group block bg-deama-ink border border-deama-border rounded-lg overflow-hidden hover:border-deama-red transition-colors"
    >
      <div className="relative aspect-video bg-deama-black">
        {post.thumbnailUrl ? (
          <Image
            src={post.thumbnailUrl}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            priority={priority}
            className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-deama-muted text-xs">
            no thumbnail
          </div>
        )}
        <span className="absolute top-2 left-2 bg-deama-red text-white text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded">
          {post.category.name}
        </span>
        {duration && (
          <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[11px] font-mono px-1.5 py-0.5 rounded">
            {duration}
          </span>
        )}
      </div>
      <div className="p-3">
        <h3
          className={`${sizing} font-semibold leading-snug line-clamp-2 group-hover:text-deama-gold-bright transition-colors`}
        >
          {post.title}
        </h3>
        <div className="flex items-center gap-3 text-[11px] text-deama-muted mt-2">
          <span className="inline-flex items-center gap-1">
            <Eye size={12} /> {formatViews(post.viewCount)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock size={12} /> {timeAgo(post.publishedAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}
