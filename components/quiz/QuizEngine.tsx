"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { submitQuizAttempt, toggleQuestionBookmark } from "@/app/actions/quiz";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog } from "../ui/dialog";
import { 
  Clock, 
  HelpCircle, 
  ChevronLeft, 
  ChevronRight, 
  Flag, 
  Bookmark, 
  AlertTriangle,
  Maximize2,
  Minimize2,
  List,
  CheckCircle2,
  Play,
  Loader2
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
  difficulty: string;
  marks: number;
}

interface Quiz {
  id: string;
  title: string;
  slug: string;
  duration: number; // in mins
  marks: number;
  negativeMarks: number;
  passingMarks: number;
  instructions: string | null;
  questions: Question[];
}

export function QuizEngine({ quiz }: { quiz: Quiz }) {
  const router = useRouter();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({}); // { questionId: chosenOption }
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  
  const [timeRemaining, setTimeRemaining] = useState(quiz.duration * 60);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [hasStarted, setHasStarted] = useState(false);
  const [timeSpentPerQuestion, setTimeSpentPerQuestion] = useState<Record<string, number>>({});

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentQuestion = quiz.questions[currentIdx];

  // 1. Restore answers from localStorage on mount (Auto-save recover)
  useEffect(() => {
    const savedAnswers = localStorage.getItem(`quiz_answers_${quiz.id}`);
    const savedFlagged = localStorage.getItem(`quiz_flagged_${quiz.id}`);
    if (savedAnswers) {
      try {
        setAnswers(JSON.parse(savedAnswers));
      } catch (e) {
        console.error(e);
      }
    }
    if (savedFlagged) {
      try {
        setFlagged(new Set(JSON.parse(savedFlagged)));
      } catch (e) {
        console.error(e);
      }
    }
  }, [quiz.id]);

  // 2. Persist answers to localStorage (Auto-save write)
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      localStorage.setItem(`quiz_answers_${quiz.id}`, JSON.stringify(answers));
    }
  }, [answers, quiz.id]);

  useEffect(() => {
    localStorage.setItem(`quiz_flagged_${quiz.id}`, JSON.stringify(Array.from(flagged)));
  }, [flagged, quiz.id]);

  // 3. Timer Hook
  useEffect(() => {
    if (!hasStarted) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });

      // Increment time spent on current question
      if (currentQuestion) {
        setTimeSpentPerQuestion((prev) => ({
          ...prev,
          [currentQuestion.id]: (prev[currentQuestion.id] || 0) + 1
        }));
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hasStarted, currentIdx, currentQuestion?.id]);

  // 4. Handle Option Selection
  // Single choice / true-false replace the answer; multiple choice toggles the
  // option in a sorted comma list ("A,C") so grading is order-independent.
  const handleSelectOption = (option: string) => {
    setAnswers((prev) => {
      if (currentQuestion.type !== "MULTIPLE_CHOICE") {
        return { ...prev, [currentQuestion.id]: option };
      }
      const current = prev[currentQuestion.id]
        ? prev[currentQuestion.id].split(",")
        : [];
      const next = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option].sort();
      const updated = { ...prev };
      if (next.length === 0) {
        delete updated[currentQuestion.id];
      } else {
        updated[currentQuestion.id] = next.join(",");
      }
      return updated;
    });
  };

  const isOptionSelected = (option: string) =>
    (answers[currentQuestion.id] || "").split(",").includes(option);

  // 5. Toggle Flag for Review
  const handleToggleFlag = () => {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(currentQuestion.id)) {
        next.delete(currentQuestion.id);
      } else {
        next.add(currentQuestion.id);
      }
      return next;
    });
  };

  // 6. Toggle Bookmark
  const handleToggleBookmark = async () => {
    try {
      const res = await toggleQuestionBookmark(currentQuestion.id, quiz.id);
      if (res.bookmarked) {
        setBookmarks((prev) => new Set([...prev, currentQuestion.id]));
      } else {
        setBookmarks((prev) => {
          const next = new Set(prev);
          next.delete(currentQuestion.id);
          return next;
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 7. Fullscreen Toggle
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // 8. Auto Submit
  const handleAutoSubmit = () => {
    triggerSubmit(true);
  };

  // 9. Trigger Submit Attempt
  const triggerSubmit = async (isAuto = false) => {
    setIsSubmitting(true);
    setIsSubmitDialogOpen(false);
    
    // Prepare answers list for Server Action
    const formattedAnswers = quiz.questions.map((q) => ({
      questionId: q.id,
      chosenOption: answers[q.id] || null,
      timeSpent: timeSpentPerQuestion[q.id] || 0
    }));

    const timeTaken = (quiz.duration * 60) - timeRemaining;

    try {
      const result = await submitQuizAttempt(quiz.id, formattedAnswers, timeTaken);
      if (result.error) {
        setError(result.error);
        setIsSubmitting(false);
      } else {
        // Clear local storage
        localStorage.removeItem(`quiz_answers_${quiz.id}`);
        localStorage.removeItem(`quiz_flagged_${quiz.id}`);

        // Navigate to the result page. Use replace() so the back button does
        // not return to the (now finished) attempt. A hard-navigation fallback
        // guarantees the transition commits even if the client router stalls.
        const resultUrl = `/quiz/result/${result.attemptId}`;
        router.replace(resultUrl);
        setTimeout(() => {
          if (window.location.pathname !== resultUrl) {
            window.location.assign(resultUrl);
          }
        }, 600);
      }
    } catch (err) {
      setError("Failed to submit attempt. Check your network connection.");
      setIsSubmitting(false);
    }
  };

  // Format Time (mm:ss)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Stats
  const answeredCount = Object.keys(answers).length;
  const progressPercent = (answeredCount / quiz.questions.length) * 100;

  if (!hasStarted) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
        <Card className="w-full max-w-2xl shadow-xl">
          <CardHeader className="text-center">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-primary w-fit mx-auto">
              Mock Test Series
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
                <p className="text-xs text-muted-foreground uppercase font-semibold">Total Questions</p>
                <p className="text-lg font-extrabold text-foreground">{quiz.questions.length}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Passing Marks</p>
                <p className="text-lg font-extrabold text-foreground">{quiz.passingMarks} pts</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-sm text-foreground uppercase tracking-wide">Test Instructions:</h4>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-2 leading-relaxed">
                <li>This mock test contains {quiz.questions.length} questions.</li>
                <li>Each question carries equal marks. Total marks: {quiz.marks}.</li>
                <li>{quiz.instructions || "Read all questions carefully before answering."}</li>
                <li>Answers are saved automatically as you select options. If your connection drops, refresh the page to restore progress.</li>
                <li>Do not close the page or exit fullscreen mode while taking the test.</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <Button onClick={() => router.back()} variant="outline" className="flex-1 font-semibold">
                Go Back
              </Button>
              <Button onClick={() => setHasStarted(true)} className="flex-1 font-semibold flex items-center justify-center gap-1.5 shadow-lg shadow-primary/20">
                <Play className="h-4 w-4" /> Start Mock Test
              </Button>
            </div>
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
      {/* Full-screen submitting overlay — clear feedback while the attempt is
          graded on the server and we navigate to the result page. */}
      {isSubmitting && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-3 bg-white/90 dark:bg-slate-950/90 backdrop-blur-sm">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-sm font-semibold text-foreground">Submitting your test…</p>
          <p className="text-xs text-muted-foreground">Please wait, don&apos;t close this page.</p>
        </div>
      )}

      {/* Top Header Panel */}
      <div className="bg-white dark:bg-slate-900 border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div>
          <h2 className="font-bold text-slate-800 dark:text-white truncate max-w-[200px] sm:max-w-md">
            {quiz.title}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-24 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground font-semibold">
              {answeredCount}/{quiz.questions.length} Solved
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Timer Display */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono font-bold text-sm ${
            timeRemaining < 120 
              ? "bg-danger/10 border-danger/20 text-danger animate-pulse" 
              : "bg-slate-100 dark:bg-slate-800 text-foreground"
          }`}>
            <Clock className="h-4 w-4 shrink-0" />
            {formatTime(timeRemaining)}
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 border border-border/40 rounded-lg text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground hidden sm:block cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>

          {/* Submit Button */}
          <Button 
            onClick={() => setIsSubmitDialogOpen(true)} 
            className="font-semibold shadow-sm text-xs h-9"
            disabled={isSubmitting}
          >
            Submit Test
          </Button>
        </div>
      </div>

      {/* Main Attempt Body */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 max-w-7xl w-full mx-auto p-4 gap-6">
        {/* Left 3 Cols: Question Area */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between pb-3 border-b border-border/40">
              <div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-primary uppercase">
                  Question {currentIdx + 1} of {quiz.questions.length}
                </span>
                <span className="text-xs text-muted-foreground ml-3">
                  Marks: +{currentQuestion.marks} | Neg: -{quiz.negativeMarks}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleBookmark}
                  className={`p-1.5 rounded-md border border-border/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                    bookmarks.has(currentQuestion.id) ? "text-primary fill-primary bg-primary/5" : "text-muted-foreground"
                  }`}
                  title="Bookmark question"
                >
                  <Bookmark className="h-4 w-4" />
                </button>
                <button
                  onClick={handleToggleFlag}
                  className={`p-1.5 rounded-md border border-border/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                    flagged.has(currentQuestion.id) ? "text-yellow-500 fill-yellow-500 bg-yellow-500/5 border-yellow-500/20" : "text-muted-foreground"
                  }`}
                  title="Flag for review"
                >
                  <Flag className="h-4 w-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Question Text */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-foreground leading-relaxed">
                  {currentQuestion.text}
                </h3>
                {currentQuestion.type === "MULTIPLE_CHOICE" && (
                  <p className="mt-1.5 text-xs font-semibold text-primary">
                    Multiple answers — select all that apply.
                  </p>
                )}
                {currentQuestion.type === "TRUE_FALSE" && (
                  <p className="mt-1.5 text-xs font-semibold text-muted-foreground">
                    True / False — choose one.
                  </p>
                )}
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 gap-3">
                {[
                  { key: "A", text: currentQuestion.optionA },
                  { key: "B", text: currentQuestion.optionB },
                  { key: "C", text: currentQuestion.optionC },
                  { key: "D", text: currentQuestion.optionD }
                ]
                  // True/False questions only carry two options (A=True, B=False)
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
                          isSelected
                            ? "bg-primary text-white border-primary"
                            : "bg-slate-100 dark:bg-slate-800 border-border text-muted-foreground"
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

          {/* Navigation Controls bottom bar */}
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-border p-4 rounded-lg shadow-sm">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                disabled={currentIdx === 0}
                className="flex items-center gap-1 font-semibold"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setAnswers((prev) => {
                    const next = { ...prev };
                    delete next[currentQuestion.id];
                    return next;
                  });
                }}
                disabled={!answers[currentQuestion.id]}
                className="text-xs text-muted-foreground hover:bg-slate-100"
              >
                Clear Answer
              </Button>
            </div>
            
            <Button
              size="sm"
              onClick={() => {
                if (currentIdx < quiz.questions.length - 1) {
                  setCurrentIdx((prev) => prev + 1);
                } else {
                  setIsSubmitDialogOpen(true);
                }
              }}
              className="flex items-center gap-1 font-semibold"
            >
              {currentIdx === quiz.questions.length - 1 ? "Review & Submit" : "Next"} <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Right 1 Col: Question Navigation Panel / Overview */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/40">
              <List className="h-4 w-4 text-primary" />
              <span className="font-bold text-sm text-foreground uppercase tracking-wide">Question Sheet</span>
            </div>

            {/* Answer legends */}
            <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-primary" /> Answered
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" /> Flagged
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full border border-border" /> Unanswered
              </div>
            </div>

            {/* Question matrix grids */}
            <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-4 gap-2">
              {quiz.questions.map((q, idx) => {
                const isCurrent = idx === currentIdx;
                const isAnswered = !!answers[q.id];
                const isFlagged = flagged.has(q.id);

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={`h-9 w-9 rounded-md flex items-center justify-center font-bold text-xs border transition-all cursor-pointer ${
                      isCurrent ? "ring-2 ring-primary ring-offset-2" : ""
                    } ${
                      isFlagged
                        ? "bg-yellow-500 text-white border-yellow-500"
                        : isAnswered
                        ? "bg-primary text-white border-primary"
                        : "bg-white dark:bg-slate-900 border-border text-foreground hover:bg-slate-100"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Confirmation Submit Dialog */}
      <Dialog
        isOpen={isSubmitDialogOpen}
        onClose={() => setIsSubmitDialogOpen(false)}
        title="Submit Mock Test"
      >
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
              <p className="text-base font-extrabold text-foreground">
                {quiz.questions.length - answeredCount} questions
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <Button
              onClick={() => setIsSubmitDialogOpen(false)}
              variant="outline"
              className="flex-1 font-semibold text-xs"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={() => triggerSubmit(false)}
              className="flex-1 font-semibold text-xs flex items-center justify-center gap-1 shadow-md shadow-primary/20"
              disabled={isSubmitting}
            >
              <CheckCircle2 className="h-4 w-4" /> {isSubmitting ? "Grading..." : "Submit Test"}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
