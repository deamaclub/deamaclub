"use client";

import { useAdScript } from "@/hooks/useAdScript";
import { POPUNDER_ENABLED, POPUNDER_URL } from "@/lib/adsterra";
import { ADSTERRA_ACTIVE } from "@/lib/ads";

/**
 * Adsterra Popunder — site-wide, loads once. Opens a background tab on a
 * visitor's click, so it's kept off admin/login/account and off signed-in
 * staff sessions entirely (see useAdScript).
 *
 * Off switch: set NEXT_PUBLIC_POPUNDER_ENABLED=0 and redeploy.
 */
export default function Popunder() {
  useAdScript(
    "adsterra-popunder",
    POPUNDER_URL,
    POPUNDER_ENABLED && ADSTERRA_ACTIVE
  );
  return null;
}
