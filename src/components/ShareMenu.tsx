"use client";

import { useEffect, useRef, useState } from "react";
import { Share2, Copy, Check } from "lucide-react";

interface ShareMenuProps {
  url: string;
  title: string;
}

const FacebookIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.52 1.49-3.91 3.78-3.91 1.1 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.9h-2.34V22c4.78-.79 8.43-4.94 8.43-9.94z" />
  </svg>
);
const XIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M18.244 2H21.5l-7.39 8.443L22.835 22h-6.81l-5.336-6.97L4.6 22H1.34l7.91-9.04L1.165 2h6.985l4.82 6.37L18.244 2zm-2.39 18h1.875L7.255 4H5.28l10.575 16z" />
  </svg>
);
const InstagramIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect width="20" height="20" x="2" y="2" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
  </svg>
);

export default function ShareMenu({ url, title }: ShareMenuProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [igHint, setIgHint] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const enc = encodeURIComponent;
  const fb = `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`;
  const tw = `https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(title)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  async function shareInstagram() {
    // Instagram has no web share URL. Copy the link + a caption and
    // hint the user to paste it in IG. On mobile we try the IG app
    // deep link first.
    const text = `${title} ${url}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
    setIgHint(true);
    setTimeout(() => setIgHint(false), 2500);
    if (typeof window !== "undefined" && /Android|iPhone|iPad/.test(window.navigator.userAgent)) {
      window.location.href = "instagram://library";
    }
  }

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs uppercase tracking-wider font-semibold border border-deama-border rounded hover:border-deama-red hover:text-deama-red transition-colors"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Share2 size={14} /> Share
      </button>

      {open && (
        <div
          role="menu"
          className="absolute z-30 right-0 mt-2 w-72 bg-deama-ink border border-deama-border rounded-lg shadow-glow p-3"
        >
          <p className="text-[10px] uppercase tracking-widest text-deama-muted mb-2">
            Share link
          </p>
          <div className="flex items-stretch gap-2 mb-3">
            <input
              readOnly
              value={url}
              onFocus={(e) => e.currentTarget.select()}
              className="flex-1 bg-deama-black border border-deama-border rounded px-2 py-1.5 text-xs text-deama-text/90 truncate"
            />
            <button
              type="button"
              onClick={copy}
              className="px-2 py-1.5 text-xs border border-deama-border rounded hover:border-deama-red hover:text-deama-red inline-flex items-center gap-1"
              aria-label="Copy link"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <a
              href={fb}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col items-center gap-1 py-2 border border-deama-border rounded hover:border-deama-red hover:text-deama-red transition-colors text-[10px] uppercase tracking-wider"
              onClick={() => setOpen(false)}
            >
              <FacebookIcon size={20} />
              Facebook
            </a>
            <button
              type="button"
              onClick={shareInstagram}
              className="flex flex-col items-center gap-1 py-2 border border-deama-border rounded hover:border-deama-red hover:text-deama-red transition-colors text-[10px] uppercase tracking-wider"
            >
              <InstagramIcon size={20} />
              Instagram
            </button>
            <a
              href={tw}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col items-center gap-1 py-2 border border-deama-border rounded hover:border-deama-red hover:text-deama-red transition-colors text-[10px] uppercase tracking-wider"
              onClick={() => setOpen(false)}
            >
              <XIcon size={20} />
              X
            </a>
          </div>

          {igHint && (
            <p className="mt-3 text-[11px] text-deama-gold-bright bg-deama-gold/10 border border-deama-gold/30 rounded px-2 py-1.5">
              Link copied. Paste into your Instagram story or DM.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
