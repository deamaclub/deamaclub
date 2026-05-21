"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
 * Embedded iframe player (Bunny / YouTube) or HTML5 video.
 *
 * For Bunny Stream embeds we speak Player.js (the spec Bunny + many
 * other embed providers implement). The protocol:
 *
 *   1. Iframe sends { context: 'player.js', event: 'ready' } on load
 *   2. Parent replies with { context: 'player.js', method:
 *      'addEventListener', value: 'ended' } per event it wants
 *   3. Iframe then emits { context: 'player.js', event: 'ended' } when
 *      the video finishes
 *
 * Some integrations don't emit 'ready' before the parent attaches a
 * listener, so we also send the addEventListener proactively when the
 * iframe's `load` event fires AND retry once shortly after.
 *
 * For HTML5 <video>, we just listen to the native 'ended' event.
 */
export default function VideoPlayer({
  postId,
  embedUrl,
  videoUrl,
  thumbnailUrl,
  title,
  relatedPosts = [],
}: VideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
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

  const subscribe = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow) return;
    const msg = JSON.stringify({
      context: "player.js",
      version: "0.0.7",
      method: "addEventListener",
      value: "ended",
      listener: "deamaclub-ended",
    });
    try {
      iframe.contentWindow.postMessage(msg, "*");
    } catch {
      /* cross-origin restrictions — swallow */
    }
  }, []);

  // Iframe `ended` handshake
  useEffect(() => {
    if (!embedUrl) return;

    function onMessage(event: MessageEvent) {
      let data: unknown = event.data;
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch {
          // Plain string event (some old protocols) — best-effort
          if (event.data === "ended") setShowEndScreen(true);
          return;
        }
      }
      if (!data || typeof data !== "object") return;
      const d = data as {
        context?: string;
        event?: string;
        value?: string;
        method?: string;
        data?: { event?: string };
      };

      // Player.js — Bunny + many others
      if (d.context === "player.js") {
        if (d.event === "ready") {
          // iframe is up — subscribe now
          subscribe();
        }
        if (d.event === "ended") {
          setShowEndScreen(true);
        }
        return;
      }

      // YouTube embed (uses postMessage with state object)
      if (d.event === "onStateChange" && d.data?.event === undefined) {
        // YouTube sends { event: 'onStateChange', info: 0 } where 0 = ended
        const yt = data as unknown as { info?: number };
        if (yt.info === 0) setShowEndScreen(true);
      }
      // Generic fallbacks
      if (d.event === "ended" || d.value === "ended") {
        setShowEndScreen(true);
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [embedUrl, subscribe]);

  // Proactive subscribe attempts (in case 'ready' was emitted before
  // our listener attached, or the player doesn't emit one).
  useEffect(() => {
    if (!embedUrl) return;
    const t1 = setTimeout(subscribe, 800);
    const t2 = setTimeout(subscribe, 2500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [embedUrl, subscribe]);

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
          ref={iframeRef}
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          onLoad={subscribe}
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
