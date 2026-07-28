import { redirect } from "next/navigation";

// Public leaderboard is disabled — this is a closed, admin-assigned
// test-series platform. Students access their tests from the dashboard.
export default function LeaderboardPage() {
  redirect("/");
}
