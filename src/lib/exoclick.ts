/**
 * ExoClick configuration.
 *
 * Mobile Fullpage Interstitial — zone 6045456 ("first"). A full-screen
 * overlay with a close button, triggered when a visitor taps an internal
 * link; they close it and stay on the site. Phones only: desktop gets the
 * Monetag popunder instead (see monetag.ts), so nobody gets both on one tap.
 *
 * Site ownership is verified by the meta tag in the root layout and
 * public/208f66bafe5be04226021fbc91c2400e.html.
 *
 * Off switch: NEXT_PUBLIC_EXOCLICK_ENABLED=0, then rebuild.
 */
export const EXOCLICK_ENABLED =
  process.env.NEXT_PUBLIC_EXOCLICK_ENABLED !== "0";

export const EXO_PROVIDER_URL = "https://a.pemsrv.com/ad-provider.js";
export const EXO_INS_CLASS = "eas6a97888e33";
export const EXO_INTERSTITIAL_ZONE = "6045456";
