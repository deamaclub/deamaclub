"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

/** Areas that must never carry ad overlays/popunders. */
const BLOCKED_PREFIXES = ["/admin", "/login", "/account"];

/**
 * Injects a site-wide third-party ad loader exactly once, and keeps it off
 * the admin/auth areas.
 *
 * Two layers, because these runtimes bind document-level click handlers that
 * outlive their own <script> tag:
 *
 *   1. Signed-in ADMIN/EDITOR sessions never get the script at all. This is
 *      the airtight guarantee for whoever runs the site — you can browse the
 *      public pages and then open the dashboard without ever arming a
 *      popunder.
 *   2. On a blocked route the tag is removed. The root layout never remounts
 *      during App Router soft navigation, so an early `return` on its own
 *      would leave a previously-injected loader live on /admin.
 */
export function useAdScript(id: string, url: string, enabled: boolean) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const role = session?.user?.role;
  const isStaff = role === "ADMIN" || role === "EDITOR";

  useEffect(() => {
    if (!enabled) return;
    // Wait until we know WHO this is. useSession starts as "loading" with a
    // null session, so injecting now would arm the loader on an admin before
    // the staff check below can ever run — and pulling the <script> back out
    // afterwards doesn't unbind handlers it already registered.
    if (status === "loading") return;

    const blocked =
      isStaff || BLOCKED_PREFIXES.some((p) => pathname?.startsWith(p));
    const existing = document.getElementById(id);

    if (blocked) {
      existing?.remove();
      return;
    }
    if (existing) return;

    const s = document.createElement("script");
    s.id = id;
    s.src = url;
    s.async = true;
    document.body.appendChild(s);
  }, [pathname, enabled, id, url, isStaff, status]);
}
