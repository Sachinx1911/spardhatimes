import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  User, 
  History, 
  Bookmark, 
  Award, 
  Bell, 
  Settings, 
  Clock, 
  CheckCircle2, 
  Percent, 
  Download,
  AlertCircle,
  TrendingUp,
  FileText
} from "lucide-react";
import Link from "next/link";
import { SettingsForm } from "@/components/dashboard/SettingsForm";
import { PerformanceCharts } from "@/components/dashboard/PerformanceCharts";

export const revalidate = 0; // Dynamic student dashboard data

export default async function StudentDashboardPage() {
  // 1. Enforce Authentication
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }

  const userId = session.user.id;

  // 2. Fetch Student Analytics and Data from Prisma
  let user = null;
  let attempts: any[] = [];
  let bookmarks: any[] = [];
  let certificates: any[] = [];
  let notifications: any[] = [];

  try {
    user = await db.user.findUnique({
      where: { id: userId },
    });

    attempts = await db.quizAttempt.findMany({
      where: { userId },
      include: {
        quiz: {
          select: {
            title: true,
            slug: true,
            marks: true,
            category: { select: { name: true } },
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    bookmarks = await db.bookmark.findMany({
      where: { userId },
      include: {
        quiz: { select: { title: true } },
        question: true
      }
    });

    certificates = await db.certificate.findMany({
      where: { userId },
      include: {
        quiz: { select: { title: true } }
      }
    });

    notifications = await db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10
    });
  } catch (err) {
    console.error("Error loading student dashboard:", err);
  }

  // Computed Stats
  const totalAttempts = attempts.length;
  
  const avgAccuracy = totalAttempts > 0 
    ? Math.round(attempts.reduce((acc, curr) => acc + curr.percentage, 0) / totalAttempts)
    : 0;

  const totalPassingAttempts = attempts.filter(a => a.score >= 5).length; // simple pass check
  const totalCertificates = certificates.length;

  // Analytics chart series (oldest -> newest)
  const chronological = [...attempts].reverse();
  const attemptSeries = chronological.map((a, i) => {
    const answered = a.correctAnswers + a.wrongAnswers;
    const d = new Date(a.createdAt);
    return {
      label: `T${i + 1} (${d.getDate()}/${d.getMonth() + 1})`,
      percentage: Math.max(0, Math.round(a.percentage)),
      accuracy: answered > 0 ? Math.round((a.correctAnswers / answered) * 100) : 0,
    };
  });

  const catMap = new Map<string, { total: number; count: number }>();
  for (const a of attempts) {
    const name = a.quiz.category?.name || "General";
    const entry = catMap.get(name) || { total: 0, count: 0 };
    entry.total += a.percentage;
    entry.count += 1;
    catMap.set(name, entry);
  }
  const categoryPerf = Array.from(catMap.entries()).map(([label, { total, count }]) => ({
    label,
    avgPercentage: Math.max(0, Math.round(total / count)),
    attempts: count,
  }));

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              Welcome back, {session.user.name || "Student"}!
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Check your analytics, resume mock tests, or download certificates.
            </p>
          </div>
          <Link href="/quizzes">
            <Button className="font-semibold shadow-md">
              Browse Mock Tests
            </Button>
          </Link>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-5 text-center">
            <History className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-xs text-muted-foreground uppercase font-semibold">Mock Exams</p>
            <p className="text-2xl font-black text-foreground mt-1">{totalAttempts}</p>
          </Card>
          
          <Card className="p-5 text-center">
            <Percent className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-xs text-muted-foreground uppercase font-semibold">Average Accuracy</p>
            <p className="text-2xl font-black text-foreground mt-1">{avgAccuracy}%</p>
          </Card>

          <Card className="p-5 text-center">
            <Award className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-xs text-muted-foreground uppercase font-semibold">Certificates Earned</p>
            <p className="text-2xl font-black text-foreground mt-1">{totalCertificates}</p>
          </Card>

          <Card className="p-5 text-center">
            <Bell className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-xs text-muted-foreground uppercase font-semibold">Notifications</p>
            <p className="text-2xl font-black text-foreground mt-1">
              {notifications.filter(n => !n.read).length} <span className="text-xs text-muted-foreground font-normal">Unread</span>
            </p>
          </Card>
        </div>

        {/* Tabs Content */}
        <Tabs defaultValue="attempts" className="w-full">
          <TabsList className="grid grid-cols-3 sm:grid-cols-6 w-full bg-white dark:bg-slate-900 border border-border/40 p-1 rounded-lg">
            <TabsTrigger value="attempts">Attempt History</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
            <TabsTrigger value="notifications">Alerts</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Tab 1: Attempt History */}
          <TabsContent value="attempts">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" /> Test Attempt History
                </CardTitle>
                <CardDescription>Review score sheets and performance metrics of your completed mock exams.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {totalAttempts === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    No attempts recorded. Solve a test to see your history!
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-950 border-b border-border/40 font-semibold text-xs text-muted-foreground uppercase">
                          <th className="p-4">Mock Test</th>
                          <th className="p-4">Date</th>
                          <th className="p-4 text-center">Score</th>
                          <th className="p-4 text-center">Accuracy</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {attempts.map((a) => (
                          <tr key={a.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                            <td className="p-4 font-bold text-foreground">{a.quiz.title}</td>
                            <td className="p-4 text-muted-foreground text-xs">
                              {new Date(a.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
                            </td>
                            <td className="p-4 text-center font-bold">
                              {a.score} <span className="text-[10px] text-muted-foreground">/ {a.quiz.marks}</span>
                            </td>
                            <td className="p-4 text-center">
                              <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold ${
                                a.percentage >= 60 
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                                  : "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400"
                              }`}>
                                {a.percentage}%
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <Link href={`/quiz/result/${a.id}`}>
                                <Button variant="secondary" size="sm" className="font-semibold text-xs">
                                  View Analysis
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Performance Analytics */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" /> Performance Analytics
                </CardTitle>
                <CardDescription>Track score trends, accuracy, and category-wise strengths.</CardDescription>
              </CardHeader>
              <CardContent>
                <PerformanceCharts attemptSeries={attemptSeries} categoryPerf={categoryPerf} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Bookmarks */}
          <TabsContent value="bookmarks">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Bookmark className="h-5 w-5 text-primary" /> Bookmarked Questions
                </CardTitle>
                <CardDescription>Review flagged questions from your attempts.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {bookmarks.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    No questions bookmarked yet.
                  </div>
                ) : (
                  bookmarks.map((bm) => (
                    <div key={bm.id} className="p-4 border border-border/40 rounded-lg bg-slate-50/50 dark:bg-slate-950/20 space-y-2 text-sm">
                      <div className="flex justify-between items-center text-xs text-muted-foreground font-semibold">
                        <span>Quiz: {bm.quiz.title}</span>
                        <span className="text-primary font-bold">Correct Answer: {bm.question.correctAnswer}</span>
                      </div>
                      <h4 className="font-bold text-foreground">{bm.question.text}</h4>
                      {bm.question.explanation && (
                        <p className="text-xs text-muted-foreground leading-relaxed mt-2 p-2.5 bg-white dark:bg-slate-900 rounded border border-border/20">
                          {bm.question.explanation}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Certificates */}
          <TabsContent value="certificates">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" /> Earned Certificates
                </CardTitle>
                <CardDescription>Download official passing certificates in PDF format.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {certificates.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    No certificates earned yet. Pass mock tests with passing scores to earn certificates.
                  </div>
                ) : (
                  certificates.map((cert) => (
                    <div key={cert.id} className="flex flex-col sm:flex-row items-center justify-between p-5 border border-border/40 rounded-lg bg-white dark:bg-slate-900 gap-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-yellow-100 dark:bg-yellow-950/40 text-yellow-600 rounded-lg flex items-center justify-center">
                          <Award className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-foreground">{cert.quiz.title} Certificate</h4>
                          <p className="text-xs text-muted-foreground">Code: {cert.certificateCode} | Issued on {new Date(cert.issueDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <a href={cert.downloadUrl || `/api/certificates/${cert.certificateCode}/pdf`} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                        <Button variant="secondary" size="sm" className="w-full flex items-center justify-center gap-1 font-semibold text-xs">
                          <Download className="h-4 w-4" /> Download Certificate
                        </Button>
                      </a>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 4: Notifications */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" /> User Notifications
                </CardTitle>
                <CardDescription>Latest alerts and updates from the exam platform.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    No notifications.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className={`p-4 rounded-lg border text-sm flex gap-3 items-start ${
                      !n.read 
                        ? "bg-blue-50/50 border-blue-100 dark:bg-blue-950/10 dark:border-blue-900/40" 
                        : "border-border/40"
                    }`}>
                      <Bell className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                          {n.title}
                          {!n.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                        </h4>
                        <p className="text-muted-foreground text-xs leading-relaxed mt-1">{n.message}</p>
                        <span className="text-[10px] text-muted-foreground block mt-2">
                          {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], {hour: "2-digit", minute:"2-digit"})}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 5: Settings */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" /> Profile & Account Settings
                </CardTitle>
                <CardDescription>Update your display name, password credentials, or view your user role.</CardDescription>
              </CardHeader>
              <CardContent>
                <SettingsForm
                  name={user?.name || ""}
                  email={user?.email || ""}
                  role={user?.role || "STUDENT"}
                  phone={user?.phone || ""}
                  joinedAt={user?.createdAt || null}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
