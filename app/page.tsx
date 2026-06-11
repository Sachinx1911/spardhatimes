import React from "react";
import Link from "next/link";
import db from "@/lib/db";
import { getSetting } from "@/lib/settings";
import { CategoryIcon } from "@/components/shared/CategoryIcon";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Brain,
  Globe,
  BookOpen,
  Map as MapIcon,
  Atom,
  Percent, 
  GitBranch, 
  PenTool, 
  Languages, 
  Laptop,
  CheckCircle2,
  Trophy,
  Zap,
  Smartphone,
  BarChart3,
  HelpCircle,
  ArrowRight,
  Clock,
  FileText,
  Quote,
  Star
} from "lucide-react";

// Icon mapper for dynamic category icons
const iconMap: Record<string, React.ComponentType<any>> = {
  Brain: Brain,
  Globe: Globe,
  BookOpen: BookOpen,
  Map: MapIcon,
  Atom: Atom,
  Percent: Percent,
  GitBranch: GitBranch,
  PenTool: PenTool,
  Languages: Languages,
  Laptop: Laptop,
};

export const revalidate = 60; // Revalidate home page every minute

export default async function Home() {
  // Fetch real platform data for all homepage sections
  let categories: any[] = [];
  let latestQuizzes: any[] = [];
  let topPerformers: { name: string; score: number; accuracy: number; attempts: number }[] = [];
  let stats = { users: 0, quizzes: 0, attempts: 0, avgAccuracy: 0 };

  try {
    const [cats, quizzes, userCount, quizCount, completedAttempts] = await Promise.all([
      db.category.findMany({ take: 6, orderBy: { name: "asc" } }),
      db.quiz.findMany({
        where: { status: "PUBLISHED" },
        include: {
          category: { select: { name: true } },
          _count: { select: { questions: true, attempts: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 4,
      }),
      db.user.count(),
      db.quiz.count({ where: { status: "PUBLISHED" } }),
      db.quizAttempt.findMany({
        where: { status: "COMPLETED" },
        select: {
          score: true,
          percentage: true,
          correctAnswers: true,
          wrongAnswers: true,
          user: { select: { id: true, name: true } },
        },
      }),
    ]);

    categories = cats;
    latestQuizzes = quizzes;

    const avg = completedAttempts.length > 0
      ? completedAttempts.reduce((acc, a) => acc + Math.max(0, a.percentage), 0) / completedAttempts.length
      : 0;
    stats = {
      users: userCount,
      quizzes: quizCount,
      attempts: completedAttempts.length,
      avgAccuracy: Math.round(avg * 10) / 10,
    };

    // Best attempt per user, ranked by score
    const bestByUser = new Map<string, { name: string; score: number; accuracy: number; attempts: number }>();
    for (const a of completedAttempts) {
      const answered = a.correctAnswers + a.wrongAnswers;
      const accuracy = answered > 0 ? Math.round((a.correctAnswers / answered) * 100) : 0;
      const existing = bestByUser.get(a.user.id);
      if (!existing) {
        bestByUser.set(a.user.id, { name: a.user.name || "Anonymous", score: a.score, accuracy, attempts: 1 });
      } else {
        existing.attempts += 1;
        if (a.score > existing.score) {
          existing.score = a.score;
          existing.accuracy = accuracy;
        }
      }
    }
    topPerformers = Array.from(bestByUser.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  } catch (err) {
    console.error("Error fetching homepage data:", err);
  }

  const announcement = await getSetting("site_announcement");

  // FAQs static array
  const faqs = [
    {
      q: "Are these mock tests free?",
      a: "Yes, we offer a wide variety of free mock tests. Some advanced, premium test series designed by top instructors are paid, which you can unlock anytime.",
    },
    {
      q: "Can I attempt a quiz multiple times?",
      a: "Absolutely! You can re-attempt any quiz to improve your score and speed. Your attempt history will show your growth chart over time.",
    },
    {
      q: "How is the rank and percentile calculated?",
      a: "Ranks are calculated dynamically based on user scores. Percentiles compare your score against all other students who attempted the same test.",
    },
    {
      q: "Do you support negative markings?",
      a: "Yes. To simulate real competitive exams, admins can configure custom positive and negative markings per question or per test.",
    },
  ];

  // JSON-LD structured data for search engines
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "QuizPlatform Pro",
    description:
      "Online mock test and quiz platform for competitive exams with instant results, analytics, leaderboards, and certificates.",
    url: process.env.NEXTAUTH_URL || "http://localhost:3000",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/quizzes?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <div className="flex flex-col min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Admin-configured announcement banner */}
      {announcement && (
        <div className="bg-primary text-white text-center text-sm font-semibold px-4 py-2.5">
          📢 {announcement}
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32 bg-gradient-to-b from-blue-50/50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-xs font-semibold mb-6 shadow-sm border border-blue-200/30">
            <Trophy className="h-3.5 w-3.5 text-primary" /> Active Test Platform for Competitive Excellence
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight max-w-4xl mx-auto leading-[1.1]">
            Master Your Competitive Exams with <span className="text-primary bg-clip-text">Real-Time Mock Tests</span>
          </h1>
          
          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-normal">
            Analyze your performance, track accuracy, access robust analytics, and earn certificates. Built for serious aspirants of civil services, banking, railways, and languages.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/quizzes">
              <Button size="lg" className="w-full sm:w-auto flex items-center gap-2 group text-base font-semibold shadow-lg shadow-primary/20">
                Start Test <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/categories">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-base font-semibold">
                Explore Categories
              </Button>
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto border-t border-border/60 pt-10">
            <div className="text-center">
              <p className="text-3xl font-extrabold text-primary">{stats.users.toLocaleString("en-IN")}</p>
              <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider mt-1">Users Enrolled</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-extrabold text-primary">{stats.quizzes.toLocaleString("en-IN")}</p>
              <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider mt-1">Mock Quizzes</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-extrabold text-primary">{stats.avgAccuracy}%</p>
              <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider mt-1">Avg Score Trend</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-extrabold text-primary">{stats.attempts.toLocaleString("en-IN")}</p>
              <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider mt-1">Attempts Logged</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories Section */}
      <section className="py-20 bg-white dark:bg-slate-900 border-y border-border/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Popular Test Categories
            </h2>
            <p className="mt-4 text-muted-foreground">
              Select a domain and start practicing with carefully structured questions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => {
              return (
                <Card key={cat.id} className="relative group overflow-hidden border border-border bg-slate-50/50 dark:bg-slate-950/20 hover:border-primary/50 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-950 text-primary group-hover:scale-110 transition-transform">
                        <CategoryIcon icon={cat.icon} className="h-6 w-6" />
                      </div>
                      <span className="text-xs font-semibold bg-white dark:bg-slate-800 border border-border/40 px-2.5 py-1 rounded-full text-muted-foreground">
                        {cat.totalTests} Tests
                      </span>
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {cat.name}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {cat.totalQuestions} active questions covering multiple topics.
                    </p>
                    <div className="mt-6 flex items-center justify-between">
                      <Link href={`/quizzes?category=${cat.slug}`} className="w-full">
                        <Button className="w-full text-xs font-semibold flex items-center gap-1.5" variant="secondary">
                          Practice Now <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <Link href="/categories">
              <Button variant="link" className="font-semibold text-primary flex items-center gap-1.5 mx-auto">
                View All Categories <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Platform Features Built For Excellence
            </h2>
            <p className="mt-4 text-muted-foreground">
              Everything you need to benchmark, evaluate, and skyrocket your exam preparations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-slate-900 border border-border p-8 rounded-lg shadow-sm">
              <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-950 text-primary flex items-center justify-center mb-6">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Unlimited Tests</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Take as many attempts as you need. Practice topic-wise tests, micro quizzes, and full-length test series without constraints.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-slate-900 border border-border p-8 rounded-lg shadow-sm">
              <div className="h-12 w-12 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Performance Tracking</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Unlock instant rich analytical reports. View accuracy graphs, subject performance charts, time management stats, and percentiles.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-slate-900 border border-border p-8 rounded-lg shadow-sm">
              <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-6">
                <Smartphone className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Mobile Friendly & PWA</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Install our PWA app on your phone. Solve tests on-the-go with full offline support, service workers, and responsive designs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Quizzes Section */}
      {latestQuizzes.length > 0 && (
        <section className="py-20 bg-white dark:bg-slate-900 border-t border-border/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Latest Mock Quizzes
              </h2>
              <p className="mt-4 text-muted-foreground">
                Freshly published test series — attempt them while they are trending.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {latestQuizzes.map((quiz) => (
                <Card key={quiz.id} className="group border border-border bg-slate-50/50 dark:bg-slate-950/20 hover:border-primary/50 transition-all duration-300 flex flex-col">
                  <CardContent className="p-6 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-primary uppercase tracking-wider">
                        {quiz.category?.name}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                        quiz.difficulty === "EASY"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                          : quiz.difficulty === "HARD"
                          ? "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
                      }`}>
                        {quiz.difficulty}
                      </span>
                    </div>
                    <h3 className="font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                      {quiz.title}
                    </h3>
                    <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" /> {quiz._count.questions} Qs
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {quiz.duration} min
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> {quiz._count.attempts} attempts
                      </span>
                    </div>
                    <div className="mt-auto pt-5">
                      <Link href={`/quiz/${quiz.slug}/attempt`} className="block">
                        <Button variant="secondary" className="w-full text-xs font-semibold flex items-center gap-1.5">
                          Attempt Now <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link href="/quizzes">
                <Button variant="link" className="font-semibold text-primary flex items-center gap-1.5 mx-auto">
                  Browse All Quizzes <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Top Performers Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950 border-t border-border/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 text-xs font-semibold mb-4 border border-yellow-200/20">
                ⭐ Wall of Fame
              </div>
              <h2 className="text-3xl font-extrabold text-foreground tracking-tight sm:text-4xl">
                Compete on the Global Leaderboard
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Rankings are updated dynamically after every attempt. Top scorers are recognized daily, weekly, and monthly. Practice diligently to get featured on the leaderboard!
              </p>
              <div className="mt-8 flex items-center gap-4">
                <Link href="/leaderboard">
                  <Button className="flex items-center gap-1.5">
                    View Global Leaderboard <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-950 border border-border p-6 rounded-lg shadow-inner">
              <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-4">
                <span className="font-bold text-sm text-foreground uppercase tracking-wide">Top Performers this month</span>
                <span className="text-xs text-primary font-bold">Updated Live</span>
              </div>
              <div className="space-y-4">
                {topPerformers.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    No ranked attempts yet — be the first on the leaderboard!
                  </div>
                ) : (
                  topPerformers.map((perf, idx) => {
                    const rank = idx + 1;
                    return (
                      <div key={rank} className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-md border border-border/40 hover:scale-101 transition-transform">
                        <div className="flex items-center gap-3">
                          <span className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs ${
                            rank === 1 ? "bg-yellow-500 text-white" :
                            rank === 2 ? "bg-slate-300 text-slate-800" :
                            "bg-amber-600 text-white"
                          }`}>
                            #{rank}
                          </span>
                          <div>
                            <p className="font-bold text-sm text-foreground">{perf.name}</p>
                            <p className="text-xs text-muted-foreground">Accuracy: {perf.accuracy}%</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-extrabold text-sm text-primary">{perf.score} pts</p>
                          <p className="text-xs text-muted-foreground">
                            Solved {perf.attempts} {perf.attempts === 1 ? "test" : "tests"}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white dark:bg-slate-900 border-t border-border/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Loved by Serious Aspirants
            </h2>
            <p className="mt-4 text-muted-foreground">
              Students preparing for MPSC, banking, railways, and language exams trust our analytics-first approach.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "The negative-marking simulation and per-question timer trained me to manage time like the real MPSC prelims. My accuracy jumped from 60% to 85% in two months.",
                name: "Aishwarya K.",
                tag: "MPSC Aspirant, Pune",
              },
              {
                quote: "Category-wise performance charts showed me exactly where I was weak — Marathi grammar. Focused practice on that one category changed everything.",
                name: "Rohit D.",
                tag: "Banking Exam Aspirant",
              },
              {
                quote: "I love that results are instant with full explanations for every question. The certificate after passing a series keeps me motivated to finish what I start.",
                name: "Snehal P.",
                tag: "Railway Exam Aspirant",
              },
            ].map((t, i) => (
              <div key={i} className="bg-slate-50 dark:bg-slate-950 border border-border p-8 rounded-lg flex flex-col">
                <Quote className="h-7 w-7 text-primary/40 mb-4" />
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-6 pt-5 border-t border-border/40">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, s) => (
                      <Star key={s} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="font-bold text-sm text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.tag}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-slate-50 dark:bg-slate-950 border-t border-border/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-muted-foreground">
              Have questions about mock exams, analytics, or certificates? We have got you covered.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 border border-border p-6 rounded-lg">
                <h3 className="flex items-start gap-2.5 font-bold text-foreground text-base">
                  <HelpCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  {faq.q}
                </h3>
                <p className="mt-3 text-sm text-muted-foreground pl-7 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
