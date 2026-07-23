"use client";

import { useEffect, useRef, useState } from "react";
import {
  ADSTERRA_ENABLED,
  BANNER_DESKTOP_KEY,
  BANNER_MOBILE_KEY,
  NATIVE_KEY,
  NATIVE_URL,
} from "@/lib/adsterra";

type AdSize =
  | "leaderboard"
  | "rectangle"
  | "halfpage"
  | "sidebar"
  | "mobile-banner"
  | "in-article"
  | "card"
  | "grid-card"
  | "interstitial";

// Card-shaped ad box that mirrors a VideoCard's footprint: ~320px wide.
// CARD_H is the reserved starting height; CARD_MAX_H caps a full multi-item
// widget (e.g. a 2x2 = two rows of tiles) so it can't balloon into a tower.
const CARD_MAX_W = 340;
const CARD_H = 190;
const CARD_MAX_H = 520;
// Mobile in-feed card height (matches a video card ~180px).
const GRID_CARD_MOBILE_H = 190;

interface AdSlotProps {
  id: string;
  size: AdSize;
  className?: string;
}

const SANDBOX =
  "allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox";

/** Isolated document for a banner unit (atOptions loader). */
function bannerSrcDoc(key: string, w: number, h: number): string {
  return `<!doctype html><html><head><meta charset="utf-8"><style>*{margin:0;padding:0}html,body{overflow:hidden;background:transparent}</style></head><body><script type="text/javascript">atOptions={'key':'${key}','format':'iframe','height':${h},'width':${w},'params':{}};<\/script><script type="text/javascript" src="https://www.highperformanceformat.com/${key}/invoke.js"><\/script></body></html>`;
}

/** Isolated document for the native banner unit. */
function nativeSrcDoc(): string {
  return `<!doctype html><html><head><meta charset="utf-8"><style>*{margin:0;padding:0}html,body{background:transparent}</style></head><body><script async="async" data-cfasync="false" src="${NATIVE_URL}"><\/script><div id="container-${NATIVE_KEY}"></div></body></html>`;
}

/** Fixed-size banner (728x90 desktop or 320x50 mobile). */
function AdsterraBanner({ variant }: { variant: "desktop" | "mobile" }) {
  const key = variant === "desktop" ? BANNER_DESKTOP_KEY : BANNER_MOBILE_KEY;
  const w = variant === "desktop" ? 728 : 320;
  const h = variant === "desktop" ? 90 : 50;
  return (
    <iframe
      title="Advertisement"
      aria-label="Advertisement"
      srcDoc={bannerSrcDoc(key, w, h)}
      width={w}
      height={h}
      scrolling="no"
      sandbox={SANDBOX}
      style={{
        border: 0,
        width: w,
        height: h,
        maxWidth: "100%",
        display: "block",
      }}
    />
  );
}

/** Native banner with auto-height (srcDoc is same-origin, so we can read
    its content height and grow the iframe as the ad fills in). A maxHeight
    clamp prevents a runaway layout from ballooning into a tower. */
function AdsterraNative({
  minHeight,
  maxHeight,
}: {
  minHeight: number;
  maxHeight?: number;
}) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [h, setH] = useState(minHeight);

  useEffect(() => {
    const iframe = ref.current;
    if (!iframe) return;
    let ro: ResizeObserver | null = null;

    function sync() {
      try {
        const doc = iframe!.contentDocument;
        const raw = doc?.body?.scrollHeight ?? 0;
        const sh = maxHeight ? Math.min(raw, maxHeight) : raw;
        if (sh > 10) setH((prev) => (Math.abs(prev - sh) > 2 ? sh : prev));
      } catch {
        /* cross-origin — shouldn't happen with srcDoc, but be safe */
      }
    }

    function attach() {
      try {
        const body = iframe!.contentDocument?.body;
        if (body && "ResizeObserver" in window) {
          ro = new ResizeObserver(sync);
          ro.observe(body);
        }
      } catch {
        /* ignore */
      }
      sync();
    }

    iframe.addEventListener("load", attach);
    // The ad fills asynchronously; poll for the first ~10s to catch it.
    let n = 0;
    const poll = setInterval(() => {
      sync();
      if (++n > 20) clearInterval(poll);
    }, 500);

    return () => {
      iframe.removeEventListener("load", attach);
      ro?.disconnect();
      clearInterval(poll);
    };
  }, []);

  return (
    <iframe
      ref={ref}
      title="Advertisement"
      aria-label="Advertisement"
      srcDoc={nativeSrcDoc()}
      scrolling="no"
      sandbox={SANDBOX}
      style={{ border: 0, width: "100%", height: h, display: "block" }}
    />
  );
}

export default function AdSlot({ id, size, className = "" }: AdSlotProps) {
  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mq.matches);
    setMounted(true);
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Disabled → render nothing (keeps layout clean when ads are off).
  if (!ADSTERRA_ENABLED) return null;

  // Card-shaped slot (detail-page in-article): a card-styled, ~card-width
  // box that auto-heights to show ALL of the native widget's items (e.g. a
  // 2x2 renders as 4 tiles), capped so it can't tower.
  if (size === "card") {
    return (
      <div
        data-ad-zone={id}
        data-ad-size={size}
        className={`mx-auto w-full overflow-hidden rounded-lg border border-deama-border bg-deama-ink ${className}`}
        style={{ maxWidth: CARD_MAX_W }}
      >
        {mounted && <AdsterraNative minHeight={CARD_H} maxHeight={CARD_MAX_H} />}
      </div>
    );
  }

  // Grid-card slot (homepage in-feed). Adsterra's native only lays out
  // multiple columns when the container is wide enough (~440px+):
  //   • Desktop: the slot spans 2 grid columns, so a 2x2 renders as a real
  //     2x2 grid — auto-height shows all tiles.
  //   • Mobile: too narrow for 2 columns (Adsterra would stack items into a
  //     tall tower), so we show it as ONE clean card matching a video card.
  if (size === "grid-card") {
    return (
      <div
        data-ad-zone={id}
        data-ad-size={size}
        className={`w-full overflow-hidden rounded-lg border border-deama-border bg-deama-ink ${className}`}
        style={isDesktop ? undefined : { height: GRID_CARD_MOBILE_H }}
      >
        {mounted &&
          (isDesktop ? (
            <AdsterraNative minHeight={190} maxHeight={CARD_MAX_H} />
          ) : (
            <iframe
              title="Advertisement"
              aria-label="Advertisement"
              srcDoc={nativeSrcDoc()}
              scrolling="no"
              sandbox={SANDBOX}
              style={{
                border: 0,
                width: "100%",
                height: "100%",
                display: "block",
              }}
            />
          ))}
      </div>
    );
  }

  const reserve =
    size === "leaderboard"
      ? isDesktop
        ? 90
        : 50
      : size === "mobile-banner"
      ? 50
      : 120;

  let inner: React.ReactNode = null;
  if (mounted) {
    if (size === "leaderboard") {
      inner = <AdsterraBanner variant={isDesktop ? "desktop" : "mobile"} />;
    } else if (size === "mobile-banner") {
      inner = <AdsterraBanner variant="mobile" />;
    } else {
      // rectangle, halfpage, sidebar, in-article, interstitial → native
      inner = <AdsterraNative minHeight={reserve} />;
    }
  }

  return (
    <div
      data-ad-zone={id}
      data-ad-size={size}
      className={`w-full flex items-center justify-center overflow-hidden ${className}`}
      style={{ minHeight: reserve }}
    >
      {inner}
    </div>
  );
}
