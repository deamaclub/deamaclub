import { withAuth } from "next-auth/middleware";

/**
 * Route protection:
 *   /admin/*    — requires ADMIN or EDITOR role
 *   /account/*  — requires any authenticated user
 *
 * Unauthorized users are redirected to /login.
 */
export default withAuth({
  callbacks: {
    authorized({ token, req }) {
      const path = req.nextUrl.pathname;
      if (path.startsWith("/admin")) {
        return token?.role === "ADMIN" || token?.role === "EDITOR";
      }
      if (path.startsWith("/account")) {
        return Boolean(token);
      }
      return true;
    },
  },
});

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
