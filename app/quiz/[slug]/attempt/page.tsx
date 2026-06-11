import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import db from "@/lib/db";
import { QuizEngine } from "@/components/quiz/QuizEngine";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function QuizAttemptPage({ params }: PageProps) {
  // 1. Enforce Authentication
  const session = await auth();
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  if (!session?.user) {
    redirect(`/login?callbackUrl=/quiz/${slug}/attempt`);
  }

  // 2. Fetch Quiz Details
  let quiz = null;
  try {
    quiz = await db.quiz.findUnique({
      where: { slug },
      include: {
        questions: {
          select: {
            id: true,
            text: true,
            optionA: true,
            optionB: true,
            optionC: true,
            optionD: true,
            correctAnswer: true,
            explanation: true,
            difficulty: true,
            marks: true
          }
        }
      }
    });
  } catch (err) {
    console.error("Error fetching quiz:", err);
  }

  // 3. Fallback mock if database query fails or returns empty during development
  if (!quiz && slug === "world-capitals-challenge") {
    quiz = {
      id: "mock-gk",
      title: "World Capitals Challenge",
      slug: "world-capitals-challenge",
      duration: 10,
      marks: 10.0,
      passingMarks: 5.0,
      instructions: "Answer all capital questions. Negative marks of 0.25 points apply for wrong answers.",
      questions: [
        {
          id: "gk-1",
          text: "What is the capital of France?",
          optionA: "Berlin",
          optionB: "Madrid",
          optionC: "Paris",
          optionD: "Rome",
          correctAnswer: "C",
          explanation: "Paris is the capital of France.",
          difficulty: "EASY",
          marks: 2.0
        },
        {
          id: "gk-2",
          text: "What is the capital of Australia?",
          optionA: "Sydney",
          optionB: "Melbourne",
          optionC: "Brisbane",
          optionD: "Canberra",
          correctAnswer: "D",
          explanation: "Canberra is the capital of Australia.",
          difficulty: "MEDIUM",
          marks: 2.0
        }
      ]
    };
  }

  if (!quiz) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
        <Card className="w-full max-w-md p-6 text-center">
          <ShieldAlert className="h-12 w-12 text-danger mx-auto mb-4" />
          <h3 className="font-bold text-lg text-foreground">Quiz Not Found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            The quiz you are trying to access does not exist or has been removed by administrators.
          </p>
          <div className="flex gap-4 mt-6">
            <Link href="/quizzes" className="flex-1">
              <Button variant="outline" className="w-full">Back to Quizzes</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return <QuizEngine quiz={quiz as any} />;
}
