"use client";

import dynamic from "next/dynamic";

// Recharts is heavy. Load it on the client only, as a separate chunk, so it is
// NOT part of the dashboard's initial JS — the charts live in the (non-default)
// Analytics tab, so most visits never download recharts at all.
export const PerformanceCharts = dynamic(
  () => import("./PerformanceCharts").then((m) => m.PerformanceCharts),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
        Loading charts…
      </div>
    ),
  }
);
