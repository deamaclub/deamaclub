import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireBot } from "@/lib/bot-auth";
import { embedUrlFor, getBunnyVideo } from "@/lib/bunny-stream";
import { absoluteUrl, slugify } from "@/lib/utils";

export const runtime = "nodejs";

/**
 * Bot step 2: publish a post for a video the bot already uploaded to Bunny.
 *
 * multipart/form-data fields:
 *   guid         Bunny video guid from /api/bot/create-upload (required)
 *   title        post title — the source site's title (required)
 *   durationSec  optional integer
 *   category     optional category slug or name; falls back to
 *                BOT_DEFAULT_CATEGORY (slug), then the first category
 *   thumbnail    optional image file — the source site's thumbnail. Without
 *                it the post uses Bunny's auto-generated thumbnail.
 */
const schema = z.object({
  guid: z.string().regex(/^[0-9a-f-]{36}$/i, "bad guid"),
  title: z.string().trim().min(1).max(200),
  durationSec: z.coerce.number().int().min(0).optional(),
  category: z.string().trim().max(100).optional(),
});

async function findCategory(wanted?: string) {
  for (const key of [wanted, process.env.BOT_DEFAULT_CATEGORY]) {
    if (!key) continue;
    const cat = await prisma.category.findFirst({
      where: {
        OR: [
          { slug: slugify(key) },
          { name: { equals: key, mode: "insensitive" } },
        ],
      },
    });
    if (cat) return cat;
  }
  return prisma.category.findFirst({ orderBy: { order: "asc" } });
}

async function saveThumbnail(file: File): Promise<string> {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  const ext =
    (file.type.split("/")[1] || "jpg").replace(/[^a-z0-9]/g, "") || "jpg";
  const fname = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}.${ext}`;
  await fs.writeFile(
    path.join(dir, fname),
    Buffer.from(await file.arrayBuffer())
  );
  return absoluteUrl(`/uploads/${fname}`);
}

export async function POST(req: NextRequest) {
  const denied = requireBot(req);
  if (denied) return denied;

  const form = await req.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ error: "expected form data" }, { status: 400 });
  }
  const parsed = schema.safeParse({
    guid: form.get("guid") ?? undefined,
    title: form.get("title") ?? undefined,
    durationSec: form.get("durationSec") || undefined,
    category: form.get("category") || undefined,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "bad input" },
      { status: 400 }
    );
  }
  const d = parsed.data;

  const category = await findCategory(d.category);
  if (!category) {
    return NextResponse.json(
      { error: "No categories exist — create one in the admin first." },
      { status: 400 }
    );
  }

  let thumbnailUrl: string | null = null;
  const thumb = form.get("thumbnail");
  if (
    thumb instanceof File &&
    thumb.size > 0 &&
    thumb.size <= 10 * 1024 * 1024 &&
    thumb.type.startsWith("image/")
  ) {
    thumbnailUrl = await saveThumbnail(thumb);
  }

  let durationSec = d.durationSec ?? null;
  if (!thumbnailUrl || durationSec == null) {
    // Fall back to what Bunny knows. The thumbnail path is stable even
    // while Bunny is still transcoding.
    const v = await getBunnyVideo(d.guid).catch(() => null);
    if (v) {
      thumbnailUrl ||= v.thumbnailUrl;
      if (durationSec == null && v.length > 0) durationSec = v.length;
    }
  }

  let slug = slugify(d.title) || `post-${Date.now()}`;
  const existing = await prisma.post.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    select: { id: true },
  });

  const post = await prisma.post.create({
    data: {
      title: d.title,
      slug,
      embedUrl: embedUrlFor(d.guid),
      thumbnailUrl,
      durationSec,
      categoryId: category.id,
      published: true,
      publishedAt: new Date(),
      authorId: admin?.id ?? null,
    },
    select: { id: true, slug: true },
  });

  return NextResponse.json({
    post,
    category: category.name,
    url: absoluteUrl(`/video/${post.slug}`),
  });
}
