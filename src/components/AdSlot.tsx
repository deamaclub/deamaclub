/**
 * Named ad placement zones. Drop your Raptive / Mediavine / Google Ad Manager
 * tags into this component (e.g. set window.adngin or push to googletag.cmd
 * inside a useEffect). The wrapper renders the structural div with the
 * `data-ad-zone` attribute that GAM/Raptive header bidders typically target.
 */

type AdSize =
  | "leaderboard"   // 728x90 / 970x90 / 970x250
  | "rectangle"     // 300x250
  | "halfpage"      // 300x600
  | "sidebar"       // 300x600 sticky
  | "mobile-banner" // 320x50 / 320x100
  | "in-article"    // fluid native
  | "interstitial"; // anchored / sticky

const SIZE_CLASSES: Record<AdSize, string> = {
  leaderboard: "min-h-[90px] md:min-h-[90px]",
  rectangle: "min-h-[250px]",
  halfpage: "min-h-[600px]",
  sidebar: "min-h-[600px]",
  "mobile-banner": "min-h-[50px] md:hidden",
  "in-article": "min-h-[280px]",
  interstitial: "min-h-[60px]",
};

interface AdSlotProps {
  id: string;
  size: AdSize;
  className?: string;
}

export default function AdSlot({ id, size, className = "" }: AdSlotProps) {
  return (
    <div
      data-ad-zone={id}
      data-ad-size={size}
      className={`w-full flex items-center justify-center text-deama-muted text-[10px] uppercase tracking-widest bg-deama-ink/60 border border-dashed border-deama-border rounded ${SIZE_CLASSES[size]} ${className}`}
    >
      <span aria-hidden>AD · {size}</span>
      {/* Production: replace placeholder with GPT slot or Raptive snippet keyed by `id`. */}
    </div>
  );
}
