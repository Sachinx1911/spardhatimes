import React from "react";
import db from "@/lib/db";
import { QuizManager } from "@/components/admin/QuizManager";

export const revalidate = 0;

export default async function AdminQuizzesPage() {
  let quizzes: any[] = [];
  let categories: any[] = [];

  try {
    quizzes = await db.quiz.findMany({
      include: {
        category: { select: { name: true } },
        _count: { select: { questions: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    categories = await db.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" }
    });
  } catch (err) {
    console.error("Error loading admin quizzes:", err);
  }

  return (
    <QuizManager 
      initialQuizzes={quizzes as any} 
      categories={categories} 
    />
  );
}
