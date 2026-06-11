import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import db from "@/lib/db";
import { ResultAnalytics } from "@/components/quiz/ResultAnalytics";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PageProps {
  params: Promise<{
    attemptId: string;
  }>;
}

export default async function ResultPage({ params }: PageProps) {
  // 1. Enforce Authentication
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const resolvedParams = await params;
  const attemptId = resolvedParams.attemptId;
  const userId = session.user.id;
  const role = (session.user as any).role;

  // 2. Fetch Quiz Attempt
  let attempt = null;
  try {
    attempt = await db.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            slug: true,
            marks: true,
            negativeMarks: true,
            duration: true,
            passingMarks: true,
          }
        },
        responses: {
          include: {
            question: true
          }
        }
      }
    });
  } catch (err) {
    console.error("Error fetching attempt result:", err);
  }

  // Fallback mock for testing in development if DB lacks records
  if (!attempt && attemptId === "mock-result") {
    attempt = {
      id: "mock-result",
      score: 8.0,
      percentage: 80.0,
      correctAnswers: 4,
      wrongAnswers: 1,
      skippedQuestions: 0,
      timeTaken: 180,
      rank: 2,
      percentile: 92.5,
      quiz: {
        id: "mock-quiz",
        title: "World Capitals Challenge",
        slug: "world-capitals-challenge",
        marks: 10.0,
        negativeMarks: 0.25,
        duration: 10,
        passingMarks: 5.0
      },
      responses: [
        {
          id: "r1",
          chosenOption: "C",
          isCorrect: true,
          timeSpent: 45,
          question: {
            id: "q1",
            text: "What is the capital of France?",
            optionA: "Berlin",
            optionB: "Madrid",
            optionC: "Paris",
            optionD: "Rome",
            correctAnswer: "C",
            explanation: "Paris is the capital of France."
          }
        }
      ]
    };
  }

  if (!attempt) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
        <Card className="w-full max-w-md p-6 text-center">
          <ShieldAlert className="h-12 w-12 text-danger mx-auto mb-4" />
          <h3 className="font-bold text-lg text-foreground">Result Not Found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            The quiz result sheet you are looking for does not exist or has been archived.
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

  // 3. Security Guard: Ensure student can only view their own results
  const isOwner = attempt.userId === userId;
  const isAdmin = role === "ADMIN" || role === "SUPERADMIN";

  if (!isOwner && !isAdmin) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
        <Card className="w-full max-w-md p-6 text-center">
          <ShieldAlert className="h-12 w-12 text-danger mx-auto mb-4" />
          <h3 className="font-bold text-lg text-foreground">Unauthorized</h3>
          <p className="text-sm text-muted-foreground mt-1">
            You do not have permission to view this quiz result report.
          </p>
          <div className="flex gap-4 mt-6">
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full">Home</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <ResultAnalytics attempt={attempt as any} />
      </div>
    </div>
  );
}
