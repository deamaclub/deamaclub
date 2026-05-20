import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStreamVideo, iframeUrl } from "@/lib/cloudflare-stream";

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
    const v = await getStreamVideo(params.uid);
    return NextResponse.json({
      uid: v.uid,
      status: v.status?.state,
      readyToStream: v.readyToStream,
      duration: v.duration,
      thumbnail: v.thumbnail,
      preview: v.preview,
      hls: v.playback?.hls,
      embedUrl: iframeUrl(v.uid),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "stream lookup failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
