import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getBunnyVideo } from "@/lib/bunny-stream";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: { uid: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const v = await getBunnyVideo(params.uid);
    return NextResponse.json({
      uid: v.guid,
      status: v.status,
      readyToStream: v.readyToStream,
      duration: v.length,
      thumbnail: v.thumbnailUrl,
      hls: v.hlsUrl,
      embedUrl: v.embedUrl,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "lookup failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
