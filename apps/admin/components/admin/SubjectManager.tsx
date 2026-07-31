"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createSubject,
  updateSubject,
  deleteSubject,
  mergeSubjects,
} from "@/app/actions/admin";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Input } from "../ui/input";
import { Dialog } from "../ui/dialog";
import { AlertCircle, CheckCircle, Combine, Edit, Plus, Trash2 } from "lucide-react";

interface Subject {
  id: string;
  name: string;
  slug: string;
  orderIndex: number;
  questionCount: number;
}

/**
 * विषयांचं व्यवस्थापन — मुख्यतः **एकत्र करण्यासाठी**.
 *
 * Import विषय आपोआप बनवतो, Excel च्या Category column मधून. तिथे बरेचदा
 * उपविषय लिहिलेले असतात, त्यामुळे "Banking", "Banking Services",
 * "Banking Reforms", "Rural Banking" असे एकाच विषयाचे तुकडे पडतात. Result
 * आणि Analytics विषयानुसार गट करतात, म्हणून ते तुकडे विद्यार्थ्याला दिसतात —
 * एका ओळीत एक-दोन प्रश्न.
 *
 * म्हणून इथे merge हा गाभा आहे, नुसतं नाव बदलणं नाही.
 */
export function SubjectManager({ initialSubjects }: { initialSubjects: Subject[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const [editing, setEditing] = useState<Subject | null>(null);
  const [creating, setCreating] = useState(false);

  // Merge साठी निवडलेले विषय आणि ते कशात मिसळायचे.
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [mergeOpen, setMergeOpen] = useState(false);
  const [target, setTarget] = useState<string>("");

  const subjects = initialSubjects;
  const totalQuestions = subjects.reduce((n, s) => n + s.questionCount, 0);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  /** Server action चालवून निकाल दाखवते आणि यादी पुन्हा मागवते. */
  const run = async (fn: () => Promise<any>, okText: string) => {
    setBusy(true);
    setMessage(null);
    const res = await fn();
    setBusy(false);

    if (res?.error) {
      setMessage({ ok: false, text: res.error });
      return false;
    }
    setMessage({ ok: true, text: okText });
    router.refresh();
    return true;
  };

  const onCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (await run(() => createSubject(form), "Subject added.")) setCreating(false);
  };

  const onUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editing) return;
    const form = new FormData(e.currentTarget);
    if (await run(() => updateSubject(editing.id, form), "Subject updated.")) setEditing(null);
  };

  const onMerge = async () => {
    if (!target) return;
    const sources = [...selected].filter((id) => id !== target);
    const ok = await run(
      () => mergeSubjects(target, sources),
      `Merged ${sources.length} subject${sources.length === 1 ? "" : "s"}.`
    );
    if (ok) {
      setMergeOpen(false);
      setSelected(new Set());
      setTarget("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Subjects</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {subjects.length} subjects across {totalQuestions} questions. Students see these
            as the sections in their result and analytics.
          </p>
        </div>
        <div className="flex gap-2">
          {selected.size >= 2 && (
            <Button
              variant="outline"
              onClick={() => {
                // सर्वात मोठा विषय आपोआप लक्ष्य — बहुतेक वेळा तोच हवा असतो.
                const biggest = [...selected]
                  .map((id) => subjects.find((s) => s.id === id)!)
                  .sort((a, b) => b.questionCount - a.questionCount)[0];
                setTarget(biggest?.id ?? "");
                setMergeOpen(true);
              }}
            >
              <Combine className="h-4 w-4 mr-2" />
              Merge {selected.size}
            </Button>
          )}
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Subject
          </Button>
        </div>
      </div>

      {message && (
        <div
          className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${
            message.ok
              ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
              : "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
          }`}
        >
          {message.ok ? (
            <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {subjects.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-sm text-muted-foreground">
              No subjects yet. They appear on their own when you import questions with a
              Category column, or you can add one here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All subjects</CardTitle>
            <CardDescription>
              Tick two or more to merge them into one. Merging moves every question over,
              then removes the emptied subjects.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {subjects.map((s) => (
                <div key={s.id} className="flex items-center gap-3 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(s.id)}
                    onChange={() => toggle(s.id)}
                    className="h-4 w-4 rounded border-border accent-primary"
                    aria-label={`Select ${s.name}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{s.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.questionCount} question{s.questionCount === 1 ? "" : "s"} · order{" "}
                      {s.orderIndex}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setEditing(s)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={busy}
                    onClick={() => run(() => deleteSubject(s.id), "Subject deleted.")}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── नवीन विषय ── */}
      <Dialog isOpen={creating} onClose={() => setCreating(false)} title="Add subject">
        <form onSubmit={onCreate} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Name</label>
            <Input name="name" placeholder="Banking Awareness" required autoFocus />
            <p className="text-xs text-muted-foreground mt-1">
              Questions imported with this name in their Category column will attach to it
              automatically.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setCreating(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? "Saving…" : "Add"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* ── नाव / क्रम बदल ── */}
      <Dialog isOpen={!!editing} onClose={() => setEditing(null)} title="Edit subject">
        {editing && (
          <form onSubmit={onUpdate} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Name</label>
              <Input name="name" defaultValue={editing.name} required autoFocus />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Order</label>
              <Input
                name="orderIndex"
                type="number"
                defaultValue={editing.orderIndex}
                min={0}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Lower numbers come first in a student&apos;s result.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? "Saving…" : "Save"}
              </Button>
            </div>
          </form>
        )}
      </Dialog>

      {/* ── merge ── */}
      <Dialog isOpen={mergeOpen} onClose={() => setMergeOpen(false)} title="Merge subjects">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Every question below moves into the subject you keep. The others are removed.
            This cannot be undone.
          </p>

          <div className="space-y-2">
            {[...selected].map((id) => {
              const s = subjects.find((x) => x.id === id);
              if (!s) return null;
              return (
                <label
                  key={id}
                  className="flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="mergeTarget"
                    checked={target === id}
                    onChange={() => setTarget(id)}
                    className="h-4 w-4 accent-primary"
                  />
                  <span className="flex-1 text-sm text-foreground">
                    Keep <strong>{s.name}</strong>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {s.questionCount} questions
                  </span>
                </label>
              );
            })}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setMergeOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onMerge} disabled={busy || !target}>
              {busy ? "Merging…" : "Merge"}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
