import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 }, // 30 days
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Username or email",
      credentials: {
        identifier: { label: "Username or email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) return null;
        const id = credentials.identifier.toLowerCase().trim();
        // Look up by username OR by email — supports both admin
        // (email-based) and public (username-based) login.
        const user = await prisma.user.findFirst({
          where: { OR: [{ username: id }, { email: id }] },
        });
        if (!user) return null;
        const ok = await bcrypt.compare(credentials.password, user.password);
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email ?? undefined,
          name: user.name ?? user.username,
          username: user.username,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Fresh sign-in: copy fields from the authorize() return
        const u = user as {
          id: string;
          username?: string;
          role?: string;
        };
        token.id = u.id;
        token.username = u.username ?? "";
        token.role = u.role ?? "USER";
      } else if (
        token.sub &&
        (!token.id || !token.username || !token.role)
      ) {
        // Older JWTs may be missing fields we added after they were
        // issued. Backfill from the DB once; subsequent requests use
        // the cached values in the refreshed token.
        const fresh = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { id: true, username: true, role: true },
        });
        if (fresh) {
          token.id = fresh.id;
          token.username = fresh.username;
          token.role = fresh.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { username?: string }).username =
          token.username as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
};
