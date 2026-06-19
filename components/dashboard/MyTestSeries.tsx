import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { testState } from "@/lib/releases";
import {
  Layers3,
  Lock,
  Clock,
  CheckCircle2,
  FileQuestion,
  CalendarClock,
  ArrowRight,
} from "lucide-react";

interface SeriesTest {
  id: string;
  slug: string;
  title: string;
  marks: number;
  duration: number;
  releaseAt: Date | string | null;
  closeAt: Date | string | null;
  _count?: { questions: number };
}

interface AssignedSeries {
  id: string;
  title: string;
  description: string | null;
  timingMode: "RELEASE_ONLY" | "WINDOW";
  category?: { name: string } | null;
  quizzes: SeriesTest[];
}

function fmt(value: Date | string | null) {
  if (!value) return "";
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function MyTestSeries({
  series,
  attemptedQuizIds,
}: {
  series: AssignedSeries[];
  attemptedQuizIds: string[];
}) {
  const attempted = new Set(attemptedQuizIds);

  if (series.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Layers3 className="h-7 w-7 text-primary mx-auto mb-2" />
        <h3 className="font-bold text-foreground">No test series assigned yet</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Your test series will appear here once an admin assigns them to you.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {series.map((s) => {
        const toDate = (v: Date | string | null) => (v ? new Date(v) : null);
        return (
          <Card key={s.id} className="overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-border/40 bg-slate-50/60 dark:bg-slate-950/30">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Layers3 className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-foreground">{s.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {s.category?.name ? `${s.category.name} • ` : ""}
                    {s.quizzes.length} test{s.quizzes.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
              {s.description && (
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{s.description}</p>
              )}
            </div>

            {s.quizzes.length === 0 ? (
              <div className="p-5 text-center text-sm text-muted-foreground">
                Tests will be added to this series soon.
              </div>
            ) : (
              <ul className="divide-y divide-border/40">
                {s.quizzes.map((t, i) => {
                  const state = testState(
                    { releaseAt: toDate(t.releaseAt), closeAt: toDate(t.closeAt) },
                    s.timingMode
                  );
                  const isAttempted = attempted.has(t.id);
                  return (
                    <li key={t.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex items-center justify-center h-8 w-8 rounded-md bg-slate-100 dark:bg-slate-800 text-foreground font-bold text-sm shrink-0">
                        {i + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-foreground">{t.title}</h4>
                          {isAttempted && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                              <CheckCircle2 className="h-3 w-3" /> Attempted
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-1">
                          <span className="inline-flex items-center gap-1">
                            <FileQuestion className="h-3.5 w-3.5" /> {t._count?.questions ?? 0} Qs
                          </span>
                          <span>{t.duration} min</span>
                          <span>{t.marks} marks</span>
                          {state === "UPCOMING" && t.releaseAt && (
                            <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                              <CalendarClock className="h-3.5 w-3.5" /> Unlocks {fmt(t.releaseAt)}
                            </span>
                          )}
                          {state === "OPEN" && s.timingMode === "WINDOW" && t.closeAt && (
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" /> Closes {fmt(t.closeAt)}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="shrink-0 w-full sm:w-auto">
                        {state === "OPEN" ? (
                          <Link href={`/quiz/${t.slug}/attempt`} className="block">
                            <Button size="sm" className="w-full sm:w-auto font-semibold text-xs flex items-center justify-center gap-1">
                              {isAttempted ? "Re-attempt" : "Start Test"} <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                        ) : state === "UPCOMING" ? (
                          <Button size="sm" variant="outline" disabled className="w-full sm:w-auto font-semibold text-xs flex items-center justify-center gap-1 opacity-70">
                            <Lock className="h-3.5 w-3.5" /> Locked
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" disabled className="w-full sm:w-auto font-semibold text-xs flex items-center justify-center gap-1 opacity-70">
                            <Lock className="h-3.5 w-3.5" /> Closed
                          </Button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        );
      })}
    </div>
  );
}
