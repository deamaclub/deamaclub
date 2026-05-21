import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";

const NAV_LINK_CLASSES =
  "inline-flex items-center px-3 py-1.5 rounded uppercase tracking-wider font-semibold text-deama-text hover:bg-deama-red hover:text-white transition-colors whitespace-nowrap";

export default function CategoryNav() {
  // Categories the user explicitly wants in the public nav.
  // "sports" has 0 posts and is being swapped out for an Account link.
  const visible = CATEGORIES.filter((c) => c.slug !== "sports");

  return (
    <nav
      aria-label="Categories"
      className="bg-deama-ink border-b border-deama-border"
    >
      <div className="mx-auto max-w-7xl px-4">
        <ul className="flex gap-1 overflow-x-auto scrollbar-hide py-2 text-sm">
          <li>
            <Link href="/" className={NAV_LINK_CLASSES}>
              Latest
            </Link>
          </li>
          {visible.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/category/${c.slug}`}
                className={NAV_LINK_CLASSES}
              >
                {c.name}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/account" className={NAV_LINK_CLASSES}>
              Account
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
