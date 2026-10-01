"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { MONETAG_ENABLED, TABUNDER_URL } from "@/lib/monetag";

const BLOCKED_PREFIXES = ["/admin", "/login", "/account"];
const DONE_KEY = "dc_tabunder_done";

function alreadyDone(): boolean {
  try {
    return sessionStorage.getItem(DONE_KEY) === "1";
  } catch {
    return false;
  }
}

function markDone() {
  try {
    sessionStorage.setItem(DONE_KEY, "1");
  } catch {
    /* private mode — worst case it can fire once more */
  }
}

/**
 * Mobile tab-under, once per session. On the visitor's first tap on an
 * internal link, that link opens in a NEW tab (which the browser brings to
 * the front) and this tab navigates to the Monetag Direct Link behind it —
 * so they keep browsing and the ad waits in the background tab.
 *
 * Same exclusions as the other ad scripts: never on admin/login/account and
 * never for signed-in staff. If the browser blocks the new tab, the tap just
 * navigates normally.
 */
export default function MonetagTabUnder() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const role = session?.user?.role;
  const isStaff = role === "ADMIN" || role === "EDITOR";

  useEffect(() => {
    if (!MONETAG_ENABLED || !TABUNDER_URL) return;
    if (status === "loading" || isStaff) return;
    if (BLOCKED_PREFIXES.some((p) => pathname?.startsWith(p))) return;
    if (alreadyDone()) return;

    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (alreadyDone()) return;

      const a = (e.target as Element | null)?.closest?.("a[href]") as
        | HTMLAnchorElement
        | null;
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download"))
        return;

      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return; // only internal links
      if (BLOCKED_PREFIXES.some((p) => url.pathname.startsWith(p))) return;

      const w = window.open(url.href, "_blank");
      if (!w) return; // blocked — let the link navigate normally
      try {
        w.opener = null;
      } catch {
        /* ignore */
      }
      e.preventDefault();
      e.stopPropagation(); // keep Next's <Link> from also routing this tab
      markDone();
      window.location.href = TABUNDER_URL;
    }

    // Capture phase so we run before Next.js <Link>'s own click handler.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname, isStaff, status]);

  return null;
}
