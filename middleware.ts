import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // Match all request paths except api, _next/static, _next/image, PWA assets
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$|.*\\.json$|manifest\\.webmanifest|sw\\.js).*)"],
};
