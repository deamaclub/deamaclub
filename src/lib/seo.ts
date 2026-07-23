/**
 * Shared SEO derivation. Used by both the admin editor (live preview of the
 * auto-generated values) and the video page's server-side metadata, so the
 * preview always matches what actually ships.
 *
 * Every field is an OVERRIDE: if the post has an explicit value it wins;
 * otherwise we fall back to a smart value derived from title + description.
 */

/** Strip markdown image tokens and collapse whitespace to one line. */
function flatten(text: string | null | undefined): string {
  return (text || "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Meta description: an explicit override, else a trimmed excerpt of the
    description (word-boundary), else the title. */
export function resolveMetaDescription(
  override: string | null | undefined,
  description: string | null | undefined,
  title: string,
  max = 160
): string {
  const explicit = flatten(override);
  if (explicit) return explicit.length > max ? clip(explicit, max) : explicit;
  const body = flatten(description);
  if (!body) return title;
  return body.length > max ? clip(body, max) : body;
}

function clip(s: string, max: number): string {
  return s.slice(0, max - 1).replace(/\s+\S*$/, "") + "…";
}

/** SEO <title>: explicit override (used verbatim) or the post title. The
    second return flag tells the caller whether to treat it as absolute
    (bypassing the "%s | Deamaclub" template). */
export function resolveMetaTitle(
  override: string | null | undefined,
  title: string
): { value: string; absolute: boolean } {
  const explicit = (override || "").trim();
  if (explicit) return { value: explicit, absolute: true };
  return { value: title, absolute: false };
}

/** Keyword list: explicit comma-separated override, else derived from
    title + category + tags. Always de-duped, capped, non-empty. */
export function resolveKeywords(
  override: string | null | undefined,
  parts: {
    title: string;
    category?: string;
    tags?: string[];
  }
): string[] {
  const explicit = (override || "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  const base = explicit.length
    ? explicit
    : [
        parts.title,
        ...(parts.category ? [parts.category] : []),
        ...(parts.tags || []),
        "video",
        "deamaclub",
      ];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const k of base) {
    const key = k.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(k);
    }
  }
  return out.slice(0, 15);
}
