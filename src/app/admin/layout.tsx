import Link from "next/link";
import { LayoutGrid, Film, PlusCircle } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import SignOutButton from "@/components/admin/SignOutButton";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login?callbackUrl=/admin");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 grid gap-6 md:grid-cols-[220px_1fr]">
      <aside className="bg-deama-ink border border-deama-border rounded-lg p-4 h-fit">
        <p className="text-xs uppercase tracking-widest text-deama-muted mb-2">
          Signed in
        </p>
        <p className="text-sm font-semibold mb-4 truncate">
          {session.user.email}
        </p>
        <nav className="space-y-1 text-sm">
          <Link
            href="/admin"
            className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-deama-surface"
          >
            <LayoutGrid size={14} /> Dashboard
          </Link>
          <Link
            href="/admin/posts"
            className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-deama-surface"
          >
            <Film size={14} /> Posts
          </Link>
          <Link
            href="/admin/posts/new"
            className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-deama-surface text-deama-gold-bright"
          >
            <PlusCircle size={14} /> New post
          </Link>
        </nav>
        <div className="mt-6 pt-4 border-t border-deama-border">
          <SignOutButton />
        </div>
      </aside>
      <section>{children}</section>
    </div>
  );
}
