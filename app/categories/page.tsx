import React from "react";
import Link from "next/link";
import db from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  ArrowRight,
  HelpCircle,
  FileText
} from "lucide-react";

import { CategoryIcon } from "@/components/shared/CategoryIcon";

export const metadata = {
  title: "All Test Categories",
  description:
    "Explore every quiz category — General Knowledge, Current Affairs, History, Geography, Science, Mathematics, Reasoning, Marathi Grammar, English Grammar, and Computer Knowledge.",
  alternates: { canonical: "/categories" },
};

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

export const revalidate = 60;

export default async function CategoriesPage() {
  let categories: any[] = [];
  try {
    categories = await db.category.findMany({
      orderBy: { name: "asc" }
    });
  } catch (err) {
    console.error("Error fetching categories:", err);
  }

  // Fallback
  if (categories.length === 0) {
    categories = [
      { id: "1", name: "General Knowledge", slug: "general-knowledge", icon: "Brain", totalTests: 1, totalQuestions: 5 },
      { id: "2", name: "Science", slug: "science", icon: "Atom", totalTests: 1, totalQuestions: 5 },
      { id: "3", name: "History", slug: "history", icon: "BookOpen", totalTests: 0, totalQuestions: 0 },
      { id: "4", name: "Mathematics", slug: "mathematics", icon: "Percent", totalTests: 0, totalQuestions: 0 },
    ];
  }

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Test Categories
          </h1>
          <p className="mt-4 text-muted-foreground">
            Explore topic-wise mock tests, check negative marking rules, and measure your accuracy.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
            return (
              <Card key={cat.id} className="hover:border-primary/50 transition-all shadow-sm hover:shadow-md">
                <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                  <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-950 text-primary">
                    <CategoryIcon icon={cat.icon} className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">{cat.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">Domain Category</p>
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="grid grid-cols-2 gap-4 border-y border-border/40 py-4 my-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-semibold">Total Tests</p>
                        <p className="text-sm font-bold text-foreground">{cat.totalTests}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-semibold">Questions</p>
                        <p className="text-sm font-bold text-foreground">{cat.totalQuestions}</p>
                      </div>
                    </div>
                  </div>
                  <Link href={`/quizzes?category=${cat.slug}`}>
                    <Button className="w-full flex items-center justify-center gap-1.5 font-semibold">
                      Explore Quizzes <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
