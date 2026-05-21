import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * Toggle like on a comment. Idempotent-ish: clicking twice unlikes.
 * Returns the new likeCount and whether the calling user now likes it.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "auth required" }, { status: 401 });
  }
  const userId = session.user.id;
  const commentId = params.id;

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { id: true, userId: true, postId: true, post: { select: { slug: true } } },
  });
  if (!comment) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const existing = await prisma.commentLike.findUnique({
    where: { commentId_userId: { commentId, userId } },
    select: { id: true },
  });

  let liked: boolean;
  let newCount: number;
  if (existing) {
    const [, updated] = await prisma.$transaction([
      prisma.commentLike.delete({ where: { id: existing.id } }),
      prisma.comment.update({
        where: { id: commentId },
        data: { likeCount: { decrement: 1 } },
        select: { likeCount: true },
      }),
    ]);
    liked = false;
    newCount = updated.likeCount;
  } else {
    const [, updated] = await prisma.$transaction([
      prisma.commentLike.create({ data: { commentId, userId } }),
      prisma.comment.update({
        where: { id: commentId },
        data: { likeCount: { increment: 1 } },
        select: { likeCount: true },
      }),
    ]);
    liked = true;
    newCount = updated.likeCount;

    // Notify the comment author (skip self-likes)
    if (comment.userId && comment.userId !== userId) {
      await prisma.notification.create({
        data: {
          type: "COMMENT_LIKE",
          recipientId: comment.userId,
          actorId: userId,
          commentId: comment.id,
          postSlug: comment.post.slug,
        },
      });
    }
  }

  return NextResponse.json({ liked, likeCount: Math.max(0, newCount) });
}
