"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { EZOIC_PLACEHOLDERS } from "@/lib/ads";

declare global {
  interface Window {
    ezstandalone?: {
      cmd: Array<() => void>;
      showAds: (...ids: number[]) => void;
      destroyPlaceholders: (...ids: number[]) => void;
      destroyAll: () => void;
    };
  }
}

/**
 * One Ezoic ad position. Renders the placeholder div Ezoic fills; the actual
 * fill call is made by <EzoicRefresh /> once per pageview so a single
 * showAds() covers every placeholder on the page.
 *
 * `id` is our internal slot name (e.g. "infeed") — mapped to the numeric
 * Ezoic placeholder that must also exist in the Ezoic dashboard.
 */
export default function EzoicAd({
  id,
  className = "",
}: {
  id: string;
  className?: string;
}) {
  const num = EZOIC_PLACEHOLDERS[id];
  const pathname = usePathname();

  // Placeholders must be torn down when this slot leaves the page, or Ezoic
  // sees a stale/duplicate ID and fill becomes unpredictable.
  useEffect(() => {
    if (!num) return;
    return () => {
      try {
        window.ezstandalone?.cmd.push(() => {
          window.ezstandalone?.destroyPlaceholders(num);
        });
      } catch {
        /* ad script not loaded — nothing to tear down */
      }
    };
  }, [num, pathname]);

  if (!num) return null;

  return (
    <div
      id={`ezoic-pub-ad-placeholder-${num}`}
      data-ad-zone={id}
      data-ad-provider="ezoic"
      className={className}
    />
  );
}
