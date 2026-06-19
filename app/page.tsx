import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

// There is no public landing page. The platform is fully login-gated:
//  - not signed in        -> /login
//  - signed-in student    -> /dashboard (My Dashboard)
//  - signed-in admin      -> /admin/dashboard
// "Home" everywhere points here, so it always lands on the right dashboard.
export default async function Home() {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }
  const role = (session.user as any).role;
  if (role === "ADMIN" || role === "SUPERADMIN") {
    redirect("/admin/dashboard");
  }
  redirect("/dashboard");
}
