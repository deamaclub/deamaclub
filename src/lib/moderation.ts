/**
 * Comment moderation helpers.
 *
 * BANNED_WORD_RE matches the N-word variants the site owner does not want
 * publicly visible. Comments that trigger this get flagged with
 * `hidden: true` in API responses; the client renders a "View hidden
 * message" placeholder that reveals the body and all replies on click.
 *
 * We keep the actual body available on the wire so the admin still sees
 * everything and can delete. Regular readers see the placeholder until
 * they explicitly opt in.
 */

const BANNED_WORD_RE = /\bnigger[s]?\b/i;

export function isCommentHidden(body: string): boolean {
  if (!body) return false;
  return BANNED_WORD_RE.test(body);
}
