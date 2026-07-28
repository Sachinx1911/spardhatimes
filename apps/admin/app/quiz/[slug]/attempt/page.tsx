import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { db } from "@mahatest/db";
import { QuizEngine } from "@/components/quiz/QuizEngine";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  attemptAccessInclude,
  decideAttemptAccess,
  messageForReason,
} from "@mahatest/core";

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

    const title = `${quiz.title} - ${quiz.category.name} Test`;
    const description =
      quiz.description ||
      quiz.category.metaDescription ||
      `Attempt the ${quiz.title} test: ${quiz._count.questions} questions, ${quiz.duration} minutes, ${quiz.difficulty.toLowerCase()} difficulty. Instant results with detailed explanations.`;

    return {
      title,
      description,
      alternates: { canonical: `/quiz/${slug}/attempt` },
      openGraph: { title, description, type: "website" },
      twitter: { card: "summary", title, description },
    };
  } catch {
    return { title: "Test" };
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
        ...attemptAccessInclude(session.user.id),
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
            <Link href="/dashboard" className="flex-1">
              <Button variant="outline" className="w-full">Back to Dashboard</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // Every quiz goes through the same check, not just series ones: this also keeps
  // drafts out of students' hands. submitQuizAttempt runs the identical rules, so
  // hiding the UI here is a courtesy rather than the actual protection.
  const decision = decideAttemptAccess(quiz, session.user.role);
  if (!decision.allowed) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
        <Card className="w-full max-w-md p-6 text-center">
          <ShieldAlert className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h3 className="font-bold text-lg text-foreground">Test not available</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {messageForReason(decision.reason)}
          </p>
          <div className="flex gap-4 mt-6">
            <Link href="/dashboard" className="flex-1">
              <Button variant="outline" className="w-full">Back to Dashboard</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return <QuizEngine quiz={quiz as any} />;
}
