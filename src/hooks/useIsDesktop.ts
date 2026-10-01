"use client";

import { useEffect, useState } from "react";

/** Mouse-driven, wide-screen device. null until known (first client render). */
export function useIsDesktop(): boolean | null {
  const [desktop, setDesktop] = useState<boolean | null>(null);
  useEffect(() => {
    setDesktop(
      window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 1024px)")
        .matches
    );
  }, []);
  return desktop;
}
