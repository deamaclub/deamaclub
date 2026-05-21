import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * GET — list the current user's most recent notifications + unread count.
 * Returns up to 30 rows (unread first within each createdAt slice).
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ unreadCount: 0, notifications: [] });
  }
  const userId = session.user.id;

  const [unreadCount, rows] = await Promise.all([
    prisma.notification.count({
      where: { recipientId: userId, read: false },
    }),
    prisma.notification.findMany({
      where: { recipientId: userId },
      orderBy: [{ read: "asc" }, { createdAt: "desc" }],
      take: 30,
      select: {
        id: true,
        type: true,
        read: true,
        createdAt: true,
        postSlug: true,
        commentId: true,
        actor: { select: { username: true } },
        comment: { select: { body: true } },
      },
    }),
  ]);

  const notifications = rows.map((r) => ({
    id: r.id,
    type: r.type,
    read: r.read,
    createdAt: r.createdAt,
    postSlug: r.postSlug,
    commentId: r.commentId,
    actorUsername: r.actor?.username || "someone",
    commentSnippet: (r.comment?.body || "").slice(0, 120),
  }));

  return NextResponse.json({ unreadCount, notifications });
}

const patchSchema = z.object({
  ids: z.array(z.string().min(1)).optional(),
});

/** PATCH — mark notifications as read. `ids: []` or omitted = mark all. */
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "auth required" }, { status: 401 });
  }
  const userId = session.user.id;
  const parsed = patchSchema.safeParse(await req.json().catch(() => ({})));
  const ids = parsed.success ? parsed.data.ids : undefined;

  await prisma.notification.updateMany({
    where: {
      recipientId: userId,
      read: false,
      ...(ids && ids.length > 0 ? { id: { in: ids } } : {}),
    },
    data: { read: true },
  });
  return NextResponse.json({ ok: true });
}
