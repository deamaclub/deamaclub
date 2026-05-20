import Link from "next/link";
import Image from "next/image";
import { Flame, Eye } from "lucide-react";
import { formatViews, timeAgo } from "@/lib/utils";
import type { VideoCardData } from "./VideoCard";

export default function TrendingHero({ posts }: { posts: VideoCardData[] }) {
  if (posts.length === 0) return null;
  const [lead, ...rest] = posts;

  return (
    <section aria-label="Trending" className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <Flame size={18} className="text-deama-red animate-pulse-red rounded-full" />
        <h2 className="font-display tracking-wider text-xl text-deama-gold-bright">
          TRENDING NOW
        </h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Link
          href={`/video/${lead.slug}`}
          className="group relative block aspect-video overflow-hidden rounded-lg border border-deama-border hover:border-deama-red transition-colors"
        >
          {lead.thumbnailUrl ? (
            <Image
              src={lead.thumbnailUrl}
              alt={lead.title}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
              className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 bg-deama-ink" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />
          <span className="absolute top-3 left-3 bg-deama-red text-white text-[11px] font-bold uppercase tracking-widest px-2 py-1 rounded">
            {lead.category.name}
          </span>
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
            <h3 className="font-display tracking-wide text-2xl md:text-3xl text-white leading-tight line-clamp-3">
              {lead.title}
            </h3>
            <div className="flex items-center gap-3 text-xs text-white/70 mt-2">
              <span className="inline-flex items-center gap-1">
                <Eye size={12} /> {formatViews(lead.viewCount)}
              </span>
              <span>{timeAgo(lead.publishedAt)}</span>
            </div>
          </div>
        </Link>

        <div className="grid grid-cols-2 gap-3">
          {rest.slice(0, 4).map((p) => (
            <Link
              key={p.slug}
              href={`/video/${p.slug}`}
              className="group relative block aspect-video overflow-hidden rounded-lg border border-deama-border hover:border-deama-red transition-colors"
            >
              {p.thumbnailUrl ? (
                <Image
                  src={p.thumbnailUrl}
                  alt={p.title}
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover group-hover:scale-[1.05] transition-transform duration-500"
                />
              ) : (
                <div className="absolute inset-0 bg-deama-ink" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              <span className="absolute top-1.5 left-1.5 bg-deama-red text-white text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded">
                {p.category.name}
              </span>
              <h4 className="absolute bottom-0 left-0 right-0 p-2 text-sm md:text-base font-semibold text-white line-clamp-2 leading-tight">
                {p.title}
              </h4>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
