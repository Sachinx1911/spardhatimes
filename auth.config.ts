import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  // Required when deploying behind a reverse proxy / custom domain (Vercel,
  // Railway, VPS+nginx, etc.) — without it Auth.js rejects the host and login
  // fails with a generic "Server error: problem with the server configuration".
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = (auth?.user as any)?.role;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");

      if (isOnAdmin) {
        if (isLoggedIn && (role === "ADMIN" || role === "SUPERADMIN")) return true;
        return false; // Redirect to login page
      }
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect to login page
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  providers: [], // Providers are populated in auth.ts to avoid Edge Runtime import errors
} satisfies NextAuthConfig;
