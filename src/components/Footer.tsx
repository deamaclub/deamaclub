import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";

export default function Footer() {
  return (
    <footer className="bg-deama-ink border-t border-deama-border mt-12">
      <div className="mx-auto max-w-7xl px-4 py-10 grid gap-8 md:grid-cols-4 text-sm">
        <div>
          <div className="font-display text-2xl text-deama-gold-bright tracking-wider">
            DEAMA<span className="text-deama-red">CLUB</span>
          </div>
          <p className="text-deama-muted mt-3 text-xs leading-relaxed">
            Viral news, fight videos, hip hop, sports and street culture from
            across America.
          </p>
        </div>

        <div>
          <h4 className="uppercase text-xs tracking-widest text-deama-gold mb-3">
            Categories
          </h4>
          <ul className="space-y-1.5">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/category/${c.slug}`}
                  className="hover:text-deama-red transition-colors"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="uppercase text-xs tracking-widest text-deama-gold mb-3">
            Site
          </h4>
          <ul className="space-y-1.5">
            <li>
              <Link href="/about" className="hover:text-deama-red">
                About
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-deama-red">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-deama-red">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-deama-red">
                Terms
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="uppercase text-xs tracking-widest text-deama-gold mb-3">
            Follow
          </h4>
          <ul className="space-y-1.5">
            <li>
              <a
                href="https://twitter.com/deamaclub"
                target="_blank"
                rel="noreferrer"
                className="hover:text-deama-red"
              >
                X / Twitter
              </a>
            </li>
            <li>
              <a
                href="https://instagram.com/deamaclub"
                target="_blank"
                rel="noreferrer"
                className="hover:text-deama-red"
              >
                Instagram
              </a>
            </li>
            <li>
              <a
                href="https://youtube.com/@deamaclub"
                target="_blank"
                rel="noreferrer"
                className="hover:text-deama-red"
              >
                YouTube
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-deama-border">
        <div className="mx-auto max-w-7xl px-4 py-4 flex flex-col md:flex-row justify-between gap-2 text-xs text-deama-muted">
          <p>© {new Date().getFullYear()} Deamaclub. All rights reserved.</p>
          <p>Built fast. Watched faster.</p>
        </div>
      </div>
    </footer>
  );
}
