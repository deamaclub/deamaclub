import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { timeAgo } from "@/lib/utils";
import { isCommentHidden } from "@/lib/moderation";
import AdminCommentRow from "@/components/admin/AdminCommentRow";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string };
}

export default async function AdminUserPage({ params }: PageProps) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { comments: true, postLikes: true } },
    },
  });
  if (!user) notFound();

  const comments = await prisma.comment.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 500,
    select: {
      id: true,
      body: true,
      createdAt: true,
      likeCount: true,
      post: { select: { slug: true, title: true } },
    },
  });

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin"
          className="text-xs text-deama-muted hover:text-deama-red"
        >
          ← Dashboard
        </Link>
        <h1 className="font-display tracking-wider text-3xl text-deama-gold-bright mt-2">
          @{user.username}
        </h1>
        <p className="text-xs text-deama-muted mt-1">
          {user.role} · joined {timeAgo(user.createdAt)}
          {user.email ? ` · ${user.email}` : " · no email on file"}
          {" · "}
          {user._count.comments} comments · {user._count.postLikes} likes
        </p>
      </div>

      <h2 className="font-display tracking-wider text-xl text-deama-gold-bright mb-3">
        COMMENTS
      </h2>
      {comments.length === 0 ? (
        <div className="bg-deama-ink border border-deama-border rounded p-6 text-sm text-deama-muted text-center">
          No comments from this user.
        </div>
      ) : (
        <ul className="space-y-3">
          {comments.map((c) => (
            <AdminCommentRow
              key={c.id}
              id={c.id}
              body={c.body}
              createdAt={c.createdAt.toISOString()}
              likeCount={c.likeCount}
              postSlug={c.post.slug}
              postTitle={c.post.title}
              hidden={isCommentHidden(c.body)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
