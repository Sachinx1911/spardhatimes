"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  createTestSeries,
  updateTestSeries,
  deleteTestSeries,
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
  ListChecks,
  Users,
  Clock3,
  ArrowRight,
} from "lucide-react";

interface Series {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  categoryId: string;
  category?: { name: string };
  timingMode: "RELEASE_ONLY" | "WINDOW";
  plannedTotalTests: number;
  published: boolean;
  _count?: { quizzes: number; access: number };
}

interface Category {
  id: string;
  name: string;
}

export function SeriesManager({
  initialSeries,
  categories,
}: {
  initialSeries: Series[];
  categories: Category[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Series | null>(null);

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [description, setDescription] = useState("");
  const [timingMode, setTimingMode] = useState<"RELEASE_ONLY" | "WINDOW">("RELEASE_ONLY");
  const [plannedTotalTests, setPlannedTotalTests] = useState("10");
  const [published, setPublished] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const openCreate = () => {
    setSelected(null);
    setTitle("");
    setCategoryId(categories[0]?.id || "");
    setDescription("");
    setTimingMode("RELEASE_ONLY");
    setPlannedTotalTests("10");
    setPublished(true);
    setError("");
    setSuccess(false);
    setIsOpen(true);
  };

  const openEdit = (s: Series) => {
    setSelected(s);
    setTitle(s.title);
    setCategoryId(s.categoryId);
    setDescription(s.description || "");
    setTimingMode(s.timingMode);
    setPlannedTotalTests(String(s.plannedTotalTests));
    setPublished(s.published);
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
        categoryId,
        timingMode,
        plannedTotalTests: Number(plannedTotalTests),
      };
      const res = selected
        ? await updateTestSeries(selected.id, { ...payload, published })
        : await createTestSeries(payload);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          setIsOpen(false);
          window.location.reload();
        }, 800);
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
      const res = await deleteTestSeries(selected.id);
      if (res.error) {
        alert(res.error);
      } else {
        setIsDeleteOpen(false);
        window.location.reload();
      }
    } catch {
      alert("Failed to delete series.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Test Series</h2>
          <p className="text-xs text-muted-foreground">
            Create a series, set how many tests it holds, then add &amp; schedule each test.
          </p>
        </div>
        <Button onClick={openCreate} className="flex items-center gap-1 font-semibold text-xs h-9 w-full sm:w-auto justify-center">
          <Plus className="h-4 w-4" /> New Test Series
        </Button>
      </div>

      {categories.length === 0 && (
        <Card className="p-4 text-sm flex items-center gap-2 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border-amber-200">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Create a Category first — every test series belongs to one.
        </Card>
      )}

      {initialSeries.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          No test series yet. Click “New Test Series” to create your first one.
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {initialSeries.map((s) => {
            const count = s._count?.quizzes ?? 0;
            return (
              <Card key={s.id} className="p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-foreground truncate">{s.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {s.category?.name || "—"}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      s.published
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-800"
                    }`}
                  >
                    {s.published ? "Published" : "Hidden"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <ListChecks className="h-3.5 w-3.5 text-primary" /> {count}/{s.plannedTotalTests} tests
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-primary" /> {s._count?.access ?? 0} students
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock3 className="h-3.5 w-3.5 text-primary" />
                    {s.timingMode === "WINDOW" ? "Window" : "Release-only"}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Link href={`/admin/series/${s.id}`} className="flex-1">
                    <Button variant="secondary" size="sm" className="w-full font-semibold text-xs flex items-center justify-center gap-1">
                      Manage tests <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                  <button
                    onClick={() => openEdit(s)}
                    className="inline-flex p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-foreground cursor-pointer"
                    title="Edit series"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelected(s);
                      setIsDeleteOpen(true);
                    }}
                    className="inline-flex p-2 rounded hover:bg-danger/5 text-slate-500 hover:text-danger cursor-pointer"
                    title="Delete series"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create / Edit dialog */}
      <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)} title={selected ? "Edit Test Series" : "New Test Series"}>
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
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Series Title</label>
            <Input type="text" placeholder="e.g. Police Bharti 2026 Full Test Series" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</label>
            <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description (optional)</label>
            <textarea
              placeholder="Short description shown to students"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-foreground min-h-16"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Tests (planned)</label>
              <Input type="number" min={0} value={plannedTotalTests} onChange={(e) => setPlannedTotalTests(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Timing Mode</label>
              <Select value={timingMode} onChange={(e) => setTimingMode(e.target.value as any)}>
                <option value="RELEASE_ONLY">Release-only (stays open)</option>
                <option value="WINDOW">Window (release → close)</option>
              </Select>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground -mt-1">
            {timingMode === "WINDOW"
              ? "Each test opens at its release time and locks at its close time."
              : "Each test opens at its release time and stays open afterwards."}
          </p>

          {selected && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="h-4 w-4" />
              <span>Published (visible to assigned students)</span>
            </label>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1 font-semibold text-xs" onClick={() => setIsOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 font-semibold text-xs" disabled={loading}>
              {loading ? "Saving..." : "Save Series"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete dialog */}
      <Dialog isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete Test Series">
        <div className="space-y-4 text-sm">
          <div className="flex items-center gap-3 text-danger bg-danger/10 p-3 rounded border border-danger/20">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>The series will be removed and its tests will be unlinked (the tests themselves are kept). Student assignments to this series are removed.</p>
          </div>
          <p className="text-foreground">Delete &ldquo;{selected?.title}&rdquo;?</p>
          <div className="flex gap-3 mt-6">
            <Button variant="outline" className="flex-1 font-semibold text-xs" onClick={() => setIsDeleteOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button variant="destructive" className="flex-1 font-semibold text-xs" onClick={handleDelete} disabled={loading}>
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
