import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import SearchBar from "./SearchBar";
import CategoryNav from "./CategoryNav";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-deama-black/95 backdrop-blur border-b border-deama-border">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/logo.svg"
            alt="Deamaclub"
            width={36}
            height={36}
            priority
            className="rounded"
          />
          <span className="font-display text-2xl tracking-wider text-deama-gold-bright leading-none">
            DEAMA<span className="text-deama-red">CLUB</span>
          </span>
        </Link>

        <Suspense
          fallback={
            <div className="flex-1 max-w-xl ml-auto md:ml-8 h-9 bg-deama-ink border border-deama-border rounded" />
          }
        >
          <SearchBar className="flex-1 max-w-xl ml-auto md:ml-8" />
        </Suspense>

        <Link
          href="/admin"
          className="hidden md:inline-flex items-center px-3 py-2 text-xs uppercase tracking-wider text-deama-muted hover:text-deama-gold-bright transition-colors"
        >
          Admin
        </Link>
      </div>
      <CategoryNav />
    </header>
  );
}
