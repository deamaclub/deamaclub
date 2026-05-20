import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashIp } from "@/lib/utils";
import { z } from "zod";

export const runtime = "nodejs";

const schema = z.object({ postId: z.string().min(1) });

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "bad input" }, { status: 400 });
  }
  const { postId } = parsed.data;

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "0.0.0.0";
  const ipHash = await hashIp(ip);
  const userAgent = req.headers.get("user-agent")?.slice(0, 255) || null;
  const referer = req.headers.get("referer")?.slice(0, 255) || null;

  const cutoff = new Date(Date.now() - 1000 * 60 * 30);
  const recent = await prisma.view.findFirst({
    where: { postId, ipHash, createdAt: { gte: cutoff } },
    select: { id: true },
  });
  if (recent) return NextResponse.json({ ok: true, deduped: true });

  await prisma.$transaction([
    prisma.view.create({ data: { postId, ipHash, userAgent, referer } }),
    prisma.post.update({
      where: { id: postId },
      data: { viewCount: { increment: 1 } },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
