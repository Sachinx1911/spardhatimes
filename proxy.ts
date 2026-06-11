import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "./auth.config";

// Next.js 16 renamed the `middleware` convention to `proxy` (nodejs runtime).
// NextAuth's `.auth` handler runs the `authorized` callback in auth.config.ts
// to gate /dashboard and /admin routes.
//
// DEV_BYPASS_AUTH=true (development only) skips the gate entirely so modules
// can be built and tested without logging in. Real login still works.
const bypassEnabled =
  process.env.NODE_ENV !== "production" && process.env.DEV_BYPASS_AUTH === "true";

export const proxy = bypassEnabled
  ? () => NextResponse.next()
  : NextAuth(authConfig).auth;

export default proxy;

export const config = {
  // Match all request paths except api, _next/static, _next/image, PWA assets
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$|.*\\.json$|manifest\\.webmanifest|sw\\.js).*)"],
};
