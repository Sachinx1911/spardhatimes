import React from "react";
import db from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Users, 
  Layers, 
  FileText, 
  HelpCircle, 
  History, 
  Calendar,
  Activity
} from "lucide-react";

export const revalidate = 0; // Dynamic admin dashboard data

export default async function AdminDashboardPage() {
  // 1. Fetch Stats from DB
  let userCount = 0;
  let categoryCount = 0;
  let quizCount = 0;
  let questionCount = 0;
  let dailyAttempts = 0;
  let monthlyAttempts = 0;
  let recentAttempts: any[] = [];

  const now = new Date();
  const dailyDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const monthlyDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  try {
    userCount = await db.user.count();
    categoryCount = await db.category.count();
    quizCount = await db.quiz.count();
    questionCount = await db.question.count();
    
    dailyAttempts = await db.quizAttempt.count({
      where: {
        createdAt: { gte: dailyDate },
        status: "COMPLETED"
      }
    });

    monthlyAttempts = await db.quizAttempt.count({
      where: {
        createdAt: { gte: monthlyDate },
        status: "COMPLETED"
      }
    });

    recentAttempts = await db.quizAttempt.findMany({
      take: 5,
      include: {
        user: { select: { name: true, email: true } },
        quiz: { select: { title: true } }
      },
      orderBy: { createdAt: "desc" }
    });
  } catch (err) {
    console.error("Error loading admin stats:", err);
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-foreground">Administration Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Platform overview, statistics, and system telemetry</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Total Users</p>
              <p className="text-2xl font-black text-foreground mt-1.5">{userCount}</p>
            </div>
            <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-primary rounded-md">
              <Users className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Active Categories</p>
              <p className="text-2xl font-black text-foreground mt-1.5">{categoryCount}</p>
            </div>
            <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-primary rounded-md">
              <Layers className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Total Quizzes</p>
              <p className="text-2xl font-black text-foreground mt-1.5">{quizCount}</p>
            </div>
            <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-primary rounded-md">
              <FileText className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Total Questions</p>
              <p className="text-2xl font-black text-foreground mt-1.5">{questionCount}</p>
            </div>
            <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-primary rounded-md">
              <HelpCircle className="h-5 w-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Engagements Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-5 text-center flex flex-col justify-center items-center">
          <Calendar className="h-8 w-8 text-primary mb-3" />
          <p className="text-xs text-muted-foreground uppercase font-semibold">Daily Attempts (24h)</p>
          <p className="text-4xl font-extrabold text-foreground mt-2">{dailyAttempts}</p>
          <p className="text-xs text-muted-foreground mt-2">Completed quiz attempts</p>
        </Card>

        <Card className="p-5 text-center flex flex-col justify-center items-center">
          <History className="h-8 w-8 text-primary mb-3" />
          <p className="text-xs text-muted-foreground uppercase font-semibold">Monthly Attempts (30d)</p>
          <p className="text-4xl font-extrabold text-foreground mt-2">{monthlyAttempts}</p>
          <p className="text-xs text-muted-foreground mt-2">Completed quiz attempts</p>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" /> Recent Test Attempts
          </CardTitle>
          <CardDescription>Real-time submission logs across the platform.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 border-t border-border/40">
          {recentAttempts.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No recent attempts recorded.
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {recentAttempts.map((attempt) => (
                <div key={attempt.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-950/20 text-sm">
                  <div>
                    <p className="font-bold text-foreground">{attempt.user.name}</p>
                    <p className="text-xs text-muted-foreground">Quiz: {attempt.quiz.title}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{attempt.score} pts</p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(attempt.createdAt).toLocaleDateString()} {new Date(attempt.createdAt).toLocaleTimeString([], {hour: "2-digit", minute:"2-digit"})}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
