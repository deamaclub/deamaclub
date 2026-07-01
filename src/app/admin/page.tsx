import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PlusCircle } from "lucide-react";
import { timeAgo } from "@/lib/utils";

export default async function AdminHome() {
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [
    postCount,
    publishedCount,
    viewSum,
    commentCount,
    userCount,
    newUsers24h,
    recentPosts,
    recentUsers,
  ] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { published: true } }),
    prisma.post.aggregate({ _sum: { viewCount: true } }),
    prisma.comment.count(),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.user.count({
      where: { role: "USER", createdAt: { gte: since24h } },
    }),
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
    prisma.user.findMany({
      where: { role: "USER" },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        _count: { select: { comments: true, postLikes: true } },
      },
    }),
  ]);

  const stats = [
    { label: "Posts", value: postCount },
    { label: "Published", value: publishedCount },
    { label: "Total views", value: viewSum._sum.viewCount || 0 },
    { label: "Users", value: userCount, sub: `+${newUsers24h} in 24h` },
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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
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
            {s.sub && (
              <p className="text-[10px] text-deama-muted mt-1 uppercase tracking-wider">
                {s.sub}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="font-display tracking-wider text-xl text-deama-gold-bright mb-3">
            RECENT POSTS
          </h2>
          <div className="bg-deama-ink border border-deama-border rounded divide-y divide-deama-border">
            {recentPosts.length === 0 ? (
              <p className="p-4 text-deama-muted text-sm">
                No posts yet — start with{" "}
                <Link href="/admin/posts/new" className="text-deama-red">
                  New post
                </Link>
                .
              </p>
            ) : (
              recentPosts.map((p) => (
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
        </section>

        <section>
          <h2 className="font-display tracking-wider text-xl text-deama-gold-bright mb-3">
            RECENT SIGN-UPS
          </h2>
          <div className="bg-deama-ink border border-deama-border rounded divide-y divide-deama-border">
            {recentUsers.length === 0 ? (
              <p className="p-4 text-deama-muted text-sm">
                No users yet.
              </p>
            ) : (
              recentUsers.map((u) => (
                <Link
                  key={u.id}
                  href={`/admin/users/${u.id}`}
                  className="flex items-center justify-between gap-4 p-3 hover:bg-deama-surface"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">
                      @{u.username}
                    </p>
                    <p className="text-xs text-deama-muted truncate">
                      {u._count.comments} comments ·{" "}
                      {u._count.postLikes} likes
                      {u.email ? ` · ${u.email}` : ""}
                    </p>
                  </div>
                  <span className="text-xs text-deama-muted shrink-0">
                    {timeAgo(u.createdAt)}
                  </span>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
