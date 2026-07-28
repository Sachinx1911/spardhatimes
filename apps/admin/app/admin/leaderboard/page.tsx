"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, Award, Download, Loader2 } from "lucide-react";
import {
  getQuizList,
  getTestLeaderboard,
  type QuizOption,
  type LeaderboardRow,
} from "@/app/actions/leaderboard";

export default function AdminLeaderboardPage() {
  const [quizzes, setQuizzes] = useState<QuizOption[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState("");
  const [selectedQuiz, setSelectedQuiz] = useState<QuizOption | null>(null);
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getQuizList().then((list) => {
      setQuizzes(list);
      if (list.length > 0) {
        setSelectedQuizId(list[0].id);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedQuizId) return;
    setLoading(true);
    const quiz = quizzes.find((q) => q.id === selectedQuizId) || null;
    setSelectedQuiz(quiz);
    getTestLeaderboard(selectedQuizId).then((data) => {
      setRows(data);
      setLoading(false);
    });
  }, [selectedQuizId, quizzes]);

  const rankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-slate-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return (
      <span className="h-5 w-5 flex items-center justify-center text-xs font-bold text-muted-foreground">
        {rank}
      </span>
    );
  };

  const pctClass = (p: number) =>
    p >= 80
      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      : p >= 50
      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";

  const handleDownloadPdf = () => {
    if (!selectedQuizId) return;
    window.open(`/api/reports/test/${selectedQuizId}/pdf`, "_blank");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">Leaderboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Test-wise student performance reports
        </p>
      </div>

      {/* Test selector */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          className="flex-1 h-10 rounded-md border border-border bg-white dark:bg-slate-900 px-3 text-sm font-semibold text-foreground"
          value={selectedQuizId}
          onChange={(e) => setSelectedQuizId(e.target.value)}
        >
          {quizzes.length === 0 && <option value="">No tests with attempts</option>}
          {quizzes.map((q) => (
            <option key={q.id} value={q.id}>
              {q.title}
            </option>
          ))}
        </select>
        <Button
          onClick={handleDownloadPdf}
          disabled={!selectedQuizId || rows.length === 0}
          className="flex items-center gap-2 font-semibold"
        >
          <Download className="h-4 w-4" /> Download PDF
        </Button>
      </div>

      {/* Test info summary */}
      {selectedQuiz && (
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 text-center">
            <p className="text-xs text-muted-foreground uppercase font-semibold">Total Questions</p>
            <p className="text-2xl font-black text-foreground mt-1">{selectedQuiz.questionCount}</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-xs text-muted-foreground uppercase font-semibold">Total Marks</p>
            <p className="text-2xl font-black text-foreground mt-1">{selectedQuiz.marks}</p>
          </Card>
        </div>
      )}

      {/* Results table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" /> Student Rankings
          </CardTitle>
          <CardDescription>
            {loading
              ? "Loading..."
              : `${rows.length} student${rows.length !== 1 ? "s" : ""} attempted this test`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 border-t border-border/40">
          {loading ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : rows.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No attempts for this test yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40 bg-slate-50 dark:bg-slate-900/50">
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground w-14">#</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Student Name</th>
                    <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Score</th>
                    <th className="px-4 py-3 text-center font-semibold text-muted-foreground">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {rows.map((row) => (
                    <tr
                      key={row.email + row.rank}
                      className={`hover:bg-slate-50/60 dark:hover:bg-slate-900/30 ${
                        row.rank <= 3 ? "bg-yellow-50/30 dark:bg-yellow-950/10" : ""
                      }`}
                    >
                      <td className="px-4 py-3">{rankIcon(row.rank)}</td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-foreground">{row.name}</p>
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-primary">
                        {row.score}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${pctClass(row.percentage)}`}
                        >
                          {row.percentage}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
