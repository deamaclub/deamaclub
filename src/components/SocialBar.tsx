"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ADSTERRA_ENABLED, SOCIALBAR_URL } from "@/lib/adsterra";

/**
 * Adsterra Social Bar — a site-wide floating overlay. Loads once, not
 * per-slot. Kept off admin/login/account so it never covers the dashboard
 * or auth flows.
 */
export default function SocialBar() {
  const pathname = usePathname();

  useEffect(() => {
    if (!ADSTERRA_ENABLED) return;
    const blocked =
      pathname?.startsWith("/admin") ||
      pathname?.startsWith("/login") ||
      pathname?.startsWith("/account");
    if (blocked) return;
    if (document.getElementById("adsterra-socialbar")) return;

    const s = document.createElement("script");
    s.id = "adsterra-socialbar";
    s.src = SOCIALBAR_URL;
    s.async = true;
    document.body.appendChild(s);
  }, [pathname]);

  return null;
}
