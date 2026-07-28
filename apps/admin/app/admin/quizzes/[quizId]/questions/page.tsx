import React from "react";
import { notFound } from "next/navigation";
import { db } from "@mahatest/db";
import { QuestionManager } from "@/components/admin/QuestionManager";

export const revalidate = 0;

interface PageProps {
  params: Promise<{ quizId: string }>;
}

export default async function AdminQuizQuestionsPage({ params }: PageProps) {
  const { quizId } = await params;

  const quiz = await db.quiz.findUnique({
    where: { id: quizId },
    select: {
      id: true,
      title: true,
      slug: true,
      questions: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!quiz) {
    notFound();
  }

  const { questions, ...quizMeta } = quiz;

  return <QuestionManager quiz={quizMeta} questions={questions as any} />;
}
