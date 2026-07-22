/**
 * Adsterra ad unit configuration.
 *
 * These keys are public by nature — they're shipped in client-side JS to
 * every visitor — so committing them is fine.
 *
 * To DISABLE all Adsterra ads (e.g. once Mediavine approves), set
 *   NEXT_PUBLIC_ADSTERRA_ENABLED=0
 * in the environment and rebuild. Ad slots then render nothing.
 */

export const ADSTERRA_ENABLED =
  process.env.NEXT_PUBLIC_ADSTERRA_ENABLED !== "0";

// Banner units use the atOptions/highperformanceformat.com loader.
export const BANNER_DESKTOP_KEY = "9b3936cefe3847a3e726bb1f1fe4fafe"; // 728x90
export const BANNER_MOBILE_KEY = "ed4d79ea8ded284c8065d5d0138d388f"; // 320x50

// Native banner unit (effectivecpmnetwork loader + container div).
export const NATIVE_KEY = "82389c31a3f9573220ef2ffeded2866a";
export const NATIVE_URL =
  "https://pl30475619.effectivecpmnetwork.com/82389c31a3f9573220ef2ffeded2866a/invoke.js";

// Social Bar (site-wide floating overlay). Single script, no slot.
export const SOCIALBAR_URL =
  "https://pl30475620.effectivecpmnetwork.com/b3/2b/19/b32b19db51b88a83ec5504b0ff26d5db.js";
