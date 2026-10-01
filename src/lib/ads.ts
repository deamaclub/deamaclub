/**
 * Which ad network is live.
 *
 * Ezoic requires that no other network's ad code runs on the page ("remove any
 * leftover ad code from other ad networks"), so this is a hard switch — never
 * run both at once.
 *
 *   NEXT_PUBLIC_AD_PROVIDER=monetag    (default — Monetag only: no in-page
 *                                       ad boxes; Monetag's own formats
 *                                       float over the page, see monetag.ts)
 *   NEXT_PUBLIC_AD_PROVIDER=adsterra   (Adsterra banner/native slots)
 *   NEXT_PUBLIC_AD_PROVIDER=ezoic      (Ezoic placeholders)
 *   NEXT_PUBLIC_AD_PROVIDER=none       (no slot ads)
 *
 * NEXT_PUBLIC_* is inlined at build time, so switching needs a redeploy
 * (./deploy.sh rebuilds).
 */
export type AdProvider = "monetag" | "adsterra" | "ezoic" | "none";

export const AD_PROVIDER: AdProvider =
  (process.env.NEXT_PUBLIC_AD_PROVIDER as AdProvider) || "monetag";

export const ADSTERRA_ACTIVE = AD_PROVIDER === "adsterra";
export const EZOIC_ACTIVE = AD_PROVIDER === "ezoic";

/** Does any network fill in-page ad boxes (banner strip, in-feed card…)?
    When false those boxes aren't rendered at all, so no empty gaps. */
export const SLOT_ADS = ADSTERRA_ACTIVE || EZOIC_ACTIVE;

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
 * so this only makes the site detectable. OFF by default (Monetag-only);
 * turn on with NEXT_PUBLIC_EZOIC_DETECT=1.
 */
export const EZOIC_DETECT = process.env.NEXT_PUBLIC_EZOIC_DETECT === "1";

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
