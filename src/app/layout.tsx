import type { Metadata } from "next";
import { Inter, Anton } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdSlot from "@/components/AdSlot";
import Providers from "@/components/Providers";

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://deamaclub.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Deamaclub — Viral Videos, Fights, Hip Hop & Street Culture",
    template: "%s | Deamaclub",
  },
  description:
    "Deamaclub is the home of viral news, fight videos, hip hop, sports highlights and street culture from across America.",
  keywords: [
    "viral videos",
    "fight videos",
    "hip hop news",
    "wshh",
    "street culture",
    "celebrity news",
  ],
  openGraph: {
    type: "website",
    siteName: "Deamaclub",
    url: SITE_URL,
    title: "Deamaclub — Viral Videos, Fights, Hip Hop & Street Culture",
    description:
      "The home of viral news, fight videos, hip hop and street culture.",
    images: ["/og-default.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    site: "@deamaclub",
    creator: "@deamaclub",
  },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.ico" },
  verification: process.env.NEXT_PUBLIC_GSC_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION }
    : undefined,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${anton.variable}`}>
      <head>
        {GA_ID && (
          <>
            {/* Google Analytics 4 — gtag.js loader + inline config.
                Plain <script> tags rendered into SSR <head> so they're
                in the initial HTML (Mediavine + AdSense readers want
                this; lazy-loaded analytics doesn't count toward GA's
                real-time view for some bot checks). */}
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');
`,
              }}
            />
          </>
        )}
        {ADSENSE_CLIENT && (
          <>
            <meta name="google-adsense-account" content={ADSENSE_CLIENT} />
            {/* Plain <script> rendered into SSR <head> so the AdSense
                verifier (which doesn't execute JS) finds it on first
                fetch. next/script's strategies emit a preload link
                instead, which doesn't satisfy verification. */}
            <script
              async
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
              crossOrigin="anonymous"
            />
          </>
        )}
      </head>
      <body className="bg-deama-black text-deama-text min-h-screen flex flex-col">
        <Providers>
          <Header />
          <div className="w-full bg-deama-ink border-b border-deama-border">
            <div className="mx-auto max-w-7xl px-4 py-2">
              <AdSlot id="leaderboard-top" size="leaderboard" />
            </div>
          </div>
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
