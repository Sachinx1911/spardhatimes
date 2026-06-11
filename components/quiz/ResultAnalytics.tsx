"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { ChartBox } from "../shared/ChartBox";
import { Button } from "../ui/button";
import { 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  Percent, 
  RefreshCw, 
  Printer, 
  Share2,
  ChevronRight,
  HelpCircle,
  TrendingUp,
  FileText
} from "lucide-react";

interface Question {
  id: string;
  type?: string; // SINGLE_CHOICE | MULTIPLE_CHOICE | TRUE_FALSE
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string | null;
  categoryName?: string | null;
}

interface Comparison {
  average: number;
  top: number;
  count: number;
}

// Answers are stored as comma lists for multiple choice ("A,C"); membership
// checks work uniformly for single answers too.
const answerIncludes = (answer: string | null | undefined, letter: string) =>
  (answer || "").split(",").includes(letter);

interface QuestionResponse {
  id: string;
  chosenOption: string | null;
  isCorrect: boolean;
  timeSpent: number;
  question: Question;
}

interface Attempt {
  id: string;
  score: number;
  percentage: number;
  correctAnswers: number;
  wrongAnswers: number;
  skippedQuestions: number;
  timeTaken: number;
  rank: number | null;
  percentile: number | null;
  createdAt?: string | Date;
  quiz: {
    id: string;
    title: string;
    slug: string;
    marks: number;
    negativeMarks: number;
    duration: number;
    passingMarks: number;
  };
  responses: QuestionResponse[];
}

