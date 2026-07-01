import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { isCommentHidden } from "@/lib/moderation";

export const runtime = "nodejs";

const getSchema = z.object({ postId: z.string().min(1) });
const postSchema = z.object({
  postId: z.string().min(1),
  body: z.string().min(1).max(2000),
  parentId: z.string().min(1).optional().nullable(),
});

export async function GET(req: NextRequest) {
  const postId = req.nextUrl.searchParams.get("postId") || "";
  const parsed = getSchema.safeParse({ postId });
  if (!parsed.success) {
    return NextResponse.json({ comments: [] });
  }

  const session = await getServerSession(authOptions);
  const meId = session?.user?.id;

  const rows = await prisma.comment.findMany({
    where: { postId, approved: true },
    orderBy: [{ parentId: "asc" }, { createdAt: "desc" }],
    take: 500,
    select: {
      id: true,
      parentId: true,
      body: true,
      createdAt: true,
      likeCount: true,
      author: true,
      user: { select: { username: true } },
      likes: meId
        ? { where: { userId: meId }, select: { id: true }, take: 1 }
        : false,
    },
  });

  const comments = rows.map((r) => ({
    id: r.id,
    parentId: r.parentId,
    body: r.body,
    createdAt: r.createdAt,
    likeCount: r.likeCount,
    username: r.user?.username || r.author,
    likedByMe: Array.isArray(r.likes) ? r.likes.length > 0 : false,
    hidden: isCommentHidden(r.body),
  }));

  return NextResponse.json({ comments });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "auth required" }, { status: 401 });
  }

  const parsed = postSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "bad input" },
      { status: 400 }
    );
  }
  const { postId, body, parentId } = parsed.data;

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, published: true, slug: true },
  });
  if (!post || !post.published) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  // If replying, validate parent and find its author for notification
  let parentAuthorId: string | null = null;
  if (parentId) {
    const parent = await prisma.comment.findUnique({
      where: { id: parentId },
      select: { postId: true, userId: true },
    });
    if (!parent || parent.postId !== postId) {
      return NextResponse.json({ error: "bad parent" }, { status: 400 });
    }
    parentAuthorId = parent.userId;
  }

  const comment = await prisma.comment.create({
    data: {
      postId,
      userId: session.user.id,
      author: session.user.username,
      body: body.trim().slice(0, 2000),
      parentId: parentId || null,
    },
    select: {
      id: true,
      parentId: true,
      body: true,
      createdAt: true,
      likeCount: true,
      author: true,
      user: { select: { username: true } },
    },
  });

  // Notify the parent comment's author of the reply
  if (parentAuthorId && parentAuthorId !== session.user.id) {
    await prisma.notification.create({
      data: {
        type: "COMMENT_REPLY",
        recipientId: parentAuthorId,
        actorId: session.user.id,
        commentId: comment.id,
        postSlug: post.slug,
      },
    });
  }

  return NextResponse.json({
    comment: {
      id: comment.id,
      parentId: comment.parentId,
      body: comment.body,
      createdAt: comment.createdAt,
      likeCount: comment.likeCount,
      username: comment.user?.username || comment.author,
      likedByMe: false,
      hidden: isCommentHidden(comment.body),
    },
  });
}
