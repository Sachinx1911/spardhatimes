import React from "react";
import { db } from "@mahatest/db";
import { SeriesManager } from "@/components/admin/SeriesManager";

export const revalidate = 0; // Dynamic administration CRUD

export default async function AdminSeriesPage() {
  let series: any[] = [];
  let categories: any[] = [];
  try {
    [series, categories] = await Promise.all([
      db.testSeries.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          category: { select: { name: true } },
          _count: { select: { quizzes: true, access: true } },
        },
      }),
      db.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    ]);
  } catch (err) {
    console.error("Error fetching test series for admin:", err);
  }

  return <SeriesManager initialSeries={series as any} categories={categories as any} />;
}
