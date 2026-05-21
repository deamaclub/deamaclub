import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import SearchBar from "./SearchBar";
import SideMenu from "./SideMenu";
import NotificationBell from "./NotificationBell";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 bg-deama-black/95 backdrop-blur border-b border-deama-border">
      <div className="mx-auto max-w-7xl px-3 md:px-4 py-3 flex items-center gap-3 md:gap-4">
        <SideMenu />

        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/logo.svg"
            alt="Deamaclub"
            width={32}
            height={32}
            priority
            className="rounded"
          />
          <span className="font-display text-xl md:text-2xl tracking-wider text-deama-gold-bright leading-none">
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

        <NotificationBell />
      </div>
    </header>
  );
}
