"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  Menu,
  X,
  Home,
  User,
  Shield,
  LogIn,
  LogOut,
} from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { useAuthModal } from "./AuthModalProvider";

const ITEM_CLASSES =
  "flex items-center gap-3 px-4 py-3 text-sm uppercase tracking-wider font-semibold text-deama-text hover:bg-deama-surface hover:text-deama-red transition-colors";

export default function SideMenu() {
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();
  const { openModal } = useAuthModal();

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const visibleCategories = CATEGORIES.filter((c) => c.slug !== "sports");
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "EDITOR";

  function close() {
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="inline-flex items-center justify-center w-9 h-9 rounded text-deama-muted hover:text-deama-gold-bright transition-colors shrink-0"
      >
        <Menu size={20} />
      </button>

      {/* Backdrop */}
      <div
        aria-hidden
        onClick={close}
        className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        className={`fixed inset-y-0 left-0 z-50 w-72 md:w-80 bg-deama-ink border-r border-deama-border shadow-glow transform transition-transform duration-300 overflow-y-auto ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="min-h-full flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-deama-border">
            <span className="font-display text-xl tracking-wider text-deama-gold-bright leading-none">
              DEAMA<span className="text-deama-red">CLUB</span>
            </span>
            <button
              type="button"
              onClick={close}
              aria-label="Close menu"
              className="inline-flex items-center justify-center w-8 h-8 rounded text-deama-muted hover:text-deama-red"
            >
              <X size={18} />
            </button>
          </div>

          {status === "authenticated" && (
            <div className="px-4 py-3 border-b border-deama-border">
              <p className="text-[10px] uppercase tracking-widest text-deama-muted">
                Signed in
              </p>
              <Link
                href="/account"
                onClick={close}
                className="text-sm font-semibold text-deama-gold-bright hover:text-deama-red"
              >
                {session?.user?.username
                  ? `@${session.user.username}`
                  : session?.user?.name || session?.user?.email || "Your account"}
              </Link>
            </div>
          )}

          <nav>
            <ul>
              <li>
                <Link href="/" onClick={close} className={ITEM_CLASSES}>
                  <Home size={16} /> Latest
                </Link>
              </li>
              {visibleCategories.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/category/${c.slug}`}
                    onClick={close}
                    className={ITEM_CLASSES}
                  >
                    <span
                      aria-hidden
                      className="inline-block w-2 h-2 bg-deama-red rounded-full"
                    />
                    {c.name}
                  </Link>
                </li>
              ))}
              <li className="border-t border-deama-border mt-2 pt-2">
                <Link
                  href="/account"
                  onClick={close}
                  className={ITEM_CLASSES}
                >
                  <User size={16} /> Account
                </Link>
              </li>
              {isAdmin && (
                <li>
                  <Link
                    href="/admin"
                    onClick={close}
                    className={ITEM_CLASSES}
                  >
                    <Shield size={16} /> Admin
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          <div className="mt-auto border-t border-deama-border p-3">
            {status === "authenticated" ? (
              <button
                type="button"
                onClick={() => {
                  close();
                  signOut({ callbackUrl: "/" });
                }}
                className="w-full inline-flex items-center justify-center gap-2 bg-deama-surface hover:bg-deama-red hover:text-white border border-deama-border rounded px-3 py-2.5 text-sm font-semibold uppercase tracking-wider transition-colors"
              >
                <LogOut size={14} /> Sign out
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  close();
                  openModal({ mode: "signin" });
                }}
                className="w-full inline-flex items-center justify-center gap-2 bg-deama-red hover:bg-deama-red-hover text-white rounded px-3 py-2.5 text-sm font-semibold uppercase tracking-wider transition-colors"
              >
                <LogIn size={14} /> Sign in
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
