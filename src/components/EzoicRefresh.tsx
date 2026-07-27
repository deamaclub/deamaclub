"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { EZOIC_ACTIVE } from "@/lib/ads";

/**
 * Fires Ezoic's showAds() once per pageview.
 *
 * The App Router changes pages without a full reload, so Ezoic never sees a
 * new pageview on its own. Their Dynamic Content guide requires re-calling
 * showAds() on each navigation; called with no arguments it refreshes every
 * placeholder currently in the DOM, plus the anchor and video units.
 *
 * Mounted once in the root layout.
 */
export default function EzoicRefresh() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!EZOIC_ACTIVE) return;
    // Defer a tick so this pageview's placeholder divs are committed to the
    // DOM before Ezoic scans for them.
    const t = setTimeout(() => {
      try {
        window.ezstandalone = window.ezstandalone || ({} as never);
        window.ezstandalone!.cmd = window.ezstandalone!.cmd || [];
        window.ezstandalone!.cmd.push(() => {
          window.ezstandalone?.showAds();
        });
      } catch {
        /* ad script blocked or not loaded */
      }
    }, 0);
    return () => clearTimeout(t);
  }, [pathname, searchParams]);

  return null;
}
