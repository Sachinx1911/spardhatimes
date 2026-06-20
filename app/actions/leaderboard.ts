"use server";

import db from "@/lib/db";
import { getSession } from "@/lib/session";

export interface LeaderboardRow {
  rank: number;
  name: string;
  email: string;
  score: number;
  percentage: number;
}

export interface QuizOption {
  id: string;
  title: string;
  marks: number;
  questionCount: number;
  description: string | null;
}

export async function getQuizList(): Promise<QuizOption[]> {
  const session = await getSession();
  const role = (session?.user as any)?.role;
  if (role !== "ADMIN" && role !== "SUPERADMIN") return [];

  const quizzes = await db.quiz.findMany({
    where: { attempts: { some: { status: "COMPLETED" } } },
    select: {
      id: true,
      title: true,
      marks: true,
      description: true,
      _count: { select: { questions: true } },
    },
    orderBy: { title: "asc" },
  });

  return quizzes.map((q) => ({
    id: q.id,
    title: q.title,
    marks: q.marks,
    questionCount: q._count.questions,
    description: q.description,
  }));
}

export async function getTestLeaderboard(
  quizId: string
): Promise<LeaderboardRow[]> {
  const session = await getSession();
  const role = (session?.user as any)?.role;
  if (role !== "ADMIN" && role !== "SUPERADMIN") return [];

  const attempts = await db.quizAttempt.findMany({
    where: { quizId, status: "COMPLETED" },
    select: {
      score: true,
      percentage: true,
      user: { select: { name: true, email: true } },
    },
    orderBy: { score: "desc" },
  });

  return attempts.map((a, i) => ({
    rank: i + 1,
    name: a.user.name || "Unknown",
    email: a.user.email,
    score: Math.round(a.score * 100) / 100,
    percentage: Math.round(a.percentage * 100) / 100,
  }));
}
