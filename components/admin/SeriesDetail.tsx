"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  createSeriesTest,
  updateSeriesTest,
  removeSeriesTest,
} from "@/app/actions/test-series";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { Dialog } from "../ui/dialog";
import {
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  FileQuestion,
  Clock3,
  Lock,
  Unlock,
  CalendarClock,
} from "lucide-react";

interface Test {
  id: string;
  title: string;
  description: string | null;
  duration: number;
  marks: number;
  negativeMarks: number;
  passingMarks: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  instructions: string | null;
  orderIndex: number;
  releaseAt: string | null;
  closeAt: string | null;
  _count?: { questions: number };
}

interface Series {
  id: string;
  title: string;
  category?: { name: string };
  timingMode: "RELEASE_ONLY" | "WINDOW";
  plannedTotalTests: number;
  quizzes: Test[];
}

// Convert a stored ISO/date string to a value the <input type="datetime-local">
// accepts (local time, no timezone, minute precision).
function toLocalInput(value: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function stateOf(t: Test, mode: Series["timingMode"]) {
  const now = Date.now();
  if (t.releaseAt && new Date(t.releaseAt).getTime() > now) return "UPCOMING";
  if (mode === "WINDOW" && t.closeAt && new Date(t.closeAt).getTime() <= now) return "CLOSED";
  return "OPEN";
}

function fmt(value: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function SeriesDetail({ series }: { series: Series }) {
  const isWindow = series.timingMode === "WINDOW";

  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Test | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("30");
  const [marks, setMarks] = useState("100");
  const [negativeMarks, setNegativeMarks] = useState("0");
  const [passingMarks, setPassingMarks] = useState("40");
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("MEDIUM");
  const [instructions, setInstructions] = useState("");
  const [releaseAt, setReleaseAt] = useState("");
  const [closeAt, setCloseAt] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const openCreate = () => {
    setSelected(null);
    setTitle("");
    setDescription("");
    setDuration("30");
    setMarks("100");
    setNegativeMarks("0");
    setPassingMarks("40");
    setDifficulty("MEDIUM");
    setInstructions("");
    setReleaseAt("");
    setCloseAt("");
    setError("");
    setSuccess(false);
    setIsOpen(true);
  };

  const openEdit = (t: Test) => {
    setSelected(t);
    setTitle(t.title);
    setDescription(t.description || "");
    setDuration(String(t.duration));
    setMarks(String(t.marks));
    setNegativeMarks(String(t.negativeMarks));
    setPassingMarks(String(t.passingMarks));
    setDifficulty(t.difficulty);
    setInstructions(t.instructions || "");
    setReleaseAt(toLocalInput(t.releaseAt));
    setCloseAt(toLocalInput(t.closeAt));
    setError("");
    setSuccess(false);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const payload = {
        title,
        description,
        duration: Number(duration),
        marks: Number(marks),
        negativeMarks: Number(negativeMarks),
        passingMarks: Number(passingMarks),
        difficulty,
        instructions,
        releaseAt,
        closeAt: isWindow ? closeAt : "",
      };
      const res = selected
        ? await updateSeriesTest(selected.id, payload)
        : await createSeriesTest(series.id, payload);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          setIsOpen(false);
          window.location.reload();
        }, 700);
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const res = await removeSeriesTest(selected.id);
      if (res.error) {
        alert(res.error);
      } else {
        setIsDeleteOpen(false);
        window.location.reload();
      }
    } catch {
      alert("Failed to remove test.");
    } finally {
      setLoading(false);
    }
  };

  const count = series.quizzes.length;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/series" className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> All series
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">{series.title}</h2>
          <p className="text-xs text-muted-foreground mt-0.5 flex flex-wrap items-center gap-2">
            <span>{series.category?.name}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <Clock3 className="h-3.5 w-3.5" /> {isWindow ? "Window mode" : "Release-only"}
            </span>
            <span>•</span>
            <span>{count}/{series.plannedTotalTests} tests added</span>
          </p>
        </div>
        <Button onClick={openCreate} className="flex items-center gap-1 font-semibold text-xs h-9 w-full sm:w-auto justify-center">
          <Plus className="h-4 w-4" /> Add Test
        </Button>
      </div>

      {count === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          No tests added yet. Click “Add Test” to create the first test in this series, then add questions to it.
        </Card>
      ) : (
        <div className="space-y-3">
          {series.quizzes.map((t, i) => {
            const st = stateOf(t, series.timingMode);
            return (
              <Card key={t.id} className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10 text-primary font-bold text-sm shrink-0">
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-foreground truncate">{t.title}</h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                          st === "OPEN"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                            : st === "UPCOMING"
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                            : "bg-slate-100 text-slate-500 dark:bg-slate-800"
                        }`}
                      >
                        {st === "OPEN" ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                        {st === "UPCOMING" ? "Upcoming" : st === "CLOSED" ? "Closed" : "Open"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-1">
                      <span className="inline-flex items-center gap-1">
                        <FileQuestion className="h-3.5 w-3.5" /> {t._count?.questions ?? 0} questions
                      </span>
                      <span>{t.duration} min</span>
                      <span>{t.marks} marks</span>
                      <span className="inline-flex items-center gap-1">
                        <CalendarClock className="h-3.5 w-3.5" /> Release: {fmt(t.releaseAt)}
                      </span>
                      {isWindow && <span>Close: {fmt(t.closeAt)}</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/admin/quizzes/${t.id}/questions`}>
                      <Button variant="secondary" size="sm" className="font-semibold text-xs">
                        Questions
                      </Button>
                    </Link>
                    <button
                      onClick={() => openEdit(t)}
                      className="inline-flex p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-foreground cursor-pointer"
                      title="Edit test"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelected(t);
                        setIsDeleteOpen(true);
                      }}
                      className="inline-flex p-2 rounded hover:bg-danger/5 text-slate-500 hover:text-danger cursor-pointer"
                      title="Remove test"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add / Edit test dialog */}
      <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)} title={selected ? "Edit Test" : "Add Test"}>
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {error && (
            <div className="flex items-center gap-2 bg-danger/10 border border-danger/20 p-3 rounded text-danger">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 bg-success/10 border border-success/20 p-3 rounded text-success">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>Saved!</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Test Title</label>
            <Input type="text" placeholder="e.g. Test 1 — General Studies" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Duration (min)</label>
              <Input type="number" min={1} value={duration} onChange={(e) => setDuration(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Difficulty</label>
              <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value as any)}>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Marks</label>
              <Input type="number" min={0} value={marks} onChange={(e) => setMarks(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Passing</label>
              <Input type="number" min={0} value={passingMarks} onChange={(e) => setPassingMarks(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Negative</label>
              <Input type="number" min={0} step="0.01" value={negativeMarks} onChange={(e) => setNegativeMarks(e.target.value)} />
            </div>
          </div>

          <div className={`grid gap-3 ${isWindow ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Release date &amp; time</label>
              <Input type="datetime-local" value={releaseAt} onChange={(e) => setReleaseAt(e.target.value)} />
              <p className="text-[11px] text-muted-foreground">Leave blank to make it available immediately.</p>
            </div>
            {isWindow && (
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Close date &amp; time</label>
                <Input type="datetime-local" value={closeAt} onChange={(e) => setCloseAt(e.target.value)} />
                <p className="text-[11px] text-muted-foreground">After this, students can&apos;t attempt.</p>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Instructions (optional)</label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-foreground min-h-16"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1 font-semibold text-xs" onClick={() => setIsOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 font-semibold text-xs" disabled={loading}>
              {loading ? "Saving..." : selected ? "Save Test" : "Add Test"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Remove dialog */}
      <Dialog isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Remove Test">
        <div className="space-y-4 text-sm">
          <div className="flex items-center gap-3 text-danger bg-danger/10 p-3 rounded border border-danger/20">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>This permanently deletes the test and all its questions. This cannot be undone.</p>
          </div>
          <p className="text-foreground">Remove &ldquo;{selected?.title}&rdquo;?</p>
          <div className="flex gap-3 mt-6">
            <Button variant="outline" className="flex-1 font-semibold text-xs" onClick={() => setIsDeleteOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button variant="destructive" className="flex-1 font-semibold text-xs" onClick={handleDelete} disabled={loading}>
              {loading ? "Removing..." : "Remove Test"}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
