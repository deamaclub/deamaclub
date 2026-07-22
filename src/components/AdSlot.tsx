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
  | "interstitial";

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
    its content height and grow the iframe as the ad fills in). */
function AdsterraNative({ minHeight }: { minHeight: number }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [h, setH] = useState(minHeight);

  useEffect(() => {
    const iframe = ref.current;
    if (!iframe) return;
    let ro: ResizeObserver | null = null;

    function sync() {
      try {
        const doc = iframe!.contentDocument;
        const sh = doc?.body?.scrollHeight ?? 0;
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
    setIsDesktop(window.innerWidth >= 768);
    setMounted(true);
  }, []);

  // Disabled → render nothing (keeps layout clean when ads are off).
  if (!ADSTERRA_ENABLED) return null;

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
