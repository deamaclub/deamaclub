/**
 * Which ad network is live.
 *
 * Ezoic requires that no other network's ad code runs on the page ("remove any
 * leftover ad code from other ad networks"), so this is a hard switch — never
 * run both at once.
 *
 *   NEXT_PUBLIC_AD_PROVIDER=adsterra   (default — current revenue)
 *   NEXT_PUBLIC_AD_PROVIDER=ezoic      (flip once Ezoic approves the site)
 *   NEXT_PUBLIC_AD_PROVIDER=none       (no ads at all)
 *
 * NEXT_PUBLIC_* is inlined at build time, so switching needs a redeploy
 * (./deploy.sh rebuilds).
 */
export type AdProvider = "adsterra" | "ezoic" | "none";

export const AD_PROVIDER: AdProvider =
  (process.env.NEXT_PUBLIC_AD_PROVIDER as AdProvider) || "adsterra";

export const ADSTERRA_ACTIVE = AD_PROVIDER === "adsterra";
export const EZOIC_ACTIVE = AD_PROVIDER === "ezoic";

/**
 * Ezoic placeholder IDs, one per ad position on the site. These must also
 * exist in the Ezoic dashboard (Ads → Placeholders) for ads to fill.
 */
export const EZOIC_PLACEHOLDERS: Record<string, number> = {
  "leaderboard-top": 101,
  infeed: 102,
  upnext: 103,
  "anchor-bottom": 104,
};
