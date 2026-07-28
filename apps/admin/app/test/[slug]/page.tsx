import React from "react";
import { db } from "@mahatest/db";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import { PublicQuizEngine } from "@/components/quiz/PublicQuizEngine";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  try {
    const quiz = await db.quiz.findUnique({
      where: { slug },
      select: { title: true, description: true },
    });
    if (!quiz) return { title: "Test Not Found" };
    return { title: `${quiz.title} - Spardha Times`, description: quiz.description };
  } catch {
    return { title: "Test" };
  }
}

export default async function PublicTestPage({ params }: PageProps) {
  const { slug } = await params;

  const quiz = await db.quiz.findUnique({
    where: { slug },
    include: {
      questions: {
        select: {
          id: true,
          type: true,
          text: true,
          optionA: true,
          optionB: true,
          optionC: true,
          optionD: true,
          correctAnswer: true,
          explanation: true,
          difficulty: true,
          marks: true,
        },
      },
    },
  });

  // Same three conditions submitPublicQuizAttempt enforces, so the page and the
  // action never disagree about what is publicly attemptable.
  if (!quiz || !quiz.isPublic || quiz.status !== "PUBLISHED" || quiz.testSeriesId) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
        <Card className="w-full max-w-md p-6 text-center">
          <ShieldAlert className="h-12 w-12 text-danger mx-auto mb-4" />
          <h3 className="font-bold text-lg text-foreground">Test not available</h3>
          <p className="text-sm text-muted-foreground mt-1">
            This test does not exist or is no longer publicly available.
          </p>
        </Card>
      </div>
    );
  }

  return <PublicQuizEngine quiz={quiz as any} />;
}
