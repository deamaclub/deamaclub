import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { absoluteUrl } from "@/lib/utils";

export const runtime = "nodejs";
export const maxDuration = 120;

/**
 * Admin-only: send a post's video straight to the vid_grab Telegram chat.
 *
 * Required env vars:
 *   TELEGRAM_BOT_TOKEN   same token the vid_grab bot uses
 *   TELEGRAM_CHAT_ID     the chat the bot DMs (vid_grab's CHAT_ID)
 *
 * Bunny posts: we pull Bunny's MP4 fallback rendition (H.264, faststart)
 * and upload it with sendVideo. Bot uploads are capped at 50 MB, so we
 * take the highest rendition under that. Posts we can't fetch as a file
 * (YouTube embeds, oversized videos) are sent as a link instead.
 */

const TELEGRAM_UPLOAD_LIMIT = 50 * 1024 * 1024;
const BUNNY_RENDITIONS = ["1080p", "720p", "480p", "360p", "240p"];
const BUNNY_EMBED_RE = /iframe\.mediadelivery\.net\/(?:embed|play)\/\d+\/([0-9a-f-]{36})/i;

const schema = z.object({ postId: z.string().min(1) });

function tgEnv() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    throw new Error("Set TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID in .env");
  }
  return { token, chatId };
}

/** Returns a URL + size for the best MP4 under Telegram's cap, or null. */
async function pickVideoFile(
  embedUrl: string | null,
  videoUrl: string | null
): Promise<{ url: string; size: number } | null> {
  const candidates: string[] = [];
  const guid = embedUrl?.match(BUNNY_EMBED_RE)?.[1];
  const pullZone = process.env.BUNNY_STREAM_PULL_ZONE;
  if (guid && pullZone) {
    for (const r of BUNNY_RENDITIONS) {
      candidates.push(`https://${pullZone}/${guid}/play_${r}.mp4`);
    }
  }
  if (videoUrl) candidates.push(videoUrl);

  for (const url of candidates) {
    const res = await fetch(url, {
      method: "HEAD",
      headers: { Referer: absoluteUrl("/") },
      cache: "no-store",
    }).catch(() => null);
    if (!res?.ok) continue;
    const size = Number(res.headers.get("content-length") || 0);
    if (size > 0 && size <= TELEGRAM_UPLOAD_LIMIT) return { url, size };
  }
  return null;
}

async function tgCall(method: string, body: FormData | object) {
  const { token } = tgEnv();
  const isForm = body instanceof FormData;
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: isForm ? undefined : { "Content-Type": "application/json" },
    body: isForm ? body : JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    description?: string;
  };
  if (!data.ok) {
    throw new Error(`Telegram ${method} failed: ${data.description || res.status}`);
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as { role?: string } | undefined)?.role !== "ADMIN") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "bad input" }, { status: 400 });
  }

  const post = await prisma.post.findUnique({
    where: { id: parsed.data.postId },
    select: { title: true, slug: true, embedUrl: true, videoUrl: true },
  });
  if (!post) {
    return NextResponse.json({ error: "post not found" }, { status: 404 });
  }

  const pageUrl = absoluteUrl(`/video/${post.slug}`);
  const caption = `${post.title}\n${pageUrl}`.slice(0, 1024);

  try {
    const { chatId } = tgEnv();
    const file = await pickVideoFile(post.embedUrl, post.videoUrl);

    if (!file) {
      await tgCall("sendMessage", { chat_id: chatId, text: caption });
      return NextResponse.json({ ok: true, sent: "link" });
    }

    const dl = await fetch(file.url, {
      headers: { Referer: absoluteUrl("/") },
      cache: "no-store",
    });
    if (!dl.ok) throw new Error(`Video fetch failed (${dl.status})`);
    const blob = await dl.blob();

    const form = new FormData();
    form.append("chat_id", chatId);
    form.append("caption", caption);
    form.append("supports_streaming", "true");
    form.append("video", blob, `${post.slug.slice(0, 80) || "video"}.mp4`);
    await tgCall("sendVideo", form);

    return NextResponse.json({ ok: true, sent: "video" });
  } catch (e) {
    const message = e instanceof Error ? e.message : "send failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
