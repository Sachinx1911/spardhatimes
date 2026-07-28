"use client";

import dynamic from "next/dynamic";

// Defer the recharts-based result analytics to a client-only chunk so the
// result page's initial JS stays light (matters on mobile, where most students
// view their score).
export const ResultAnalytics = dynamic(
  () => import("./ResultAnalytics").then((m) => m.ResultAnalytics),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
        Loading analysis…
      </div>
    ),
  }
);
