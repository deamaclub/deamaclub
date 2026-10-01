/**
 * Monetag configuration.
 *
 * ONE loader only: the Multitag ("Perfect tag", zone 285494). It serves all
 * four formats from a single script, using these sub-zones in the Monetag
 * dashboard:
 *
 *   11876047  OnClick (Popunder)
 *   11876048  In-Page Push
 *   11876049  Vignette Banner
 *   11876050  Push Notifications  ← also referenced by public/sw.js
 *
 * Do NOT add the standalone format tags (5gvci / nap5k / al5sm) next to it —
 * they duplicate the Multitag's formats (double popunders, double push
 * prompts) and compete with it for the same impression.
 *
 * Site-ownership is verified by the <meta name="monetag"> in the root layout,
 * which stays in the static HTML independently of this switch.
 *
 * Off switch: NEXT_PUBLIC_MONETAG_ENABLED=0, then rebuild (NEXT_PUBLIC_* is
 * inlined at build time). public/sw.js keeps working for already-subscribed
 * push users either way.
 */
export const MONETAG_ENABLED =
  process.env.NEXT_PUBLIC_MONETAG_ENABLED !== "0";

export const MULTITAG_URL = "https://quge5.com/88/tag.min.js";
export const MULTITAG_ZONE = "285494";
