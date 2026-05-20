import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { createDirectUpload } from "@/lib/bunny-stream";

export const runtime = "nodejs";

const schema = z.object({
  size: z.number().int().min(1).max(5 * 1024 * 1024 * 1024), // 5 GB hard ceiling
  name: z.string().min(1).max(200),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "bad input" },
      { status: 400 }
    );
  }

  try {
    const upload = await createDirectUpload({ name: parsed.data.name });
    return NextResponse.json(upload);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "bunny init failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
