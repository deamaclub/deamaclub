import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * Admin thumbnail upload. Writes the file to /public/uploads/ on the server;
 * nginx (or Next.js dev) serves it directly with long cache.
 *
 * Returns an *absolute* URL so the saved post.thumbnailUrl passes the
 * z.string().url() validator in /api/admin/posts.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "no file" }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json(
      { error: "file too large (10 MB max)" },
      { status: 413 }
    );
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "image files only" }, { status: 415 });
  }

  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  const ext = (file.name.split(".").pop()?.toLowerCase() || "jpg").replace(
    /[^a-z0-9]/g,
    ""
  );
  const fname = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}.${ext}`;
  await fs.writeFile(
    path.join(dir, fname),
    Buffer.from(await file.arrayBuffer())
  );

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    `${req.nextUrl.protocol}//${req.headers.get("host") || "deamaclub.com"}`;
  return NextResponse.json({ url: `${origin}/uploads/${fname}` });
}
