"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { User, LogIn } from "lucide-react";
import { useAuthModal } from "./AuthModalProvider";

/**
 * Tiny header widget that renders an "@username" link to /account
 * when signed in, or a "Sign in" button that opens the modal when
 * not. Lives in the header next to the "Admin" link.
 */
export default function HeaderAccount() {
  const { data: session, status } = useSession();
  const { openModal } = useAuthModal();

  if (status === "loading") {
    return (
      <span className="hidden md:inline-flex h-6 w-16 bg-deama-ink border border-deama-border rounded animate-pulse" />
    );
  }

  if (status === "authenticated" && session?.user?.username) {
    return (
      <Link
        href="/account"
        className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-xs uppercase tracking-wider text-deama-gold hover:text-deama-gold-bright transition-colors"
      >
        <User size={14} /> @{session.user.username}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => openModal({ mode: "signin" })}
      className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-xs uppercase tracking-wider text-deama-muted hover:text-deama-gold-bright transition-colors"
    >
      <LogIn size={14} /> Sign in
    </button>
  );
}
