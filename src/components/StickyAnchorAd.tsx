"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { ADSTERRA_ENABLED } from "@/lib/adsterra";
import { ADSTERRA_ACTIVE } from "@/lib/ads";
import AdSlot from "./AdSlot";

/**
 * Sticky bottom anchor ad — the format WSHH/AdSense sites pin to the bottom
 * of the viewport: 320x50 on mobile, 728x90 on desktop, labelled and
 * dismissible.
 *
 * Sits ABOVE the page but BELOW the Social Bar's z-index so it never covers
 * the Social Bar (which is the higher earner). Kept off admin/login/account.
 */
const BLOCKED_PREFIXES = ["/admin", "/login", "/account"];

export default function StickyAnchorAd() {
  const pathname = usePathname();
  const [closed, setClosed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  // A fresh route = a fresh impression, so un-dismiss on navigation.
  useEffect(() => setClosed(false), [pathname]);

  // Under Ezoic this stays off — Ezoic serves its own anchor unit.
  if (!ADSTERRA_ENABLED || !ADSTERRA_ACTIVE || !mounted || closed) return null;
  if (BLOCKED_PREFIXES.some((p) => pathname?.startsWith(p))) return null;

  return (
    <>
      {/* Spacer: the bar is fixed, so reserve real page height or it would
          sit on top of the footer. Must be >= the bar's rendered height
          (73px mobile / 113px desktop: banner + label + padding). */}
      <div aria-hidden className="h-[80px] md:h-[120px]" />
      <div
        className="fixed bottom-0 left-0 right-0 z-30 border-t border-deama-border bg-deama-black/95 backdrop-blur-sm"
        role="complementary"
        aria-label="Advertisement"
      >
        <div className="relative mx-auto flex max-w-3xl items-center justify-center px-2 py-1.5">
          <span className="absolute left-2 top-0.5 text-[9px] uppercase tracking-widest text-deama-muted">
            Sponsored
          </span>
          <button
            type="button"
            onClick={() => setClosed(true)}
            aria-label="Close advertisement"
            className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-deama-surface/90 p-1 text-deama-muted hover:text-deama-text"
          >
            <X size={13} />
          </button>
          <div className="pt-2.5">
            <AdSlot id="anchor-bottom" size="leaderboard" />
          </div>
        </div>
      </div>
    </>
  );
}
