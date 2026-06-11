import React from "react";
import Link from "next/link";
import db from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Brain, 
  Globe, 
  BookOpen, 
  Map, 
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
  ArrowRight
} from "lucide-react";

// Icon mapper for dynamic category icons
const iconMap: Record<string, React.ComponentType<any>> = {
  Brain: Brain,
  Globe: Globe,
  BookOpen: BookOpen,
  Map: Map,
  Atom: Atom,
  Percent: Percent,
  GitBranch: GitBranch,
  PenTool: PenTool,
  Languages: Languages,
  Laptop: Laptop,
};

export const revalidate = 60; // Revalidate home page every minute

export default async function Home() {
  // Fetch categories from DB
  let categories: any[] = [];
  try {
    categories = await db.category.findMany({
      take: 6,
      orderBy: { name: "asc" }
    });
  } catch (err) {
    console.error("Error fetching categories for homepage:", err);
  }

  // Fallback if DB is not seeded or fails
  if (categories.length === 0) {
    categories = [
      { id: "1", name: "General Knowledge", slug: "general-knowledge", icon: "Brain", totalTests: 1, totalQuestions: 5 },
      { id: "2", name: "Science", slug: "science", icon: "Atom", totalTests: 1, totalQuestions: 5 },
      { id: "3", name: "History", slug: "history", icon: "BookOpen", totalTests: 0, totalQuestions: 0 },
      { id: "4", name: "Mathematics", slug: "mathematics", icon: "Percent", totalTests: 0, totalQuestions: 0 },
      { id: "5", name: "Computer Knowledge", slug: "computer-knowledge", icon: "Laptop", totalTests: 0, totalQuestions: 0 },
      { id: "6", name: "English Grammar", slug: "english-grammar", icon: "Languages", totalTests: 0, totalQuestions: 0 },
    ];
  }

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

  return (
    <div className="flex flex-col min-h-screen">
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
              <p className="text-3xl font-extrabold text-primary">5,000+</p>
              <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider mt-1">Users Enrolled</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-extrabold text-primary">150+</p>
              <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider mt-1">Mock Quizzes</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-extrabold text-primary">98.4%</p>
              <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider mt-1">Accuracy Trend</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-extrabold text-primary">10k+</p>
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
              const IconComponent = iconMap[cat.icon || "Brain"] || Brain;
              return (
                <Card key={cat.id} className="relative group overflow-hidden border border-border bg-slate-50/50 dark:bg-slate-950/20 hover:border-primary/50 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-950 text-primary group-hover:scale-110 transition-transform">
                        <IconComponent className="h-6 w-6" />
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

      {/* Top Performers Section */}
      <section className="py-20 bg-white dark:bg-slate-900 border-t border-border/20">
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
                {[
                  { name: "Rahul Sharma", score: 98.4, rank: 1, accuracy: "98%" },
                  { name: "Sneha Patel", score: 95.2, rank: 2, accuracy: "96%" },
                  { name: "Vikram Singh", score: 92.0, rank: 3, accuracy: "94%" },
                ].map((perf) => (
                  <div key={perf.rank} className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-md border border-border/40 hover:scale-101 transition-transform">
                    <div className="flex items-center gap-3">
                      <span className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs ${
                        perf.rank === 1 ? "bg-yellow-500 text-white" :
                        perf.rank === 2 ? "bg-slate-300 text-slate-800" :
                        "bg-amber-600 text-white"
                      }`}>
                        #{perf.rank}
                      </span>
                      <div>
                        <p className="font-bold text-sm text-foreground">{perf.name}</p>
                        <p className="text-xs text-muted-foreground">Accuracy: {perf.accuracy}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-sm text-primary">{perf.score} pts</p>
                      <p className="text-xs text-muted-foreground">Solved 24 tests</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950 border-t border-border/20">
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
