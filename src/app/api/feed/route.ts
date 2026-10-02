import { NextRequest, NextResponse } from "next/server";
import { getFeedPage } from "@/lib/feed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/feed?seed=123&offset=5&exclude=<postId> → next page of the feed. */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const seed = parseInt(sp.get("seed") || "", 10);
  const offset = parseInt(sp.get("offset") || "0", 10);
  if (!Number.isFinite(seed) || !Number.isFinite(offset) || offset < 0) {
    return NextResponse.json({ error: "bad input" }, { status: 400 });
  }
  // Very deep offsets are just a client looping forever; cap the work.
  if (offset > 100_000) return NextResponse.json({ posts: [] });

  const posts = await getFeedPage({
    seed,
    offset,
    excludeId: sp.get("exclude"),
  });
  return NextResponse.json({ posts });
}
