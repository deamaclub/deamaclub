"use client";

import { useEffect, useRef } from "react";

/**
 * Named ad placement zones.
 *
 * When AdSense is configured AND a per-zone slot ID env var is set, this
 * renders a real <ins class="adsbygoogle"> block and triggers
 * adsbygoogle.push({}). Otherwise it renders a sized placeholder so the
 * layout reserves space (low CLS) during development and before approval.
 *
 * Per-zone slot env var naming:
 *   zone id `leaderboard-top` → NEXT_PUBLIC_ADSENSE_SLOT_LEADERBOARD_TOP
 *   zone id `home-sidebar-1`  → NEXT_PUBLIC_ADSENSE_SLOT_HOME_SIDEBAR_1
 *
 * After Google approves the site, create an Ad Unit per zone in the AdSense
 * dashboard, copy the numeric slot ID, and set the matching env var.
 */

type AdSize =
  | "leaderboard"
  | "rectangle"
  | "halfpage"
  | "sidebar"
  | "mobile-banner"
  | "in-article"
  | "interstitial";

const SIZE_CLASSES: Record<AdSize, string> = {
  leaderboard: "min-h-[90px]",
  rectangle: "min-h-[250px]",
  halfpage: "min-h-[600px]",
  sidebar: "min-h-[600px]",
  "mobile-banner": "min-h-[50px] md:hidden",
  "in-article": "min-h-[280px]",
  interstitial: "min-h-[60px]",
};

interface AdSlotProps {
  id: string;
  size: AdSize;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

function envSlotId(zoneId: string): string | undefined {
  const key = `NEXT_PUBLIC_ADSENSE_SLOT_${zoneId
    .toUpperCase()
    .replace(/-/g, "_")}`;
  // NEXT_PUBLIC_* are inlined at build time, so this access works on the
  // client. We can't index `process.env` dynamically and have it bundled,
  // so we explicitly look it up here at runtime via the inlined values.
  return (process.env as Record<string, string | undefined>)[key];
}

export default function AdSlot({ id, size, className = "" }: AdSlotProps) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const slot = envSlotId(id);
  const insRef = useRef<HTMLModElement | null>(null);

  useEffect(() => {
    if (!client || !slot) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* swallow — AdSense will log to console itself */
    }
  }, [client, slot]);

  // Real ad: render the <ins> AdSense expects and let the loader script
  // (in app/layout) fill it. Sized via the same min-heights so CLS is low.
  if (client && slot) {
    return (
      <ins
        ref={insRef}
        data-ad-zone={id}
        data-ad-size={size}
        className={`adsbygoogle block w-full ${SIZE_CLASSES[size]} ${className}`}
        style={{ display: "block" }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={size === "in-article" ? "fluid" : "auto"}
        data-full-width-responsive="true"
      />
    );
  }

  // Placeholder (pre-approval, dev, or zones without a slot ID yet).
  return (
    <div
      data-ad-zone={id}
      data-ad-size={size}
      className={`w-full flex items-center justify-center text-deama-muted text-[10px] uppercase tracking-widest bg-deama-ink/60 border border-dashed border-deama-border rounded ${SIZE_CLASSES[size]} ${className}`}
    >
      <span aria-hidden>AD · {size}</span>
    </div>
  );
}
