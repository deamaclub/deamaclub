import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireBot } from "@/lib/bot-auth";
import { createDirectUpload } from "@/lib/bunny-stream";

export const runtime = "nodejs";

/**
 * Bot step 1: create an empty Bunny Stream video and hand back the TUS
 * credentials. The bot uploads the bytes straight to Bunny, then calls
 * /api/bot/posts with the guid.
 */
const schema = z.object({ name: z.string().min(1).max(200) });

export async function POST(req: NextRequest) {
  const denied = requireBot(req);
  if (denied) return denied;

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
