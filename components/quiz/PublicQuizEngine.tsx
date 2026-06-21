"use client";

import React, { useState, useEffect, useRef } from "react";
import { submitPublicQuizAttempt } from "@/app/actions/public-quiz";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog } from "../ui/dialog";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Maximize2,
  Minimize2,
  List,
  CheckCircle2,
  Play,
  Loader2,
  PartyPopper,
} from "lucide-react";

interface Question {
  id: string;
  type?: string;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string | null;
  difficulty: string;
  marks: number;
}

interface Quiz {
  id: string;
  title: string;
  slug: string;
  duration: number;
  marks: number;
  negativeMarks: number;
  passingMarks: number;
  instructions: string | null;
  questions: Question[];
}

interface ResultData {
  score: number;
  total: number;
  correct: number;
  wrong: number;
  skipped: number;
  percentage: number;
}

function getGuestId(): string {
  const key = "spardha_guest_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(key, id);
  }
  return id;
}

export function PublicQuizEngine({ quiz }: { quiz: Quiz }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(quiz.duration * 60);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  const [timeSpentPerQuestion, setTimeSpentPerQuestion] = useState<Record<string, number>>({});
  const [result, setResult] = useState<ResultData | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentQuestion = quiz.questions[currentIdx];

  useEffect(() => {
    const savedAnswers = localStorage.getItem(`pub_quiz_${quiz.id}`);
    if (savedAnswers) {
      try { setAnswers(JSON.parse(savedAnswers)); } catch {}
    }
  }, [quiz.id]);

  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      localStorage.setItem(`pub_quiz_${quiz.id}`, JSON.stringify(answers));
    }
  }, [answers, quiz.id]);

  useEffect(() => {
    if (!hasStarted) return;
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current!); handleAutoSubmit(); return 0; }
        return prev - 1;
      });
      if (currentQuestion) {
        setTimeSpentPerQuestion((prev) => ({
          ...prev,
          [currentQuestion.id]: (prev[currentQuestion.id] || 0) + 1,
        }));
      }
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [hasStarted, currentIdx, currentQuestion?.id]);

  const handleSelectOption = (option: string) => {
    setAnswers((prev) => {
      if (currentQuestion.type !== "MULTIPLE_CHOICE") {
        return { ...prev, [currentQuestion.id]: option };
      }
      const current = prev[currentQuestion.id] ? prev[currentQuestion.id].split(",") : [];
      const next = current.includes(option) ? current.filter((o) => o !== option) : [...current, option].sort();
      const updated = { ...prev };
      if (next.length === 0) delete updated[currentQuestion.id];
      else updated[currentQuestion.id] = next.join(",");
      return updated;
    });
  };

  const isOptionSelected = (option: string) =>
    (answers[currentQuestion.id] || "").split(",").includes(option);

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);
  const handleAutoSubmit = () => triggerSubmit();

  const triggerSubmit = async () => {
    setIsSubmitting(true);
    setIsSubmitDialogOpen(false);

    const formattedAnswers = quiz.questions.map((q) => ({
      questionId: q.id,
      chosenOption: answers[q.id] || null,
      timeSpent: timeSpentPerQuestion[q.id] || 0,
    }));
    const timeTaken = quiz.duration * 60 - timeRemaining;

    try {
      const guestId = getGuestId();
      const res = await submitPublicQuizAttempt(quiz.id, guestId, formattedAnswers, timeTaken);
      if (res.error) {
        setError(res.error);
        setIsSubmitting(false);
      } else {
        localStorage.removeItem(`pub_quiz_${quiz.id}`);
        const correct = quiz.questions.filter((q) => {
          const chosen = answers[q.id];
          if (!chosen) return false;
          const normalize = (s: string) => s.toUpperCase().split(",").map((x) => x.trim()).sort().join(",");
          return normalize(chosen) === normalize(q.correctAnswer);
        }).length;
        const answered = Object.keys(answers).length;
        const wrong = answered - correct;
        const skipped = quiz.questions.length - answered;
        let score = 0;
        quiz.questions.forEach((q) => {
          const chosen = answers[q.id];
          if (!chosen) return;
          const normalize = (s: string) => s.toUpperCase().split(",").map((x) => x.trim()).sort().join(",");
          if (normalize(chosen) === normalize(q.correctAnswer)) score += q.marks;
          else score -= quiz.negativeMarks;
        });
        score = Math.round(score * 100) / 100;
        const pct = Math.round((score / quiz.marks) * 100 * 100) / 100;
        setResult({ score, total: quiz.marks, correct, wrong, skipped, percentage: pct });
        setIsSubmitting(false);
      }
    } catch {
      setError("Failed to submit. Check your network connection.");
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const answeredCount = Object.keys(answers).length;
  const progressPercent = (answeredCount / quiz.questions.length) * 100;

  // Result screen
  if (result) {
    const passed = result.score >= quiz.passingMarks;
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <PartyPopper className={`h-12 w-12 mx-auto mb-2 ${passed ? "text-green-500" : "text-amber-500"}`} />
            <CardTitle className="text-2xl font-extrabold text-foreground">
              {passed ? "Congratulations!" : "Test Completed"}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{quiz.title}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-4xl font-black text-primary">{result.score}/{result.total}</p>
              <p className="text-sm text-muted-foreground mt-1">{result.percentage}%</p>
            </div>
            <div className="grid grid-cols-3 gap-3 border-y border-border/40 py-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Correct</p>
                <p className="text-lg font-extrabold text-green-600">{result.correct}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Wrong</p>
                <p className="text-lg font-extrabold text-red-500">{result.wrong}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Skipped</p>
                <p className="text-lg font-extrabold text-slate-400">{result.skipped}</p>
              </div>
            </div>
            {error && <p className="text-sm text-danger text-center">{error}</p>}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Start screen — direct start, no instructions gate
  if (!hasStarted) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
        <Card className="w-full max-w-2xl shadow-xl">
          <CardHeader className="text-center">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-primary w-fit mx-auto">
              Free Test
            </span>
            <CardTitle className="text-2xl font-extrabold text-foreground mt-3">{quiz.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4 border-y border-border/40 py-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Duration</p>
                <p className="text-lg font-extrabold text-foreground">{quiz.duration} mins</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Questions</p>
                <p className="text-lg font-extrabold text-foreground">{quiz.questions.length}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Total Marks</p>
                <p className="text-lg font-extrabold text-foreground">{quiz.marks}</p>
              </div>
            </div>
            <Button onClick={() => setHasStarted(true)} className="w-full font-semibold flex items-center justify-center gap-1.5 shadow-lg shadow-primary/20">
              <Play className="h-4 w-4" /> Start Test
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`${isFullscreen ? "fullscreen-quiz" : "flex-1 flex flex-col"} bg-slate-50 dark:bg-slate-950`}
    >
      {isSubmitting && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-3 bg-white/90 dark:bg-slate-950/90 backdrop-blur-sm">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-sm font-semibold text-foreground">Submitting your test…</p>
          <p className="text-xs text-muted-foreground">Please wait, don&apos;t close this page.</p>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div>
          <h2 className="font-bold text-slate-800 dark:text-white truncate max-w-[200px] sm:max-w-md">{quiz.title}</h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-24 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary h-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
            </div>
            <span className="text-[10px] text-muted-foreground font-semibold">{answeredCount}/{quiz.questions.length} Solved</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono font-bold text-sm ${
            timeRemaining < 120 ? "bg-danger/10 border-danger/20 text-danger animate-pulse" : "bg-slate-100 dark:bg-slate-800 text-foreground"
          }`}>
            <Clock className="h-4 w-4 shrink-0" />
            {formatTime(timeRemaining)}
          </div>
          <button onClick={toggleFullscreen} className="p-2 border border-border/40 rounded-lg text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground hidden sm:block cursor-pointer">
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          <Button onClick={() => setIsSubmitDialogOpen(true)} className="font-semibold shadow-sm text-xs h-9" disabled={isSubmitting}>
            Submit Test
          </Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 max-w-7xl w-full mx-auto p-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <Card className="shadow-sm">
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-foreground leading-relaxed">
                  <span className="text-primary mr-2">Q.{currentIdx + 1}</span>
                  {currentQuestion.text}
                </h3>
                {currentQuestion.type === "MULTIPLE_CHOICE" && (
                  <p className="mt-1.5 text-xs font-semibold text-primary">Multiple answers — select all that apply.</p>
                )}
                {currentQuestion.type === "TRUE_FALSE" && (
                  <p className="mt-1.5 text-xs font-semibold text-muted-foreground">True / False — choose one.</p>
                )}
              </div>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { key: "A", text: currentQuestion.optionA },
                  { key: "B", text: currentQuestion.optionB },
                  { key: "C", text: currentQuestion.optionC },
                  { key: "D", text: currentQuestion.optionD },
                ]
                  .filter((opt) => currentQuestion.type !== "TRUE_FALSE" || ["A", "B"].includes(opt.key))
                  .map((opt) => {
                    const isSelected = isOptionSelected(opt.key);
                    const isMulti = currentQuestion.type === "MULTIPLE_CHOICE";
                    return (
                      <button
                        key={opt.key}
                        onClick={() => handleSelectOption(opt.key)}
                        className={`flex items-center text-left w-full p-4 rounded-lg border transition-all cursor-pointer text-sm sm:text-base ${
                          isSelected
                            ? "border-primary bg-primary/5 text-primary font-semibold ring-1 ring-primary"
                            : "border-border/60 hover:bg-slate-50 dark:hover:bg-slate-900 text-foreground"
                        }`}
                      >
                        <span className={`h-6 w-6 flex items-center justify-center font-bold text-xs shrink-0 mr-3 border ${
                          isMulti ? "rounded-md" : "rounded-full"
                        } ${
                          isSelected ? "bg-primary text-white border-primary" : "bg-slate-100 dark:bg-slate-800 border-border text-muted-foreground"
                        }`}>
                          {isSelected && isMulti ? <CheckCircle2 className="h-4 w-4" /> : opt.key}
                        </span>
                        {opt.text}
                      </button>
                    );
                  })}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-border p-4 rounded-lg shadow-sm">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))} disabled={currentIdx === 0} className="flex items-center gap-1 font-semibold">
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { setAnswers((prev) => { const next = { ...prev }; delete next[currentQuestion.id]; return next; }); }} disabled={!answers[currentQuestion.id]} className="text-xs text-muted-foreground hover:bg-slate-100">
                Clear Answer
              </Button>
            </div>
            <Button size="sm" onClick={() => { if (currentIdx < quiz.questions.length - 1) setCurrentIdx((prev) => prev + 1); else setIsSubmitDialogOpen(true); }} className="flex items-center gap-1 font-semibold">
              {currentIdx === quiz.questions.length - 1 ? "Review & Submit" : "Next"} <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-4">
          <Card className="p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/40">
              <List className="h-4 w-4 text-primary" />
              <span className="font-bold text-sm text-foreground uppercase tracking-wide">Question Sheet</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground mb-4">
              <div className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-primary" /> Answered</div>
              <div className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full border border-border" /> Unanswered</div>
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-4 gap-2">
              {quiz.questions.map((q, idx) => {
                const isCurrent = idx === currentIdx;
                const isAnswered = !!answers[q.id];
                return (
                  <button key={q.id} onClick={() => setCurrentIdx(idx)} className={`h-9 w-9 rounded-md flex items-center justify-center font-bold text-xs border transition-all cursor-pointer ${isCurrent ? "ring-2 ring-primary ring-offset-2" : ""} ${isAnswered ? "bg-primary text-white border-primary" : "bg-white dark:bg-slate-900 border-border text-foreground hover:bg-slate-100"}`}>
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      <Dialog isOpen={isSubmitDialogOpen} onClose={() => setIsSubmitDialogOpen(false)} title="Submit Test">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-lg border border-yellow-200/20">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <p className="text-sm">Are you sure you want to finish? You cannot edit answers once submitted.</p>
          </div>
          <div className="grid grid-cols-2 gap-4 border-y border-border/40 py-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Answered</p>
              <p className="text-base font-extrabold text-foreground">{answeredCount} questions</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Remaining</p>
              <p className="text-base font-extrabold text-foreground">{quiz.questions.length - answeredCount} questions</p>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={() => setIsSubmitDialogOpen(false)} variant="outline" className="flex-1 font-semibold text-xs" disabled={isSubmitting}>Cancel</Button>
            <Button onClick={() => triggerSubmit()} className="flex-1 font-semibold text-xs flex items-center justify-center gap-1 shadow-md shadow-primary/20" disabled={isSubmitting}>
              <CheckCircle2 className="h-4 w-4" /> {isSubmitting ? "Grading..." : "Submit Test"}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
