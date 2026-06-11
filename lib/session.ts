import { auth } from "@/auth";
import db from "@/lib/db";

/**
 * Dev-mode auth bypass.
 *
 * When DEV_BYPASS_AUTH=true (development only — never honored in production),
 * getSession() returns a session built from a real seeded user instead of
 * requiring a login. Set DEV_BYPASS_ROLE=STUDENT to test the student module;
 * the default is SUPERADMIN for admin development.
 *
 * To re-enable real login later, set DEV_BYPASS_AUTH=false (or remove it).
 * All code paths fall back to the real Auth.js session automatically.
 */
const bypassEnabled =
  process.env.NODE_ENV !== "production" && process.env.DEV_BYPASS_AUTH === "true";

export async function getSession() {
  if (bypassEnabled) {
    const role = process.env.DEV_BYPASS_ROLE === "STUDENT" ? "STUDENT" : "SUPERADMIN";
    const user = await db.user.findFirst({
      where: { role: role as any, isBlocked: false },
      select: { id: true, name: true, email: true, role: true },
    });
    if (user) {
      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      } as any;
    }
  }
  return auth();
}
