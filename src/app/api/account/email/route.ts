import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().email().max(254).optional().or(z.literal("")),
});

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "invalid email" },
      { status: 400 }
    );
  }
  const email =
    parsed.data.email && parsed.data.email.length > 0
      ? parsed.data.email.toLowerCase()
      : null;

  if (email) {
    const dupe = await prisma.user.findFirst({
      where: { email, NOT: { id: session.user.id } },
      select: { id: true },
    });
    if (dupe) {
      return NextResponse.json(
        { error: "That email is already linked to another account." },
        { status: 409 }
      );
    }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { email },
  });
  return NextResponse.json({ ok: true, email });
}
