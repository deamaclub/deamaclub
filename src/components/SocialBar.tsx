"use client";

import { useAdScript } from "@/hooks/useAdScript";
import { ADSTERRA_ENABLED, SOCIALBAR_URL } from "@/lib/adsterra";

/**
 * Adsterra Social Bar — a site-wide floating overlay. Loads once, not
 * per-slot. Kept off admin/login/account (and off signed-in staff sessions)
 * so it never covers the dashboard or auth flows.
 */
export default function SocialBar() {
  useAdScript("adsterra-socialbar", SOCIALBAR_URL, ADSTERRA_ENABLED);
  return null;
}
