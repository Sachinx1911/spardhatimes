import React from "react";
import Link from "next/link";
import db from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Clock, 
  HelpCircle, 
  Award, 
  ShieldAlert, 
  Bookmark, 
  Eye, 
  UserCheck,
  ChevronRight,
  SlidersHorizontal
} from "lucide-react";

export const revalidate = 10; // short cache for listing updates

export const metadata = {
  title: "Mock Quizzes Directory",
  description:
    "Browse all published mock tests by category and difficulty. Free online test series for MPSC, banking, railways, grammar, and general knowledge.",
  alternates: { canonical: "/quizzes" },
};

interface PageProps {
  searchParams: Promise<{
    category?: string;
    difficulty?: string;
    search?: string;
    page?: string;
  }>;
}

const PAGE_SIZE = 9;

export default async function QuizzesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const selectedCategory = params.category || "";
  const selectedDifficulty = params.difficulty || "";
  const searchQuery = params.search || "";
  const currentPage = Math.max(1, parseInt(params.page || "1", 10) || 1);

  // 1. Fetch Categories for Filters
  let categories: any[] = [];
  try {
    categories = await db.category.findMany({
      orderBy: { name: "asc" }
    });
  } catch (err) {
    console.error("Error fetching categories:", err);
  }

  // 2. Fetch Quizzes with Filters
  let quizzes: any[] = [];
  let totalQuizzes = 0;
  try {
    const whereClause: any = {
      status: "PUBLISHED"
    };

    if (selectedCategory) {
      whereClause.category = {
        slug: selectedCategory
      };
    }

    if (selectedDifficulty) {
      whereClause.difficulty = selectedDifficulty;
    }

    if (searchQuery) {
      whereClause.OR = [
        { title: { contains: searchQuery } },
        { description: { contains: searchQuery } }
      ];
    }

    totalQuizzes = await db.quiz.count({ where: whereClause });

    quizzes = await db.quiz.findMany({
      where: whereClause,
      include: {
        category: true,
        questions: { select: { id: true } },
        _count: { select: { attempts: true } }
      },
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    });
  } catch (err) {
    console.error("Error fetching quizzes:", err);
  }

  const totalPages = Math.max(1, Math.ceil(totalQuizzes / PAGE_SIZE));

  // Preserve active filters in pagination links
  const pageHref = (page: number) => {
    const qp = new URLSearchParams();
    if (selectedCategory) qp.set("category", selectedCategory);
    if (selectedDifficulty) qp.set("difficulty", selectedDifficulty);
    if (searchQuery) qp.set("search", searchQuery);
    if (page > 1) qp.set("page", String(page));
    const qs = qp.toString();
    return qs ? `/quizzes?${qs}` : "/quizzes";
  };

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-foreground">Mock Quizzes Directory</h1>
          <p className="text-muted-foreground text-sm mt-1">Select a test from our active catalog to begin practicing</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4 border-b border-border/40 pb-3">
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                <span className="font-bold text-sm text-foreground uppercase tracking-wider">Filter Options</span>
              </div>
              
              {/* Search form */}
              <form method="GET" action="/quizzes" className="space-y-4">
                {selectedCategory && <input type="hidden" name="category" value={selectedCategory} />}
                {selectedDifficulty && <input type="hidden" name="difficulty" value={selectedDifficulty} />}
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    name="search" 
                    placeholder="Search test names..." 
                    className="pl-9"
                    defaultValue={searchQuery}
                  />
                </div>
                <Button type="submit" variant="secondary" className="w-full text-xs font-semibold">
                  Apply Search
                </Button>
              </form>

              <div className="h-px bg-border/40 my-6" />

              {/* Categories filter */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Categories</span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  <Link 
                    href={`/quizzes?${new URLSearchParams({
                      ...(selectedDifficulty ? { difficulty: selectedDifficulty } : {}),
                      ...(searchQuery ? { search: searchQuery } : {}),
                    })}`}
                    className={`block text-xs py-1.5 px-2.5 rounded-md transition-colors ${
                      !selectedCategory 
                        ? "bg-primary text-white font-bold" 
                        : "hover:bg-muted text-foreground"
                    }`}
                  >
                    All Categories
                  </Link>
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/quizzes?${new URLSearchParams({
                        category: cat.slug,
                        ...(selectedDifficulty ? { difficulty: selectedDifficulty } : {}),
                        ...(searchQuery ? { search: searchQuery } : {}),
                      })}`}
                      className={`block text-xs py-1.5 px-2.5 rounded-md transition-colors ${
                        selectedCategory === cat.slug 
                          ? "bg-primary text-white font-bold" 
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="h-px bg-border/40 my-6" />

              {/* Difficulty filter */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Difficulty</span>
                <div className="space-y-1.5">
                  {[
                    { label: "All Levels", val: "" },
                    { label: "Easy", val: "EASY" },
                    { label: "Medium", val: "MEDIUM" },
                    { label: "Hard", val: "HARD" },
                  ].map((level) => (
                    <Link
                      key={level.val}
                      href={`/quizzes?${new URLSearchParams({
                        ...(selectedCategory ? { category: selectedCategory } : {}),
                        ...(level.val ? { difficulty: level.val } : {}),
                        ...(searchQuery ? { search: searchQuery } : {}),
                      })}`}
                      className={`block text-xs py-1.5 px-2.5 rounded-md transition-colors ${
                        selectedDifficulty === level.val 
                          ? "bg-primary text-white font-bold" 
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      {level.label}
                    </Link>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Quizzes List */}
          <div className="lg:col-span-3 space-y-4">
            {quizzes.length === 0 ? (
              <Card className="p-10 text-center">
                <ShieldAlert className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-bold text-lg text-foreground">No Quizzes Found</h3>
                <p className="text-sm text-muted-foreground mt-1">Try resetting your filter parameters or search terms.</p>
                <Link href="/quizzes">
                  <Button className="mt-4" size="sm">Reset Filters</Button>
                </Link>
              </Card>
            ) : (
              quizzes.map((quiz) => (
                <Card key={quiz.id} className="hover:border-primary/30 transition-all">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      
                      {/* Left: Info */}
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-primary">
                            {quiz.category?.name}
                          </span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                            quiz.difficulty === "EASY" ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400" :
                            quiz.difficulty === "MEDIUM" ? "bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400" :
                            "bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400"
                          }`}>
                            {quiz.difficulty}
                          </span>
                        </div>
                        
                        <h3 className="text-lg font-bold text-foreground hover:text-primary">
                          {quiz.title}
                        </h3>
                        
                        <p className="text-sm text-muted-foreground line-clamp-2 max-w-2xl">
                          {quiz.description}
                        </p>
                        
                        {/* Meta counts */}
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-primary" /> {quiz.duration} Mins
                          </span>
                          <span className="flex items-center gap-1">
                            <HelpCircle className="h-3.5 w-3.5 text-primary" /> {quiz.questions?.length} Questions
                          </span>
                          <span className="flex items-center gap-1">
                            <Award className="h-3.5 w-3.5 text-primary" /> {quiz.marks} Marks
                          </span>
                          <span className="flex items-center gap-1">
                            <UserCheck className="h-3.5 w-3.5 text-primary" /> {quiz._count?.attempts} Attempts
                          </span>
                        </div>
                      </div>

                      {/* Right: CTA button */}
                      <div className="shrink-0 flex flex-row sm:flex-col items-center justify-between sm:justify-center gap-2">
                        <Link href={`/quiz/${quiz.slug}/attempt`} className="w-full">
                          <Button className="w-full font-semibold flex items-center justify-center gap-1 group shadow-sm">
                            Start Test <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                          </Button>
                        </Link>
                      </div>

                    </div>
                  </CardContent>
                </Card>
              ))
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <p className="text-xs text-muted-foreground">
                  Page {currentPage} of {totalPages} ({totalQuizzes} tests)
                </p>
                <div className="flex items-center gap-2">
                  {currentPage > 1 ? (
                    <Link href={pageHref(currentPage - 1)}>
                      <Button variant="outline" size="sm" className="font-semibold text-xs">
                        ← Previous
                      </Button>
                    </Link>
                  ) : (
                    <Button variant="outline" size="sm" className="font-semibold text-xs" disabled>
                      ← Previous
                    </Button>
                  )}
                  {currentPage < totalPages ? (
                    <Link href={pageHref(currentPage + 1)}>
                      <Button variant="outline" size="sm" className="font-semibold text-xs">
                        Next →
                      </Button>
                    </Link>
                  ) : (
                    <Button variant="outline" size="sm" className="font-semibold text-xs" disabled>
                      Next →
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
