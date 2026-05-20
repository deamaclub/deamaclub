import { formatDistanceToNowStrict } from "date-fns";

export function timeAgo(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return `${formatDistanceToNowStrict(d, { addSuffix: false })} ago`;
}

export function formatViews(n: number): string {
  if (n < 1000) return n.toString();
  if (n < 1_000_000) return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0)}K`;
  return `${(n / 1_000_000).toFixed(n < 10_000_000 ? 1 : 0)}M`;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export function absoluteUrl(path: string = ""): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL || "https://deamaclub.com";
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Light-touch hashing of an IP for dedup purposes only.
 * Not for cryptographic security — privacy hygiene.
 */
export async function hashIp(ip: string): Promise<string> {
  const buf = new TextEncoder().encode(
    `${ip}::${process.env.VIEW_HASH_SALT || "deamaclub"}`
  );
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}
