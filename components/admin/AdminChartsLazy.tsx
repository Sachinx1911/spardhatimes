"use client";

import dynamic from "next/dynamic";

// Defer recharts to a client-only chunk so the admin dashboard's initial JS
// stays small; the charts hydrate in after the page is interactive.
export const AdminCharts = dynamic(
  () => import("./AdminCharts").then((m) => m.AdminCharts),
  {
    ssr: false,
    loading: () => (
      <div className="h-72 flex items-center justify-center text-sm text-muted-foreground">
        Loading charts…
      </div>
    ),
  }
);
