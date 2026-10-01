"use client";

import { useAdScript } from "@/hooks/useAdScript";
import { MONETAG_ENABLED, MULTITAG_URL, MULTITAG_ZONE } from "@/lib/monetag";

// Module-level so the object is stable across renders (it's an effect dep).
const DATASET = { zone: MULTITAG_ZONE, cfasync: "false" };

/**
 * Monetag Multitag — site-wide, loads once. Carries a popunder, so it goes
 * through useAdScript to stay off admin/login/account and off signed-in
 * staff sessions.
 */
export default function MonetagMultitag() {
  useAdScript("monetag-multitag", MULTITAG_URL, MONETAG_ENABLED, DATASET);
  return null;
}
