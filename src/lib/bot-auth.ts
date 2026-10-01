import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

/**
 * Shared-secret auth for the vid_grab Telegram bot.
 *
 * Required env var:
 *   BOT_API_SECRET   long random string, same value as vid_grab's
 *                    DEAMACLUB_API_SECRET. Sent as `Authorization: Bearer …`.
 *
 * Returns a 401/503 response to send back, or null when the request is ok.
 */
export function requireBot(req: NextRequest): NextResponse | null {
  const secret = process.env.BOT_API_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "BOT_API_SECRET not set on the server" },
      { status: 503 }
    );
  }
  const header = req.headers.get("authorization") || "";
  const given = Buffer.from(header.replace(/^Bearer\s+/i, ""));
  const want = Buffer.from(secret);
  if (given.length !== want.length || !timingSafeEqual(given, want)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return null;
}
