import { redirect } from "next/navigation";

// Public quiz browsing is disabled — this is a closed, admin-assigned
// test-series platform. Students access their tests from the dashboard.
export default function QuizzesPage() {
  redirect("/");
}
