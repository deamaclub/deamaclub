import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Edit3, PlusCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPosts() {
  const posts = await prisma.post.findMany({
    orderBy: { updatedAt: "desc" },
    take: 200,
    select: {
      id: true,
      slug: true,
      title: true,
      published: true,
      trending: true,
      viewCount: true,
      updatedAt: true,
      category: { select: { name: true } },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display tracking-wider text-3xl text-deama-gold-bright">
          POSTS
        </h1>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center gap-2 bg-deama-red hover:bg-deama-red-hover text-white text-sm uppercase tracking-wider font-bold px-3 py-2 rounded"
        >
          <PlusCircle size={14} /> New post
        </Link>
      </div>

      <div className="bg-deama-ink border border-deama-border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-deama-surface text-xs uppercase tracking-wider text-deama-muted">
            <tr>
              <th className="text-left p-3">Title</th>
              <th className="text-left p-3 hidden md:table-cell">Category</th>
              <th className="text-right p-3 hidden md:table-cell">Views</th>
              <th className="text-center p-3">Status</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-deama-border">
            {posts.map((p) => (
              <tr key={p.id} className="hover:bg-deama-surface">
                <td className="p-3 min-w-0">
                  <p className="font-semibold truncate">{p.title}</p>
                  <p className="text-xs text-deama-muted truncate">{p.slug}</p>
                </td>
                <td className="p-3 hidden md:table-cell text-deama-muted">
                  {p.category.name}
                </td>
                <td className="p-3 hidden md:table-cell text-right">
                  {p.viewCount.toLocaleString()}
                </td>
                <td className="p-3 text-center">
                  {p.published ? (
                    <span className="inline-block text-xs bg-green-700/40 border border-green-600 text-green-300 px-1.5 py-0.5 rounded">
                      Live
                    </span>
                  ) : (
                    <span className="inline-block text-xs bg-deama-surface border border-deama-border text-deama-muted px-1.5 py-0.5 rounded">
                      Draft
                    </span>
                  )}
                  {p.trending && (
                    <span className="ml-1 inline-block text-xs bg-deama-red/30 border border-deama-red text-deama-red px-1.5 py-0.5 rounded">
                      Hot
                    </span>
                  )}
                </td>
                <td className="p-3 text-right">
                  <Link
                    href={`/admin/posts/${p.id}/edit`}
                    className="inline-flex items-center gap-1 text-deama-gold-bright hover:text-deama-red"
                  >
                    <Edit3 size={14} /> Edit
                  </Link>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-deama-muted">
                  No posts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
