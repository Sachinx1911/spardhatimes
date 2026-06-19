import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { QuizEngine } from "@/components/quiz/QuizEngine";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { testState } from "@/lib/releases";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Dynamic SEO metadata sourced from the quiz and its category's SEO fields.
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  try {
    const quiz = await db.quiz.findUnique({
      where: { slug },
      select: {
        title: true,
        description: true,
        difficulty: true,
        duration: true,
        category: { select: { name: true, metaTitle: true, metaDescription: true } },
        _count: { select: { questions: true } },
      },
    });
    if (!quiz) return { title: "Quiz Not Found" };

    const title = `${quiz.title} - ${quiz.category.name} Mock Test`;
    const description =
      quiz.description ||
      quiz.category.metaDescription ||
      `Attempt the ${quiz.title} mock test: ${quiz._count.questions} questions, ${quiz.duration} minutes, ${quiz.difficulty.toLowerCase()} difficulty. Instant results with detailed explanations.`;

    return {
      title,
      description,
      alternates: { canonical: `/quiz/${slug}/attempt` },
      openGraph: { title, description, type: "website" },
      twitter: { card: "summary", title, description },
    };
  } catch {
    return { title: "Mock Test" };
  }
}

export default async function QuizAttemptPage({ params }: PageProps) {
  // 1. Enforce Authentication
  const session = await getSession();
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
        testSeries: {
          select: {
            id: true,
            timingMode: true,
            published: true,
            access: { where: { userId: session.user.id }, select: { id: true } },
          },
        },
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
            marks: true
          }
        }
      }
    });
  } catch (err) {
    console.error("Error fetching quiz:", err);
  }

  // Gate series tests: enforce access + the release/close schedule. Standalone
  // quizzes (no testSeries) are unaffected.
  if (quiz?.testSeries) {
    const ts = quiz.testSeries;
    const hasAccess = ts.access.length > 0;
    const state = testState(
      { releaseAt: quiz.releaseAt, closeAt: quiz.closeAt },
      ts.timingMode
    );
    const role = (session.user as any).role;
    const isAdmin = role === "ADMIN" || role === "SUPERADMIN";

    if (!isAdmin && (!ts.published || !hasAccess || state !== "OPEN")) {
      const reason = !ts.published || !hasAccess
        ? "This test is part of a series that hasn't been assigned to your account."
        : state === "UPCOMING"
        ? "This test hasn't been unlocked yet. Check back at its scheduled release time."
        : "This test is now closed and can no longer be attempted.";
      return (
        <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
          <Card className="w-full max-w-md p-6 text-center">
            <ShieldAlert className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h3 className="font-bold text-lg text-foreground">Test not available</h3>
            <p className="text-sm text-muted-foreground mt-1">{reason}</p>
            <div className="flex gap-4 mt-6">
              <Link href="/dashboard" className="flex-1">
                <Button variant="outline" className="w-full">Back to Dashboard</Button>
              </Link>
            </div>
          </Card>
        </div>
      );
    }
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
