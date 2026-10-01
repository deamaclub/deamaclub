/**
 * Monetag ad formats — one standalone zone per format.
 *
 * To turn a format OFF, comment out its line with // and redeploy.
 * To turn it back ON, remove the //.
 *
 * (We don't use the Multitag "Perfect tag" any more: it's a single script
 * whose formats Monetag picks server-side, so the popunder couldn't be
 * switched off from here.)
 *
 * Never run the Multitag alongside these — it duplicates the same formats.
 *
 * Push Notifications also needs public/sw.js, whose zoneId must match the
 * push zone below (11874384).
 *
 * Kill switch for everything: NEXT_PUBLIC_MONETAG_ENABLED=0, then rebuild
 * (NEXT_PUBLIC_* is inlined at build time).
 */
export const MONETAG_ENABLED =
  process.env.NEXT_PUBLIC_MONETAG_ENABLED !== "0";

export type MonetagTag = {
  id: string;
  url: string;
  /** data-* attributes the loader reads off its own <script> tag. */
  dataset?: Record<string, string>;
  /** Load only on desktop (mouse + wide screen), never on phones/tablets. */
  desktopOnly?: boolean;
};

export const MONETAG_TAGS: MonetagTag[] = [
  // Push Notifications — "Optimistic tag", zone 11874384
  { id: "monetag-push", url: "https://5gvci.com/act/files/tag.min.js?z=11874384", dataset: { cfasync: "false" } },

  // In-Page Push — "Magnificent tag", zone 11874231
  { id: "monetag-inpage", url: "https://nap5k.com/tag.min.js", dataset: { zone: "11874231" } },

  // OnClick (Popunder) — "Beautiful tag", zone 11874382. DESKTOP ONLY: on
  // desktop it opens behind the window; on phones there's no "behind", so it
  // would pull visitors off the site. Phones get the tab-under below instead.
  { id: "monetag-popunder", url: "https://al5sm.com/tag.min.js", dataset: { zone: "11874382" }, desktopOnly: true },

  // Vignette Banner — full-screen overlay with a close button. Needs its own
  // standalone zone (create one in Monetag → Add zone → Vignette Banner) and
  // its tag pasted here.
];

/**
 * Mobile tab-under (see components/MonetagTabUnder.tsx). On a visitor's
 * first internal link tap per session, the link opens in a NEW tab in front
 * and the tab they were on navigates to this ad URL behind it.
 *
 * Paste a Monetag Direct Link here (Monetag → Add zone → Direct Link).
 * Empty string = tab-under off.
 */
export const TABUNDER_URL = "";
