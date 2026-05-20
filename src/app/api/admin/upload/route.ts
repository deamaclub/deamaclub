import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * Admin image upload endpoint.
 *
 * If CLOUDFLARE_ACCOUNT_ID + CLOUDFLARE_IMAGES_TOKEN are set, uploads the file
 * directly to Cloudflare Images and returns the delivery URL.
 *
 * Otherwise falls back to a local /public/uploads/ write so dev still works.
 * Replace fallback with S3/R2/etc. before scaling.
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
    return NextResponse.json({ error: "file too large (10 MB max)" }, {
      status: 413,
    });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "image files only" }, { status: 415 });
  }

  const account = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_IMAGES_TOKEN;
  if (account && token) {
    const upstream = new FormData();
    upstream.set("file", file);
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${account}/images/v1`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: upstream,
      }
    );
    if (!res.ok) {
      const txt = await res.text();
      return NextResponse.json(
        { error: `cloudflare upload failed: ${txt.slice(0, 200)}` },
        { status: 502 }
      );
    }
    const data = (await res.json()) as {
      result: { variants?: string[] };
    };
    const url = data.result.variants?.[0];
    if (!url) {
      return NextResponse.json({ error: "no variant url" }, { status: 502 });
    }
    return NextResponse.json({ url });
  }

  // Local dev fallback
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const fname = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  await fs.writeFile(
    path.join(dir, fname),
    Buffer.from(await file.arrayBuffer())
  );
  return NextResponse.json({ url: `/uploads/${fname}` });
}
