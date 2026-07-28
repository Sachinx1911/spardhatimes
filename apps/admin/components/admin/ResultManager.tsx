"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { Search, FileSpreadsheet, BarChart3, CheckCircle2, XCircle } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface ResultItem {
  id: string;
  score: number;
  percentage: number;
  correctAnswers: number;
  wrongAnswers: number;
  skippedQuestions: number;
  timeTaken: number;
  rank: number | null;
  createdAt: string | Date;
  // user is null for public/guest attempts (no login).
  user: { name: string | null; email: string } | null;
  quiz: { id: string; title: string; marks: number; passingMarks: number };
}

interface QuizOption {
  id: string;
  title: string;
}

export function ResultManager({ results, quizzes }: { results: ResultItem[]; quizzes: QuizOption[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [quizFilter, setQuizFilter] = useState("");
  const [outcomeFilter, setOutcomeFilter] = useState("");

  const filtered = results.filter((r) => {
    const matchesSearch =
      (r.user?.name || "Guest").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.user?.email || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesQuiz = quizFilter ? r.quiz.id === quizFilter : true;
    const passed = r.score >= r.quiz.passingMarks;
    const matchesOutcome =
      outcomeFilter === "PASS" ? passed : outcomeFilter === "FAIL" ? !passed : true;
    return matchesSearch && matchesQuiz && matchesOutcome;
  });

  const handleExport = async () => {
    const mod = await import("xlsx");
    const XLSX = (mod as any).default ?? mod;
    const rows = filtered.map((r) => ({
      Student: r.user?.name || "Guest",
      Email: r.user?.email || "—",
      Quiz: r.quiz.title,
      Score: r.score,
      "Total Marks": r.quiz.marks,
      "Percentage (%)": r.percentage,
      Correct: r.correctAnswers,
      Wrong: r.wrongAnswers,
      Skipped: r.skippedQuestions,
      "Time (s)": r.timeTaken,
      Result: r.score >= r.quiz.passingMarks ? "PASS" : "FAIL",
      Date: formatDateTime(r.createdAt),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Results");
    XLSX.writeFile(wb, "quiz_results_export.xlsx");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Result Management</h2>
          <p className="text-xs text-muted-foreground">
            Browse, filter, search, and export all student attempt results.
          </p>
        </div>
        <Button
          onClick={handleExport}
          variant="outline"
          disabled={filtered.length === 0}
          className="flex items-center gap-1.5 font-semibold text-xs h-9 shrink-0"
        >
          <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Export Results ({filtered.length})
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search student name or email..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={quizFilter} onChange={(e) => setQuizFilter(e.target.value)}>
          <option value="">All Quizzes</option>
          {quizzes.map((q) => (
            <option key={q.id} value={q.id}>{q.title}</option>
          ))}
        </Select>
        <Select value={outcomeFilter} onChange={(e) => setOutcomeFilter(e.target.value)}>
          <option value="">All Outcomes</option>
          <option value="PASS">Passed</option>
          <option value="FAIL">Failed</option>
        </Select>
      </Card>

      {/* Results table */}
      <Card>
        <div className="overflow-x-auto w-full">
          {filtered.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No results match the current filters.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-border/40 font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                  <th className="p-4">Student</th>
                  <th className="p-4">Quiz</th>
                  <th className="p-4 text-center">Score</th>
                  <th className="p-4 text-center">Accuracy</th>
                  <th className="p-4 text-center">Result</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filtered.map((r) => {
                  const passed = r.score >= r.quiz.passingMarks;
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                      <td className="p-4">
                        <p className="font-bold text-foreground">{r.user?.name || "Guest"}</p>
                        <p className="text-[10px] text-muted-foreground">{r.user?.email || "—"}</p>
                      </td>
                      <td className="p-4 font-semibold text-xs">{r.quiz.title}</td>
                      <td className="p-4 text-center font-bold">
                        {r.score} <span className="text-[10px] text-muted-foreground">/ {r.quiz.marks}</span>
                      </td>
                      <td className="p-4 text-center font-semibold text-xs">{r.percentage}%</td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          passed
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400"
                        }`}>
                          {passed ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          {passed ? "Pass" : "Fail"}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-muted-foreground">
                        {formatDateTime(r.createdAt)}
                      </td>
                      <td className="p-4 text-right">
                        <Link href={`/quiz/result/${r.id}`}>
                          <Button variant="secondary" size="sm" className="font-semibold text-xs flex items-center gap-1">
                            <BarChart3 className="h-3.5 w-3.5" /> View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}
