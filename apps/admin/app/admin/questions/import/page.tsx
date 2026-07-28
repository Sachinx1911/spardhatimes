import React from "react";
import { db } from "@mahatest/db";
import { QuestionImporter } from "@/components/admin/QuestionImporter";

export const revalidate = 0;

export default async function AdminImportPage() {
  let quizzes: any[] = [];
  try {
    quizzes = await db.quiz.findMany({
      select: { id: true, title: true },
      orderBy: { title: "asc" }
    });
  } catch (err) {
    console.error("Error fetching quizzes for import page:", err);
  }

  return <QuestionImporter quizzes={quizzes} />;
}
