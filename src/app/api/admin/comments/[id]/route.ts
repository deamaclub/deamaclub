import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * Admin: delete a comment (and all its replies via schema onDelete: Cascade).
 * Only ADMIN and EDITOR roles allowed.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  if (!session?.user?.id || (role !== "ADMIN" && role !== "EDITOR")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  await prisma.comment
    .delete({ where: { id: params.id } })
    .catch(() => null);
  return NextResponse.json({ ok: true });
}
