import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export const runtime = "nodejs";

const schema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().max(120).optional().default(""),
  description: z.string().max(4000).optional().default(""),
  embedUrl: z.string().url().optional().or(z.literal("")),
  videoUrl: z.string().url().optional().or(z.literal("")),
  thumbnailUrl: z.string().url().optional().or(z.literal("")),
  durationSec: z.number().int().min(0).nullable().optional(),
  categoryId: z.string().min(1),
  published: z.boolean().default(false),
  trending: z.boolean().default(false),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return session;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "bad input" },
      { status: 400 }
    );
  }
  const d = parsed.data;
  if (!d.embedUrl && !d.videoUrl) {
    return NextResponse.json(
      { error: "Provide an embed URL or a video URL." },
      { status: 400 }
    );
  }

  const existing = await prisma.post.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "not found" }, { status: 404 });

  let slug = slugify(d.slug || d.title);
  if (slug && slug !== existing.slug) {
    const dupe = await prisma.post.findUnique({ where: { slug } });
    if (dupe) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
  } else {
    slug = existing.slug;
  }

  const wasPublished = existing.published;
  const post = await prisma.post.update({
    where: { id: params.id },
    data: {
      title: d.title,
      slug,
      description: d.description || null,
      embedUrl: d.embedUrl || null,
      videoUrl: d.videoUrl || null,
      thumbnailUrl: d.thumbnailUrl || null,
      durationSec: d.durationSec ?? null,
      categoryId: d.categoryId,
      published: d.published,
      trending: d.trending,
      publishedAt:
        d.published && !wasPublished ? new Date() : existing.publishedAt,
    },
  });

  return NextResponse.json({ post });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  await prisma.post.delete({ where: { id: params.id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
