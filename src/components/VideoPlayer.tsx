"use client";

import { useEffect } from "react";

interface VideoPlayerProps {
  postId: string;
  embedUrl?: string | null;
  videoUrl?: string | null;
  thumbnailUrl?: string | null;
  title: string;
}

/**
 * Renders either an iframe embed (YouTube / Cloudflare Stream / etc.) or a
 * native HTML5 video element. Fires a single view-increment after a short
 * dwell so passive crawlers don't inflate counts.
 */
export default function VideoPlayer({
  postId,
  embedUrl,
  videoUrl,
  thumbnailUrl,
  title,
}: VideoPlayerProps) {
  useEffect(() => {
    const t = setTimeout(() => {
      fetch("/api/views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
        keepalive: true,
      }).catch(() => {});
    }, 3500);
    return () => clearTimeout(t);
  }, [postId]);

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border border-deama-border">
      {embedUrl ? (
        <iframe
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          className="absolute inset-0 w-full h-full"
        />
      ) : videoUrl ? (
        <video
          src={videoUrl}
          poster={thumbnailUrl || undefined}
          controls
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-deama-muted">
          Video unavailable.
        </div>
      )}
    </div>
  );
}
