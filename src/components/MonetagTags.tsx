"use client";

import { useAdScript } from "@/hooks/useAdScript";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import { MONETAG_ENABLED, MONETAG_TAGS, type MonetagTag } from "@/lib/monetag";

/**
 * Loads each enabled Monetag format once, site-wide. Goes through
 * useAdScript so none of them run on admin/login/account or for signed-in
 * staff sessions. Which formats are on lives in src/lib/monetag.ts.
 */
export default function MonetagTags() {
  const isDesktop = useIsDesktop();
  return (
    <>
      {MONETAG_TAGS.map((tag) => (
        <MonetagScript key={tag.id} tag={tag} isDesktop={isDesktop} />
      ))}
    </>
  );
}

function MonetagScript({
  tag,
  isDesktop,
}: {
  tag: MonetagTag;
  isDesktop: boolean | null;
}) {
  // desktopOnly tags wait until we know the device, then load on desktop only.
  const allowed = !tag.desktopOnly || isDesktop === true;
  useAdScript(tag.id, tag.url, MONETAG_ENABLED && allowed, tag.dataset);
  return null;
}
