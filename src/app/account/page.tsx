import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { timeAgo } from "@/lib/utils";
import AccountEmailForm from "@/components/account/AccountEmailForm";
import SignOutInline from "@/components/account/SignOutInline";
import { Heart, MessageSquare } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  // Middleware protects this route, but defence in depth:
  if (!session?.user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-deama-muted">Please sign in to view your account.</p>
      </div>
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      username: true,
      email: true,
      createdAt: true,
      role: true,
    },
  });

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center text-deama-muted">
        Account not found.
      </div>
    );
  }

  const [postLikes, commentLikes, comments] = await Promise.all([
    prisma.postLike.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 25,
      select: {
        createdAt: true,
        post: { select: { slug: true, title: true, thumbnailUrl: true } },
      },
    }),
    prisma.commentLike.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 25,
      select: {
        createdAt: true,
        comment: {
          select: {
            body: true,
            post: { select: { slug: true, title: true } },
          },
        },
      },
    }),
    prisma.comment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 25,
      select: {
        id: true,
        body: true,
        createdAt: true,
        likeCount: true,
        post: { select: { slug: true, title: true } },
      },
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display tracking-wider text-3xl text-deama-gold-bright">
            {user.username.toUpperCase()}
          </h1>
          <p className="text-xs text-deama-muted mt-1">
            Joined {timeAgo(user.createdAt)} · {user.role.toLowerCase()}
          </p>
        </div>
        <SignOutInline />
      </header>

      <section className="bg-deama-ink border border-deama-border rounded-lg p-5 mb-8">
        <h2 className="font-display tracking-wider text-lg text-deama-gold-bright mb-3">
          PROFILE
        </h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-4">
          <div>
            <dt className="text-xs uppercase tracking-wider text-deama-muted">
              Username
            </dt>
            <dd className="font-semibold">{user.username}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-deama-muted">
              Email
            </dt>
            <dd className="font-semibold">{user.email || "—"}</dd>
          </div>
        </dl>
        <AccountEmailForm initialEmail={user.email ?? ""} />
      </section>

      <section className="mb-8">
        <h2 className="font-display tracking-wider text-lg text-deama-gold-bright mb-3 inline-flex items-center gap-2">
          <MessageSquare size={14} /> YOUR COMMENTS
        </h2>
        {comments.length === 0 ? (
          <p className="text-deama-muted text-sm">No comments yet.</p>
        ) : (
          <ul className="space-y-3">
            {comments.map((c) => (
              <li
                key={c.id}
                className="bg-deama-ink border border-deama-border rounded p-3 text-sm"
              >
                <p className="whitespace-pre-wrap break-words">{c.body}</p>
                <div className="text-xs text-deama-muted mt-2 flex items-center gap-2">
                  <span>{timeAgo(c.createdAt)}</span>
                  <span>·</span>
                  <span>{c.likeCount} likes</span>
                  <span>·</span>
                  <Link
                    href={`/video/${c.post.slug}`}
                    className="hover:text-deama-red truncate"
                  >
                    on {c.post.title}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mb-8">
        <h2 className="font-display tracking-wider text-lg text-deama-gold-bright mb-3 inline-flex items-center gap-2">
          <Heart size={14} /> POSTS YOU LIKED
        </h2>
        {postLikes.length === 0 ? (
          <p className="text-deama-muted text-sm">No likes yet.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-3">
            {postLikes.map((l) => (
              <li
                key={l.post.slug}
                className="bg-deama-ink border border-deama-border rounded p-3 text-sm"
              >
                <Link
                  href={`/video/${l.post.slug}`}
                  className="hover:text-deama-red line-clamp-2"
                >
                  {l.post.title}
                </Link>
                <p className="text-xs text-deama-muted mt-1">
                  {timeAgo(l.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {commentLikes.length > 0 && (
        <section className="mb-8">
          <h2 className="font-display tracking-wider text-lg text-deama-gold-bright mb-3 inline-flex items-center gap-2">
            <Heart size={14} /> COMMENTS YOU LIKED
          </h2>
          <ul className="space-y-3">
            {commentLikes.map((l, i) => (
              <li
                key={i}
                className="bg-deama-ink border border-deama-border rounded p-3 text-sm"
              >
                <p className="text-deama-text/80 line-clamp-2">
                  {l.comment.body}
                </p>
                <Link
                  href={`/video/${l.comment.post.slug}`}
                  className="text-xs text-deama-muted hover:text-deama-red"
                >
                  on {l.comment.post.title} · {timeAgo(l.createdAt)}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
