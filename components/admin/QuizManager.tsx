"use client";

import React, { useState } from "react";
import Link from "next/link";
import { createQuiz, updateQuiz, deleteQuiz } from "@/app/actions/admin";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Input } from "../ui/input";
import { Dialog } from "../ui/dialog";
import { Select } from "../ui/select";
import {
  Plus,
  Edit,
  Trash2,
  Clock,
  Award,
  AlertCircle,
  CheckCircle,
  FileText,
  HelpCircle,
  Activity,
  ListChecks
} from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface Quiz {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  duration: number;
  marks: number;
  negativeMarks: number;
  passingMarks: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  status: "DRAFT" | "PUBLISHED";
  instructions: string | null;
  categoryId: string;
  category: { name: string };
  _count: { questions: number };
}

export function QuizManager({ 
  initialQuizzes, 
  categories 
}: { 
  initialQuizzes: Quiz[];
  categories: Category[];
}) {
  const [quizzes, setQuizzes] = useState<Quiz[]>(initialQuizzes);
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  // Form values
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(15);
  const [marks, setMarks] = useState(15);
  const [negativeMarks, setNegativeMarks] = useState(0.25);
  const [passingMarks, setPassingMarks] = useState(7.5);
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("MEDIUM");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [instructions, setInstructions] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const openCreateDialog = () => {
    setSelectedQuiz(null);
    setTitle("");
    setSlug("");
    setDescription("");
    setDuration(15);
    setMarks(15);
    setNegativeMarks(0.25);
    setPassingMarks(7.5);
    setDifficulty("MEDIUM");
    setStatus("DRAFT");
    setInstructions("");
    setCategoryId(categories[0]?.id || "");
    setError("");
    setSuccess(false);
    setIsOpen(true);
  };

  const openEditDialog = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setTitle(quiz.title);
    setSlug(quiz.slug);
    setDescription(quiz.description || "");
    setDuration(quiz.duration);
    setMarks(quiz.marks);
    setNegativeMarks(quiz.negativeMarks);
    setPassingMarks(quiz.passingMarks);
    setDifficulty(quiz.difficulty);
    setStatus(quiz.status);
    setInstructions(quiz.instructions || "");
    setCategoryId(quiz.categoryId);
    setError("");
    setSuccess(false);
    setIsOpen(true);
  };

  const openDeleteDialog = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setIsDeleteOpen(true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!selectedQuiz) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const quizData = {
      title,
      slug,
      description,
      duration: Number(duration),
      marks: Number(marks),
      negativeMarks: Number(negativeMarks),
      passingMarks: Number(passingMarks),
      difficulty,
      status,
      instructions,
      categoryId
    };

    try {
      let res;
      if (selectedQuiz) {
        res = await updateQuiz(selectedQuiz.id, quizData);
      } else {
        res = await createQuiz(quizData);
      }

      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          setIsOpen(false);
          window.location.reload();
        }, 1000);
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedQuiz) return;
    setLoading(true);

    try {
      const res = await deleteQuiz(selectedQuiz.id);
      if (res.error) {
        alert(res.error);
      } else {
        setIsDeleteOpen(false);
        window.location.reload();
      }
    } catch (err) {
      alert("Failed to delete quiz.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-foreground">Manage Tests</h2>
          <p className="text-xs text-muted-foreground">Build, edit, configure negative markings, or publish tests.</p>
        </div>
        <Button onClick={openCreateDialog} className="flex items-center gap-1 font-semibold text-xs h-9">
          <Plus className="h-4 w-4" /> Create Quiz
        </Button>
      </div>

      {/* Grid listing */}
      <Card>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-border/40 font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                <th className="p-4">Quiz Name</th>
                <th className="p-4">Category</th>
                <th className="p-4 text-center">Questions</th>
                <th className="p-4 text-center">Time</th>
                <th className="p-4 text-center">Marks</th>
                <th className="p-4 text-center">Neg Marks</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {quizzes.map((quiz) => (
                <tr key={quiz.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 text-sm">
                  <td className="p-4 font-bold text-foreground">
                    <div>
                      {quiz.title}
                      <span className="text-[10px] text-muted-foreground font-mono block font-normal mt-0.5">{quiz.slug}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">
                      {quiz.category?.name}
                    </span>
                  </td>
                  <td className="p-4 text-center font-semibold">{quiz._count?.questions || 0}</td>
                  <td className="p-4 text-center font-semibold">{quiz.duration} min</td>
                  <td className="p-4 text-center font-semibold">{quiz.marks} pts</td>
                  <td className="p-4 text-center text-red-600 dark:text-red-400 font-semibold">-{quiz.negativeMarks}</td>
                  <td className="p-4 text-center">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                      quiz.status === "PUBLISHED" 
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400" 
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
                    }`}>
                      {quiz.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <Link
                      href={`/admin/quizzes/${quiz.id}/questions`}
                      className="inline-flex p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-primary cursor-pointer align-middle"
                      title="Manage questions"
                    >
                      <ListChecks className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => openEditDialog(quiz)}
                      className="inline-flex p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-foreground cursor-pointer"
                      title="Edit quiz metadata"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openDeleteDialog(quiz)}
                      className="inline-flex p-1.5 rounded hover:bg-danger/5 text-slate-500 hover:text-danger cursor-pointer"
                      title="Delete quiz"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add / Edit Modal */}
      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={selectedQuiz ? "Edit Test" : "Create Test"}
        className="max-w-xl"
      >
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
              <span>Saved successfully!</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1 col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quiz Title</label>
              <Input
                type="text"
                placeholder="e.g. Science Test 1"
                value={title}
                onChange={handleTitleChange}
                required
              />
            </div>
            
            <div className="space-y-1 col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quiz Slug</label>
              <Input
                type="text"
                placeholder="e.g. science-test-1"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1 col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</label>
              <textarea
                placeholder="Brief summary of the test content"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-foreground min-h-16"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</label>
              <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Difficulty</label>
              <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value as any)}>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Duration (Minutes)</label>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                min={1}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Marks</label>
              <Input
                type="number"
                value={marks}
                onChange={(e) => setMarks(Number(e.target.value))}
                min={1}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Negative Marks</label>
              <Input
                type="number"
                step="0.05"
                value={negativeMarks}
                onChange={(e) => setNegativeMarks(Number(e.target.value))}
                min={0}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Passing Marks</label>
              <Input
                type="number"
                value={passingMarks}
                onChange={(e) => setPassingMarks(Number(e.target.value))}
                min={0}
                required
              />
            </div>

            <div className="space-y-1 col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Instructions</label>
              <textarea
                placeholder="Bullet points on negative marks, calculators, rules..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-foreground min-h-16"
              />
            </div>

            <div className="space-y-1 col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Publishing Status</label>
              <Select value={status} onChange={(e) => setStatus(e.target.value as any)}>
                <option value="DRAFT">Draft (Hidden)</option>
                <option value="PUBLISHED">Published (Active)</option>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border/40">
            <Button
              type="button"
              variant="outline"
              className="flex-1 font-semibold text-xs"
              onClick={() => setIsOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 font-semibold text-xs"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Quiz"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Quiz"
      >
        <div className="space-y-4 text-sm">
          <div className="flex items-center gap-3 text-danger bg-danger/10 p-3 rounded border border-danger/20">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>Warning: Deleting this quiz will remove all student attempts and certificate records. This cannot be undone!</p>
          </div>
          <p className="text-foreground">Are you sure you want to delete the quiz &ldquo;{selectedQuiz?.title}&rdquo;?</p>
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              className="flex-1 font-semibold text-xs"
              onClick={() => setIsDeleteOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1 font-semibold text-xs"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete Quiz"}
            </Button>
          </div>
        </div>
      </Dialog>

    </div>
  );
}
