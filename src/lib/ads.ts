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
  (process.env.NEXT_PUBLIC_AD_PROVIDER as AdProvider) || "ezoic";

export const ADSTERRA_ACTIVE = AD_PROVIDER === "adsterra";
export const EZOIC_ACTIVE = AD_PROVIDER === "ezoic";

/**
 * Ship Ezoic's header scripts even while another network is still serving.
 *
 * Ezoic's dashboard can't approve a site it can't detect, and detection is
 * just "is sa.min.js in the <head>". Without this, the provider switch above
 * hides the scripts and the dashboard sits on "This site is not integrated
 * yet" forever — while Adsterra keeps earning. This lets onboarding finish
 * without a revenue gap.
 *
 * Ezoic serves no ads until the account is approved AND placeholders exist,
 * so this only makes the site detectable. Turn off with
 * NEXT_PUBLIC_EZOIC_DETECT=0.
 */
export const EZOIC_DETECT = process.env.NEXT_PUBLIC_EZOIC_DETECT !== "0";

/** Render the Ezoic <head> scripts? (live provider, or onboarding detection) */
export const EZOIC_SCRIPTS = EZOIC_ACTIVE || EZOIC_DETECT;

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
