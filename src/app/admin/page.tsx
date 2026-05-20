import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PlusCircle } from "lucide-react";

export default async function AdminHome() {
  const [postCount, publishedCount, viewSum, commentCount, recent] =
    await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { published: true } }),
      prisma.post.aggregate({ _sum: { viewCount: true } }),
      prisma.comment.count(),
      prisma.post.findMany({
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: {
          id: true,
          slug: true,
          title: true,
          published: true,
          viewCount: true,
          updatedAt: true,
        },
      }),
    ]);

  const stats = [
    { label: "Posts", value: postCount },
    { label: "Published", value: publishedCount },
    { label: "Total views", value: viewSum._sum.viewCount || 0 },
    { label: "Comments", value: commentCount },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display tracking-wider text-3xl text-deama-gold-bright">
          DASHBOARD
        </h1>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center gap-2 bg-deama-red hover:bg-deama-red-hover text-white text-sm uppercase tracking-wider font-bold px-3 py-2 rounded"
        >
          <PlusCircle size={14} /> New post
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-deama-ink border border-deama-border rounded p-4"
          >
            <p className="text-xs uppercase tracking-widest text-deama-muted">
              {s.label}
            </p>
            <p className="font-display text-3xl text-deama-gold-bright mt-1">
              {s.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <h2 className="font-display tracking-wider text-xl text-deama-gold-bright mb-3">
        RECENT
      </h2>
      <div className="bg-deama-ink border border-deama-border rounded divide-y divide-deama-border">
        {recent.length === 0 ? (
          <p className="p-4 text-deama-muted text-sm">
            No posts yet — start with{" "}
            <Link href="/admin/posts/new" className="text-deama-red">
              New post
            </Link>
            .
          </p>
        ) : (
          recent.map((p) => (
            <Link
              key={p.id}
              href={`/admin/posts/${p.id}/edit`}
              className="flex items-center justify-between gap-4 p-3 hover:bg-deama-surface"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{p.title}</p>
                <p className="text-xs text-deama-muted">
                  {p.published ? "Published" : "Draft"} ·{" "}
                  {p.viewCount.toLocaleString()} views
                </p>
              </div>
              <span className="text-xs text-deama-muted shrink-0">
                {new Date(p.updatedAt).toLocaleDateString()}
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
