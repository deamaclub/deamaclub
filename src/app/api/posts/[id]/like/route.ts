import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/**
 * Increment a post's like count.
 *
 * Public, unauthenticated, no dedup. Every POST bumps the counter by 1.
 * This is intentional — the site owner wants anonymous visitors to be
 * able to like, and to like again after a refresh, so the total reflects
 * raw enthusiasm rather than distinct authors.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const postId = params.id;

  const updated = await prisma.post
    .update({
      where: { id: postId, published: true },
      data: { likeCount: { increment: 1 } },
      select: { likeCount: true },
    })
    .catch(() => null);

  if (!updated) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json({ likeCount: Math.max(0, updated.likeCount) });
}
