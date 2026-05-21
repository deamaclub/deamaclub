"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function SignOutInline() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="inline-flex items-center gap-2 text-sm text-deama-muted hover:text-deama-red"
      type="button"
    >
      <LogOut size={14} /> Sign out
    </button>
  );
}
