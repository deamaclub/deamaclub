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

  // An empty placeholder still occupies its grid cell, which leaves a
  // card-shaped hole in the video grid — very visible while the account is
  // in review and nothing fills. So: collapse the box unless it has content.
  //
  // Two signals, because Ezoic only emits the event once it's actually
  // serving: (1) ezSlotComplete with filled:false, and (2) a plain "still
  // empty after a few seconds" check. Both are reversible — a MutationObserver
  // re-shows the slot the moment Ezoic injects anything into it.
  useEffect(() => {
    if (!num) return;
    setUnfilled(false);

    const el = document.getElementById(`ezoic-pub-ad-placeholder-${num}`);
    if (!el) return;

    const hasContent = () => el.childNodes.length > 0;

    function onComplete(e: Event) {
      const d = (e as CustomEvent).detail as
        | { id?: number; placeholderId?: number; filled?: boolean }
        | undefined;
      if (!d) return;
      const slot = d.id ?? d.placeholderId;
      if (slot === num && d.filled === false && !hasContent()) setUnfilled(true);
    }
    window.addEventListener("ezSlotComplete", onComplete);

    // Un-collapse as soon as Ezoic puts an ad in the box.
    const mo = new MutationObserver(() => {
      if (hasContent()) setUnfilled(false);
    });
    mo.observe(el, { childList: true });

    // Fallback for accounts not yet serving: no ad after 5s → take up no space.
    const t = setTimeout(() => {
      if (!hasContent()) setUnfilled(true);
    }, 5000);

    return () => {
      window.removeEventListener("ezSlotComplete", onComplete);
      mo.disconnect();
      clearTimeout(t);
    };
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
