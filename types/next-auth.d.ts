import type { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

// auth.ts puts `role` and `id` on the token/session in its jwt and session
// callbacks, but Auth.js does not know about them, so every read site had to
// write `(session.user as any).role`. Declaring them here is the actual fix:
// the casts go away and a typo in a role check becomes a compile error instead
// of silently reading undefined — which, on an admin gate, would fail open.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}
