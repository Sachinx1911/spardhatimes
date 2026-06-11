import React from "react";
import db from "@/lib/db";
import { ResultManager } from "@/components/admin/ResultManager";

export const revalidate = 0;

export default async function AdminResultsPage() {
  let results: any[] = [];
  let quizzes: any[] = [];

  try {
    results = await db.quizAttempt.findMany({
      where: { status: "COMPLETED" },
      include: {
        user: { select: { name: true, email: true } },
        quiz: { select: { id: true, title: true, marks: true, passingMarks: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 500,
    });

    quizzes = await db.quiz.findMany({
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    });
  } catch (err) {
    console.error("Error loading admin results:", err);
  }

  return <ResultManager results={results as any} quizzes={quizzes} />;
}
