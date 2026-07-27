"use client";

import { useEffect, useState } from "react";
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
  const [unfilled, setUnfilled] = useState(false);

  // Ezoic fires ezSlotComplete when it's done trying to fill a slot. If it
  // came back empty, collapse the box so we don't leave a hole in the grid
  // (matters while the account is still in review and nothing fills).
  useEffect(() => {
    if (!num) return;
    setUnfilled(false);
    function onComplete(e: Event) {
      const d = (e as CustomEvent).detail as
        | { id?: number; placeholderId?: number; filled?: boolean }
        | undefined;
      if (!d) return;
      const slot = d.id ?? d.placeholderId;
      if (slot === num && d.filled === false) setUnfilled(true);
    }
    window.addEventListener("ezSlotComplete", onComplete);
    return () => window.removeEventListener("ezSlotComplete", onComplete);
  }, [num, pathname]);

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
      // Stays in the DOM either way — Ezoic must be able to find the
      // placeholder — but takes up no space until it actually fills.
      className={unfilled ? "hidden" : className}
    />
  );
}