export function ResultAnalytics({ attempt, comparison }: { attempt: Attempt; comparison?: Comparison | null }) {

  // Format the attempt date on the client only. Locale-dependent date strings
  // differ between the Node server and the browser, which causes a hydration
  // mismatch, so we render it after mount instead.
  const [attemptedOn, setAttemptedOn] = useState("");
  useEffect(() => {
    const date = attempt.createdAt ? new Date(attempt.createdAt) : new Date();
    setAttemptedOn(date.toLocaleDateString(undefined, { dateStyle: "long" }));
  }, [attempt.createdAt]);

  // 1. Data for Pie Chart
  const pieData = [
    { name: "Correct", value: attempt.correctAnswers, color: "#10B981" },
    { name: "Wrong", value: attempt.wrongAnswers, color: "#EF4444" },
    { name: "Skipped", value: attempt.skippedQuestions, color: "#64748B" }
  ].filter(item => item.value > 0);

  // 2. Data for Time Spent Bar Chart
  const barData = attempt.responses.map((res, index) => ({
    name: `Q${index + 1}`,
    timeSpent: res.timeSpent,
    isCorrect: res.isCorrect ? "Correct" : res.chosenOption ? "Incorrect" : "Skipped"
  }));

  // 2b. Topic-wise accuracy from each question's sub-topic (categoryName)
  const topicMap = new Map<string, { correct: number; total: number }>();
  for (const res of attempt.responses) {
    const topic = res.question.categoryName?.trim() || "General";
    const entry = topicMap.get(topic) || { correct: 0, total: 0 };
    entry.total += 1;
    if (res.isCorrect) entry.correct += 1;
    topicMap.set(topic, entry);
  }
  const topicData = Array.from(topicMap.entries()).map(([topic, { correct, total }]) => ({
    topic: topic.length > 14 ? topic.slice(0, 13) + "…" : topic,
    accuracy: Math.round((correct / total) * 100),
    questions: total,
  }));
  const showTopicChart = topicData.length > 1;

  // 2c. You vs class average vs topper (percentage)
  const comparisonData = comparison
    ? [
        { name: "You", value: Math.max(0, attempt.percentage) },
        { name: "Average", value: Math.max(0, comparison.average) },
        { name: "Topper", value: Math.max(0, comparison.top) },
      ]
    : [];

  // 3. Print PDF Handler
  const handlePrint = () => {
    window.print();
  };

  // 4. Share Handler
  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `Mock Test Result - ${attempt.quiz.title}`,
        text: `I scored ${attempt.score}/${attempt.quiz.marks} (${attempt.percentage}%) on the ${attempt.quiz.title} mock test! Check out my result.`,
        url
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url);
      alert("Results link copied to clipboard!");
    }
  };

  const accuracy = attempt.correctAnswers + attempt.wrongAnswers > 0
    ? Math.round((attempt.correctAnswers / (attempt.correctAnswers + attempt.wrongAnswers)) * 100)
    : 0;

  const passed = attempt.score >= attempt.quiz.passingMarks;

  return (
    <div className="space-y-8 print:p-0 print:space-y-4">
      {/* Printable CSS block for layout print controls */}
      <style jsx global>{`
        @media print {
          header, footer, nav, button, .no-print {
            display: none !important;
          }
          body {
            background: white !important;
            color: black !important;
          }
          .print-card {
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      {/* Summary Banner */}
      <div className={`rounded-xl p-8 border flex flex-col md:flex-row items-center justify-between gap-6 ${
        passed 
          ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-400" 
          : "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900/40 text-red-800 dark:text-red-400"
      }`}>
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white dark:bg-slate-900 shadow-sm">
            {passed ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
            {passed ? "Exam Passed" : "Exam Failed"}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {attempt.quiz.title} Result
          </h1>
          <p className="text-sm text-muted-foreground" suppressHydrationWarning>
            {attemptedOn ? `Attempted on ${attemptedOn}` : " "}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 no-print">
          <Button variant="outline" className="flex items-center gap-1.5" onClick={handlePrint}>
            <Printer className="h-4 w-4" /> Print PDF Report
          </Button>
          <Button variant="outline" className="flex items-center gap-1.5" onClick={handleShare}>
            <Share2 className="h-4 w-4" /> Share Results
          </Button>
          <Link href={`/quiz/${attempt.quiz.slug}/attempt`}>
            <Button className="flex items-center gap-1.5 font-semibold">
              <RefreshCw className="h-4 w-4" /> Reattempt Quiz
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 text-center">
          <Trophy className="h-6 w-6 text-primary mx-auto mb-2" />
          <p className="text-xs text-muted-foreground uppercase font-semibold">Total Score</p>
          <p className="text-2xl font-black text-foreground mt-1">
            {attempt.score} <span className="text-xs text-muted-foreground font-normal">/ {attempt.quiz.marks}</span>
          </p>
        </Card>

        <Card className="p-5 text-center">
          <Percent className="h-6 w-6 text-primary mx-auto mb-2" />
          <p className="text-xs text-muted-foreground uppercase font-semibold">Percentage</p>
          <p className="text-2xl font-black text-foreground mt-1">{attempt.percentage}%</p>
        </Card>

        <Card className="p-5 text-center">
          <TrendingUp className="h-6 w-6 text-primary mx-auto mb-2" />
          <p className="text-xs text-muted-foreground uppercase font-semibold">Rank & Percentile</p>
          <p className="text-2xl font-black text-foreground mt-1">
            #{attempt.rank || 1} <span className="text-xs text-muted-foreground font-normal">({attempt.percentile || 100}%)</span>
          </p>
        </Card>

        <Card className="p-5 text-center">
          <Clock className="h-6 w-6 text-primary mx-auto mb-2" />
          <p className="text-xs text-muted-foreground uppercase font-semibold">Time Taken</p>
          <p className="text-2xl font-black text-foreground mt-1">
            {Math.floor(attempt.timeTaken / 60)}m {attempt.timeTaken % 60}s
          </p>
        </Card>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie Chart: Answer Breakdown */}
        <Card className="p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-sm font-extrabold uppercase tracking-wide text-muted-foreground">Answer Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full sm:w-1/2 min-w-0">
              <ChartBox height={180}>
                {({ width, height }) => (
                  <PieChart width={width} height={height}>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                )}
              </ChartBox>
            </div>
            <div className="space-y-3 shrink-0">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <span className="h-3.5 w-3.5 rounded-full bg-emerald-500" />
                <span>{attempt.correctAnswers} Correct ({accuracy}% accuracy)</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <span className="h-3.5 w-3.5 rounded-full bg-red-500" />
                <span>{attempt.wrongAnswers} Wrong</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <span className="h-3.5 w-3.5 rounded-full bg-slate-500" />
                <span>{attempt.skippedQuestions} Skipped</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart: Time spent per question */}
        <Card className="p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-sm font-extrabold uppercase tracking-wide text-muted-foreground">Time Spent Per Question</CardTitle>
          </CardHeader>
          <CardContent className="p-0 min-w-0">
            <ChartBox height={192}>
              {({ width, height }) => (
                <BarChart width={width} height={height} data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} unit="s" />
                  <Tooltip formatter={(value) => [`${value}s`, "Time Spent"]} />
                  <Bar dataKey="timeSpent" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ChartBox>
          </CardContent>
        </Card>
      </div>

      {/* Topic-wise & Comparison Charts Row */}
      {(showTopicChart || comparisonData.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {showTopicChart && (
            <Card className="p-6">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-sm font-extrabold uppercase tracking-wide text-muted-foreground">Topic-Wise Performance</CardTitle>
              </CardHeader>
              <CardContent className="p-0 min-w-0">
                <ChartBox height={192}>
                  {({ width, height }) => (
                    <BarChart width={width} height={height} data={topicData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="topic" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} interval={0} />
                      <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} unit="%" domain={[0, 100]} />
                      <Tooltip formatter={(value, _name, item) => [`${value}% (${item?.payload?.questions} Qs)`, "Accuracy"]} />
                      <Bar dataKey="accuracy" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  )}
                </ChartBox>
              </CardContent>
            </Card>
          )}

          {comparisonData.length > 0 && (
            <Card className={`p-6 ${!showTopicChart ? "md:col-span-2" : ""}`}>
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-sm font-extrabold uppercase tracking-wide text-muted-foreground">
                  Score Comparison
                  <span className="ml-2 normal-case font-normal text-[10px]">
                    vs {comparison!.count} attempt{comparison!.count === 1 ? "" : "s"} on this quiz
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 min-w-0">
                <ChartBox height={192}>
                  {({ width, height }) => (
                    <BarChart width={width} height={height} data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} unit="%" domain={[0, 100]} />
                      <Tooltip formatter={(value) => [`${value}%`, "Score"]} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {comparisonData.map((entry, index) => (
                          <Cell
                            key={`comp-${index}`}
                            fill={entry.name === "You" ? "#2563EB" : entry.name === "Average" ? "#64748B" : "#F59E0B"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  )}
                </ChartBox>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Answer Key & Explanations Details */}
      <Card>
        <CardHeader className="border-b border-border/40">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> Question Review & Explanations
          </CardTitle>
          <CardDescription>
            Review all questions, your responses, and detailed explanations for self-correction.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-border/40">
          {attempt.responses.map((res, index) => {
            const isAnswered = !!res.chosenOption;
            const isCorrect = res.isCorrect;
            const q = res.question;

            return (
              <div key={res.id} className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase">
                    Question {index + 1}
                  </span>
                  
                  {/* Status pills */}
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    !isAnswered 
                      ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      : isCorrect
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                      : "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400"
                  }`}>
                    {!isAnswered ? "Skipped" : isCorrect ? "Correct" : "Incorrect"}
                  </span>
                </div>

                {/* Question */}
                <h4 className="text-sm sm:text-base font-bold text-foreground leading-relaxed">
                  {q.text}
                </h4>

                {/* Options list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  {[
                    { key: "A", val: q.optionA },
                    { key: "B", val: q.optionB },
                    { key: "C", val: q.optionC },
                    { key: "D", val: q.optionD }
                  ]
                    .filter((opt) => q.type !== "TRUE_FALSE" || ["A", "B"].includes(opt.key))
                    .map((opt) => {
                    const isChosen = answerIncludes(res.chosenOption, opt.key);
                    const isRight = answerIncludes(q.correctAnswer, opt.key);

                    return (
                      <div
                        key={opt.key}
                        className={`flex items-center p-3 rounded-md border text-xs font-semibold ${
                          isRight 
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400" 
                            : isChosen
                            ? "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400"
                            : "border-border/40 text-muted-foreground"
                        }`}
                      >
                        <span className={`h-5 w-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mr-2 border ${
                          isRight
                            ? "bg-emerald-500 text-white border-emerald-500"
                            : isChosen
                            ? "bg-red-500 text-white border-red-500"
                            : "bg-slate-100 dark:bg-slate-800 border-border text-muted-foreground"
                        }`}>
                          {opt.key}
                        </span>
                        {opt.val}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation block */}
                {q.explanation && (
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-md border border-border/40 text-xs">
                    <p className="font-extrabold text-foreground flex items-center gap-1.5">
                      <HelpCircle className="h-4 w-4 text-primary" /> Detailed Explanation:
                    </p>
                    <p className="mt-2 text-muted-foreground leading-relaxed">
                      {q.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
