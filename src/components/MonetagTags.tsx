"use client";

import { useAdScript } from "@/hooks/useAdScript";
import { MONETAG_ENABLED, MONETAG_TAGS, type MonetagTag } from "@/lib/monetag";

/**
 * Loads each enabled Monetag format once, site-wide. Goes through
 * useAdScript so none of them run on admin/login/account or for signed-in
 * staff sessions. Which formats are on lives in src/lib/monetag.ts.
 */
export default function MonetagTags() {
  return (
    <>
      {MONETAG_TAGS.map((tag) => (
        <MonetagScript key={tag.id} tag={tag} />
      ))}
    </>
  );
}

function MonetagScript({ tag }: { tag: MonetagTag }) {
  useAdScript(tag.id, tag.url, MONETAG_ENABLED, tag.dataset);
  return null;
}
