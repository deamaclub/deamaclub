"use client";

import { Link as LinkIcon } from "lucide-react";
import { useState } from "react";

interface ShareButtonsProps {
  url: string;
  title: string;
}

const FacebookIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.52 1.49-3.91 3.78-3.91 1.1 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.9h-2.34V22c4.78-.79 8.43-4.94 8.43-9.94z"/>
  </svg>
);
const XIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M18.244 2H21.5l-7.39 8.443L22.835 22h-6.81l-5.336-6.97L4.6 22H1.34l7.91-9.04L1.165 2h6.985l4.82 6.37L18.244 2zm-2.39 18h1.875L7.255 4H5.28l10.575 16z"/>
  </svg>
);
const WhatsAppIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M20.52 3.48A11.94 11.94 0 0 0 12.04 0C5.45 0 .09 5.36.08 11.95c0 2.1.55 4.16 1.6 5.97L0 24l6.24-1.64a11.95 11.95 0 0 0 5.79 1.48h.01c6.59 0 11.95-5.36 11.95-11.95 0-3.19-1.24-6.19-3.47-8.41zM12.04 21.79h-.01a9.84 9.84 0 0 1-5.02-1.38l-.36-.21-3.7.97.99-3.61-.24-.37a9.84 9.84 0 0 1-1.51-5.24c0-5.44 4.43-9.87 9.86-9.87 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.44-4.43 9.86-9.89 9.86zm5.41-7.39c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.66.15-.2.3-.76.97-.93 1.17-.17.2-.34.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.34.45-.51.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.66-1.6-.91-2.18-.24-.57-.49-.5-.66-.51-.17-.01-.37-.01-.57-.01s-.52.07-.79.37c-.27.3-1.03 1-1.03 2.44s1.06 2.83 1.21 3.03c.15.2 2.09 3.19 5.07 4.47.71.31 1.26.49 1.69.62.71.23 1.35.2 1.86.12.57-.08 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35z"/>
  </svg>
);

export default function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent;
  const fb = `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`;
  const tw = `https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(title)}`;
  const wa = `https://api.whatsapp.com/send?text=${enc(`${title} ${url}`)}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* swallow */
    }
  }

  const btn =
    "inline-flex items-center gap-1.5 px-3 py-2 text-xs uppercase tracking-wider font-semibold border border-deama-border rounded hover:border-deama-red hover:text-deama-red transition-colors";

  return (
    <div className="flex flex-wrap gap-2">
      <a href={fb} target="_blank" rel="noreferrer" className={btn}>
        <FacebookIcon /> Facebook
      </a>
      <a href={tw} target="_blank" rel="noreferrer" className={btn}>
        <XIcon /> X
      </a>
      <a href={wa} target="_blank" rel="noreferrer" className={btn}>
        <WhatsAppIcon /> WhatsApp
      </a>
      <button onClick={copyLink} className={btn} type="button">
        <LinkIcon size={14} /> {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}
