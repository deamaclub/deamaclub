"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import {
  EXOCLICK_ENABLED,
  EXO_INS_CLASS,
  EXO_INTERSTITIAL_ZONE,
  EXO_PROVIDER_URL,
} from "@/lib/exoclick";

declare global {
  interface Window {
    AdProvider?: Array<Record<string, unknown>>;
  }
}

const BLOCKED_PREFIXES = ["/admin", "/login", "/account"];
const SCRIPT_ID = "exo-ad-provider";
const INS_ID = "exo-interstitial";

/**
 * ExoClick Mobile Fullpage Interstitial — the zone's three-part tag
 * (<script ad-provider.js>, <ins data-zoneid>, AdProvider.push serve),
 * injected once, on phones only. Same exclusions as the other ad scripts:
 * never on admin/login/account and never for signed-in staff.
 */
export default function ExoInterstitial() {
  const pathname = usePathname();
  const isDesktop = useIsDesktop();
  const { data: session, status } = useSession();
  const role = session?.user?.role;
  const isStaff = role === "ADMIN" || role === "EDITOR";

  useEffect(() => {
    if (!EXOCLICK_ENABLED || isDesktop !== false) return;
    // Wait for the session: injecting before the staff check would arm the
    // interstitial on an admin's link clicks.
    if (status === "loading") return;

    const blocked =
      isStaff || BLOCKED_PREFIXES.some((p) => pathname?.startsWith(p));
    if (blocked) {
      document.getElementById(INS_ID)?.remove();
      document.getElementById(SCRIPT_ID)?.remove();
      return;
    }
    if (document.getElementById(INS_ID)) return;

    const ins = document.createElement("ins");
    ins.id = INS_ID;
    ins.className = EXO_INS_CLASS;
    ins.dataset.zoneid = EXO_INTERSTITIAL_ZONE;
    document.body.appendChild(ins);

    if (!document.getElementById(SCRIPT_ID)) {
      const s = document.createElement("script");
      s.id = SCRIPT_ID;
      s.async = true;
      s.type = "application/javascript";
      s.src = EXO_PROVIDER_URL;
      document.body.appendChild(s);
    }

    // Queues until ad-provider.js loads, then serves every <ins> on the page.
    (window.AdProvider = window.AdProvider || []).push({ serve: {} });
  }, [pathname, isDesktop, isStaff, status]);

  return null;
}
