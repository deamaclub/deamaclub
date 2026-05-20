import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";

const getSchema = z.object({ postId: z.string().min(1) });
const postSchema = z.object({
  postId: z.string().min(1),
  author: z.string().min(1).max(40),
  body: z.string().min(1).max(2000),
});

export async function GET(req: NextRequest) {
  const postId = req.nextUrl.searchParams.get("postId") || "";
  const parsed = getSchema.safeParse({ postId });
  if (!parsed.success) {
    return NextResponse.json({ comments: [] });
  }
  const comments = await prisma.comment.findMany({
    where: { postId, approved: true },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: { id: true, author: true, body: true, createdAt: true },
  });
  return NextResponse.json({ comments });
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "bad input" }, { status: 400 });
  }
  const { postId, author, body: text } = parsed.data;

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, published: true },
  });
  if (!post || !post.published) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const comment = await prisma.comment.create({
    data: {
      postId,
      author: author.trim().slice(0, 40),
      body: text.trim().slice(0, 2000),
    },
    select: { id: true, author: true, body: true, createdAt: true },
  });

  return NextResponse.json({ comment });
}
