"use client";

import { useEffect, useState } from "react";

/**
 * Renders the lead cells of the video grid — a handful of video cards plus ONE
 * in-feed ad — and places the ad in a RANDOM slot on every page load.
 *
 * The grid parent is a normal CSS grid (2 cols on mobile), so with 3 videos +
 * 1 ad these four cells form the first 2x2 block; the ad lands in one of the
 * four positions at random each time the page loads.
 *
 * SSR renders a deterministic position (last slot) so hydration matches; the
 * randomised slot is picked on mount. The ad keeps a stable `key`, so moving it
 * only repositions the existing iframe — it does not reload the ad.
 */
export default function LeadAdBlock({
  ad,
  videos,
}: {
  ad: React.ReactNode;
  videos: React.ReactNode[];
}) {
  const total = videos.length + 1; // videos + the single ad
  const [adSlot, setAdSlot] = useState(total - 1);

  useEffect(() => {
    setAdSlot(Math.floor(Math.random() * total));
  }, [total]);

  const cells: React.ReactNode[] = [];
  let vi = 0;
  for (let pos = 0; pos < total; pos++) {
    cells.push(pos === adSlot ? ad : videos[vi++]);
  }

  return <>{cells}</>;
}
