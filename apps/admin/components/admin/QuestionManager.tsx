"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createQuestion, updateQuestion, deleteQuestion } from "@/app/actions/admin";
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
  HelpCircle,
  FileSpreadsheet,
} from "lucide-react";

interface Question {
  id: string;
  type: string;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string | null;
  difficulty: string;
  marks: number;
  categoryName: string | null;
}

const TYPE_LABELS: Record<string, string> = {
  SINGLE_CHOICE: "Single Choice",
  MULTIPLE_CHOICE: "Multiple Choice",
  TRUE_FALSE: "True / False",
};

interface Quiz {
  id: string;
  title: string;
  slug: string;
}

const emptyForm = {
  type: "SINGLE_CHOICE",
  text: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctAnswer: "A",
  explanation: "",
  difficulty: "MEDIUM",
  marks: 1,
  categoryName: "",
};

export function QuestionManager({ quiz, questions }: { quiz: Quiz; questions: Question[] }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Question | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const openCreate = () => {
    setSelected(null);
    setForm({ ...emptyForm });
    setError("");
    setSuccess(false);
    setIsOpen(true);
  };

  const openEdit = (q: Question) => {
    setSelected(q);
    setForm({
      type: q.type || "SINGLE_CHOICE",
      text: q.text,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || "",
      difficulty: q.difficulty,
      marks: q.marks,
      categoryName: q.categoryName || "",
    });
    setError("");
    setSuccess(false);
    setIsOpen(true);
  };

  // Switching type resets the correct answer to a valid default for that type.
  const handleTypeChange = (type: string) => {
    setForm((prev) => ({
      ...prev,
      type,
      correctAnswer: type === "MULTIPLE_CHOICE" ? "" : "A",
      ...(type === "TRUE_FALSE"
        ? { optionA: "True", optionB: "False", optionC: "", optionD: "" }
        : {}),
    }));
  };

  // Multiple-choice correct answers are kept as a sorted comma list ("A,C").
  const toggleCorrectOption = (letter: string) => {
    setForm((prev) => {
      const current = prev.correctAnswer ? prev.correctAnswer.split(",") : [];
      const next = current.includes(letter)
        ? current.filter((l) => l !== letter)
        : [...current, letter].sort();
      return { ...prev, correctAnswer: next.join(",") };
    });
  };

  const update = (field: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const payload = {
      ...form,
      type: form.type as any,
      marks: Number(form.marks) || 1,
      difficulty: form.difficulty as any,
    };

    const res = selected
      ? await updateQuestion(selected.id, payload)
      : await createQuestion(quiz.id, payload);

    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      setSuccess(true);
      router.refresh();
      setTimeout(() => setIsOpen(false), 700);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this question permanently?")) return;
    setDeletingId(id);
    const res = await deleteQuestion(id);
    setDeletingId(null);
    if (res.error) {
      alert(res.error);
    } else {
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <Link
            href="/admin/quizzes"
            className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Quizzes
          </Link>
          <h2 className="text-xl font-bold text-foreground">Questions — {quiz.title}</h2>
          <p className="text-xs text-muted-foreground">{questions.length} question(s) in this quiz.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/questions/import">
            <Button variant="outline" className="flex items-center gap-1 font-semibold text-xs h-9">
              <FileSpreadsheet className="h-4 w-4" /> Bulk Import
            </Button>
          </Link>
          <Button onClick={openCreate} className="flex items-center gap-1 font-semibold text-xs h-9">
            <Plus className="h-4 w-4" /> Add Question
          </Button>
        </div>
      </div>

      {/* List */}
      <Card>
        {questions.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground text-sm">
            No questions yet. Add one manually or use the bulk Excel import.
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {questions.map((q, idx) => (
              <div key={q.id} className="p-4 flex items-start justify-between gap-4">
                <div className="space-y-2 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Q{idx + 1}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400 uppercase">
                      {TYPE_LABELS[q.type] || "Single Choice"}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 uppercase">
                      {q.difficulty}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
                      Ans: {q.type === "TRUE_FALSE" ? (q.correctAnswer === "A" ? "True" : "False") : q.correctAnswer}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{q.marks} mark(s)</span>
                  </div>
                  <p className="font-semibold text-sm text-foreground">{q.text}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-muted-foreground">
                    <span>A. {q.optionA}</span>
                    <span>B. {q.optionB}</span>
                    {q.type !== "TRUE_FALSE" && (
                      <>
                        <span>C. {q.optionC}</span>
                        <span>D. {q.optionD}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => openEdit(q)}
                    className="inline-flex p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-foreground cursor-pointer"
                    title="Edit question"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    disabled={deletingId === q.id}
                    className="inline-flex p-1.5 rounded hover:bg-danger/5 text-slate-500 hover:text-danger cursor-pointer disabled:opacity-50"
                    title="Delete question"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={selected ? "Edit Question" : "Add Question"}
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Question Type</label>
              <Select value={form.type} onChange={(e) => handleTypeChange(e.target.value)}>
                <option value="SINGLE_CHOICE">Single Choice</option>
                <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                <option value="TRUE_FALSE">True / False</option>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Difficulty</label>
              <Select value={form.difficulty} onChange={(e) => update("difficulty", e.target.value)}>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Question Text</label>
            <textarea
              className="flex w-full rounded-md border border-input bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 px-3 py-2 text-sm min-h-[70px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={form.text}
              onChange={(e) => update("text", e.target.value)}
              required
            />
          </div>

          {form.type !== "TRUE_FALSE" && (
            <div className="grid grid-cols-2 gap-3">
              {(["A", "B", "C", "D"] as const).map((key) => (
                <div key={key} className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Option {key}</label>
                  <Input
                    type="text"
                    value={(form as any)[`option${key}`]}
                    onChange={(e) => update(`option${key}`, e.target.value)}
                    required
                  />
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {form.type === "MULTIPLE_CHOICE" ? "Correct Answers (select all)" : "Correct Answer"}
              </label>
              {form.type === "MULTIPLE_CHOICE" ? (
                <div className="flex gap-2 pt-1">
                  {(["A", "B", "C", "D"] as const).map((letter) => {
                    const checked = form.correctAnswer.split(",").includes(letter);
                    return (
                      <button
                        key={letter}
                        type="button"
                        onClick={() => toggleCorrectOption(letter)}
                        className={`h-9 w-9 rounded-md border font-bold text-xs transition-colors cursor-pointer ${
                          checked
                            ? "bg-primary text-white border-primary"
                            : "bg-slate-100 dark:bg-slate-800 border-border text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        {letter}
                      </button>
                    );
                  })}
                </div>
              ) : form.type === "TRUE_FALSE" ? (
                <Select value={form.correctAnswer} onChange={(e) => update("correctAnswer", e.target.value)}>
                  <option value="A">True</option>
                  <option value="B">False</option>
                </Select>
              ) : (
                <Select value={form.correctAnswer} onChange={(e) => update("correctAnswer", e.target.value)}>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </Select>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Marks</label>
              <Input
                type="number"
                step="0.5"
                min="0"
                value={form.marks}
                onChange={(e) => update("marks", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sub-topic / Category (optional)</label>
            <Input type="text" value={form.categoryName} onChange={(e) => update("categoryName", e.target.value)} placeholder="e.g. Algebra" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <HelpCircle className="h-3.5 w-3.5" /> Explanation (optional)
            </label>
            <textarea
              className="flex w-full rounded-md border border-input bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 px-3 py-2 text-sm min-h-[60px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={form.explanation}
              onChange={(e) => update("explanation", e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="font-semibold">
              {loading ? "Saving..." : selected ? "Update Question" : "Add Question"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
