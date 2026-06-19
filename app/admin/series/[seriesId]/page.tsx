import React from "react";
import { notFound } from "next/navigation";
import db from "@/lib/db";
import { SeriesDetail } from "@/components/admin/SeriesDetail";

export const revalidate = 0;

export default async function AdminSeriesDetailPage({
  params,
}: {
  params: Promise<{ seriesId: string }>;
}) {
  const { seriesId } = await params;

  const series = await db.testSeries.findUnique({
    where: { id: seriesId },
    include: {
      category: { select: { name: true } },
      quizzes: {
        orderBy: { orderIndex: "asc" },
        include: { _count: { select: { questions: true } } },
      },
    },
  });

  if (!series) notFound();

  return <SeriesDetail series={series as any} />;
}
