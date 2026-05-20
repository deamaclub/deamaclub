"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="flex items-center gap-2 px-2 py-1.5 rounded text-sm text-deama-muted hover:text-deama-red w-full"
    >
      <LogOut size={14} /> Sign out
    </button>
  );
}
