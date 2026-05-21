"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface RelatedPostStub {
  slug: string;
  title: string;
  thumbnailUrl: string | null;
}

interface VideoPlayerProps {
  postId: string;
  embedUrl?: string | null;
  videoUrl?: string | null;
  thumbnailUrl?: string | null;
  title: string;
  relatedPosts?: RelatedPostStub[];
}

/**
 * Embedded iframe player (Bunny / YouTube / etc.) or HTML5 video.
 *
 * After playback ends, an overlay covers the player area with 2
 * clickable thumbnails for the next videos. For Bunny / YouTube the
 * `ended` event arrives via postMessage from the iframe (Player.js
 * protocol Bunny uses). For HTML5 video we listen on the element.
 *
 * Also fires a deduplicated view-increment to /api/views after a
 * 3.5s dwell so passive crawlers don't inflate counts.
 */
export default function VideoPlayer({
  postId,
  embedUrl,
  videoUrl,
  thumbnailUrl,
  title,
  relatedPosts = [],
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [showEndScreen, setShowEndScreen] = useState(false);

  // View ping (3.5s dwell)
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

  // Iframe `ended` listener (Player.js / Bunny / YouTube postMessage)
  useEffect(() => {
    if (!embedUrl) return;
    function onMessage(event: MessageEvent) {
      // Accept events from common embed origins only
      const allowed = [
        "https://iframe.mediadelivery.net",
        "https://www.youtube.com",
        "https://www.youtube-nocookie.com",
      ];
      if (!allowed.includes(event.origin)) return;

      // Bunny + most Player.js-compatible players send strings; some send objects
      let data: unknown = event.data;
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch {
          // Plain string — only act if it looks like 'ended'
          if (event.data === "ended") setShowEndScreen(true);
          return;
        }
      }
      if (data && typeof data === "object") {
        const d = data as { event?: string; value?: string; method?: string };
        if (
          d.event === "ended" ||
          d.value === "ended" ||
          (d.method === "event" && d.value === "ended")
        ) {
          setShowEndScreen(true);
        }
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [embedUrl]);

  // HTML5 video `ended` listener
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    function onEnded() {
      setShowEndScreen(true);
    }
    v.addEventListener("ended", onEnded);
    return () => v.removeEventListener("ended", onEnded);
  }, [videoUrl]);

  const canShowOverlay = showEndScreen && relatedPosts.length > 0;

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
          ref={videoRef}
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

      {canShowOverlay && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col p-4 md:p-6 z-10">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-widest text-deama-gold-bright font-bold">
              Up next
            </p>
            <button
              type="button"
              onClick={() => setShowEndScreen(false)}
              className="text-xs text-white/70 hover:text-white underline"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 flex-1 min-h-0">
            {relatedPosts.slice(0, 2).map((p) => (
              <Link
                key={p.slug}
                href={`/video/${p.slug}`}
                className="group relative bg-deama-ink border border-deama-border rounded overflow-hidden hover:border-deama-red transition-colors flex flex-col"
              >
                <div className="relative flex-1 min-h-0 bg-deama-black">
                  {p.thumbnailUrl ? (
                    <Image
                      src={p.thumbnailUrl}
                      alt={p.title}
                      fill
                      sizes="(max-width: 768px) 50vw, 320px"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0" />
                  )}
                </div>
                <div className="p-2 md:p-3">
                  <p className="text-xs md:text-sm font-semibold text-white line-clamp-2 leading-snug">
                    {p.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
