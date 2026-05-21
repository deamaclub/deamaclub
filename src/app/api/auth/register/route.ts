import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashIp } from "@/lib/utils";

export const runtime = "nodejs";

const schema = z.object({
  username: z
    .string()
    .min(3, "Username must be 3-20 characters")
    .max(20, "Username must be 3-20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only use letters, numbers, _"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(128),
  email: z
    .string()
    .email("Invalid email")
    .max(254)
    .optional()
    .or(z.literal("")),
  // Honeypot field — bots fill it in, humans don't see it.
  hp: z.string().optional(),
});

// Very small in-memory IP rate limiter (per Node process). Resets on
// app restart; for a multi-instance deploy push to Redis. Good enough
// at PM2-cluster scale to deter casual spam.
const RATE: Map<string, { count: number; reset: number }> = new Map();
const RATE_LIMIT = 5; // signups per IP per hour
const RATE_WINDOW_MS = 60 * 60 * 1000;

function rateLimit(ipHash: string): boolean {
  const now = Date.now();
  const entry = RATE.get(ipHash);
  if (!entry || entry.reset < now) {
    RATE.set(ipHash, { count: 1, reset: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "invalid input" },
      { status: 400 }
    );
  }
  const { username, password, email, hp } = parsed.data;

  // Honeypot trip — quietly succeed without creating anything
  if (hp && hp.length > 0) {
    return NextResponse.json({ ok: true });
  }

  // Rate-limit by IP hash
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "0.0.0.0";
  const ipHash = await hashIp(ip);
  if (!rateLimit(ipHash)) {
    return NextResponse.json(
      { error: "Too many signups from your network. Try again later." },
      { status: 429 }
    );
  }

  const uname = username.toLowerCase();

  // Pre-flight uniqueness check (clearer error than the DB constraint)
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ username: uname }, ...(email ? [{ email }] : [])],
    },
    select: { username: true, email: true },
  });
  if (existing) {
    if (existing.username === uname) {
      return NextResponse.json(
        { error: "Username already taken." },
        { status: 409 }
      );
    }
    if (email && existing.email === email) {
      return NextResponse.json(
        { error: "Email already in use." },
        { status: 409 }
      );
    }
  }

  const hash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      username: uname,
      email: email && email.length > 0 ? email : null,
      password: hash,
      role: "USER",
    },
    select: { id: true, username: true },
  });

  return NextResponse.json({ ok: true, user });
}
