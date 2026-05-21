import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * Toggle like on a post. Auth-required. Idempotent: second call unlikes.
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
  const postId = params.id;

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, published: true },
  });
  if (!post || !post.published) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const existing = await prisma.postLike.findUnique({
    where: { postId_userId: { postId, userId } },
    select: { id: true },
  });

  let liked: boolean;
  let newCount: number;
  if (existing) {
    const [, updated] = await prisma.$transaction([
      prisma.postLike.delete({ where: { id: existing.id } }),
      prisma.post.update({
        where: { id: postId },
        data: { likeCount: { decrement: 1 } },
        select: { likeCount: true },
      }),
    ]);
    liked = false;
    newCount = updated.likeCount;
  } else {
    const [, updated] = await prisma.$transaction([
      prisma.postLike.create({ data: { postId, userId } }),
      prisma.post.update({
        where: { id: postId },
        data: { likeCount: { increment: 1 } },
        select: { likeCount: true },
      }),
    ]);
    liked = true;
    newCount = updated.likeCount;
  }

  return NextResponse.json({ liked, likeCount: Math.max(0, newCount) });
}
