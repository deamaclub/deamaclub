import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";

export default function CategoryNav() {
  return (
    <nav
      aria-label="Categories"
      className="bg-deama-ink border-b border-deama-border"
    >
      <div className="mx-auto max-w-7xl px-4">
        <ul className="flex gap-1 overflow-x-auto scrollbar-hide py-2 text-sm">
          <li>
            <Link
              href="/"
              className="inline-flex items-center px-3 py-1.5 rounded uppercase tracking-wider font-semibold text-deama-text hover:bg-deama-red hover:text-white transition-colors"
            >
              Latest
            </Link>
          </li>
          {CATEGORIES.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/category/${c.slug}`}
                className="inline-flex items-center px-3 py-1.5 rounded uppercase tracking-wider font-semibold text-deama-text hover:bg-deama-red hover:text-white transition-colors whitespace-nowrap"
              >
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
