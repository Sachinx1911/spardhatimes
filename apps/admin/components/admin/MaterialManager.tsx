"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createStudyMaterial,
  updateStudyMaterial,
  deleteStudyMaterial,
} from "@/app/actions/admin";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { Dialog } from "../ui/dialog";
import {
  AlertCircle,
  BookOpen,
  CheckCircle,
  Edit,
  FileText,
  Film,
  Plus,
  Trash2,
  Video,
} from "lucide-react";

type MaterialType = "NOTE" | "VIDEO" | "BOOK" | "SHORT";

interface Material {
  id: string;
  title: string;
  description: string | null;
  type: MaterialType;
  url: string;
  thumbnailUrl: string | null;
  subjectId: string | null;
  examId: string | null;
  durationSeconds: number | null;
  pageCount: number | null;
  orderIndex: number;
  published: boolean;
}

interface Named {
  id: string;
  name: string;
}

const TYPE_META: Record<MaterialType, { label: string; icon: React.ComponentType<any> }> = {
  NOTE: { label: "Note", icon: FileText },
  VIDEO: { label: "Video", icon: Video },
  BOOK: { label: "Book", icon: BookOpen },
  SHORT: { label: "Short", icon: Film },
};

/**
 * Learn tab मधलं साहित्य.
 *
 * दुवा (URL) घेतो, file चढवत नाही — storage अजून जोडलेलं नाही आणि
 * `public/uploads/` Vercel वर टिकत नाही. Drive किंवा YouTube चा दुवा आजही
 * चालतो, त्यामुळे content टाकायला काहीच अडत नाही.
 */
export function MaterialManager({
  initialMaterials,
  subjects,
  exams,
}: {
  initialMaterials: Material[];
  subjects: Named[];
  exams: Named[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const [editing, setEditing] = useState<Material | null>(null);
  const [creating, setCreating] = useState(false);
  const [formType, setFormType] = useState<MaterialType>("NOTE");
  const [filter, setFilter] = useState<MaterialType | "ALL">("ALL");

  const materials = initialMaterials;
  const visible = filter === "ALL" ? materials : materials.filter((m) => m.type === filter);
  const liveCount = materials.filter((m) => m.published).length;

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
    if (await run(() => createStudyMaterial(form), "Study material added.")) setCreating(false);
  };

  const onUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editing) return;
    const form = new FormData(e.currentTarget);
    if (await run(() => updateStudyMaterial(editing.id, form), "Study material updated."))
      setEditing(null);
  };

  const fields = (m: Material | null) => (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Type</label>
          <Select
            name="type"
            defaultValue={m?.type ?? "NOTE"}
            onChange={(e) => setFormType(e.target.value as MaterialType)}
          >
            {(Object.keys(TYPE_META) as MaterialType[]).map((t) => (
              <option key={t} value={t}>
                {TYPE_META[t].label}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Order</label>
          <Input name="orderIndex" type="number" min={0} defaultValue={m?.orderIndex ?? 0} />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">Title</label>
        <Input name="title" defaultValue={m?.title} required autoFocus />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">Link</label>
        <Input name="url" defaultValue={m?.url} placeholder="https://…" required />
        <p className="text-xs text-muted-foreground">
          PDF, YouTube, Drive — anything with a public link. Files are not uploaded here;
          anything written into the app folder is lost on the next deploy.
        </p>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">Description</label>
        <Input name="description" defaultValue={m?.description ?? ""} />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">Thumbnail URL</label>
        <Input name="thumbnailUrl" defaultValue={m?.thumbnailUrl ?? ""} placeholder="optional" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Subject</label>
          <Select name="subjectId" defaultValue={m?.subjectId ?? ""}>
            <option value="">— none —</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Exam</label>
          <Select name="examId" defaultValue={m?.examId ?? ""}>
            <option value="">— none —</option>
            {exams.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* लांबी फक्त व्हिडिओला, पानं फक्त वाचायच्या साहित्याला — दोन्ही एकत्र
          दाखवली तर कोणतं भरायचं हा प्रश्न पडतो. */}
      {formType === "VIDEO" || formType === "SHORT" ? (
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Duration (minutes)</label>
          <Input
            name="durationMinutes"
            type="number"
            min={0}
            defaultValue={m?.durationSeconds ? Math.round(m.durationSeconds / 60) : ""}
          />
        </div>
      ) : (
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Pages</label>
          <Input name="pageCount" type="number" min={0} defaultValue={m?.pageCount ?? ""} />
        </div>
      )}

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="published"
          defaultChecked={m ? m.published : false}
          className="h-4 w-4 accent-primary"
        />
        <span>Published (visible in the app)</span>
      </label>
    </>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Study Material</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {liveCount} of {materials.length} published. This is what fills the Learn tab.
          </p>
        </div>
        <Button
          onClick={() => {
            setFormType("NOTE");
            setCreating(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Material
        </Button>
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

      <div className="flex flex-wrap gap-2">
        {(["ALL", ...(Object.keys(TYPE_META) as MaterialType[])] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t as MaterialType | "ALL")}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
              filter === t
                ? "bg-primary text-white border-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "ALL" ? "All" : `${TYPE_META[t as MaterialType].label}s`}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-sm text-muted-foreground">
              Nothing here yet. Until something is published, the Learn tab shows an empty
              state.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All material</CardTitle>
            <CardDescription>
              Previous-year papers are not listed here — those are tests, managed under
              Quizzes with their type set to PYQ.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {visible.map((m) => {
                const Icon = TYPE_META[m.type].icon;
                return (
                  <div key={m.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="h-9 w-9 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{m.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {TYPE_META[m.type].label}
                        {m.published ? "" : " · draft"}
                        {m.durationSeconds ? ` · ${Math.round(m.durationSeconds / 60)} min` : ""}
                        {m.pageCount ? ` · ${m.pageCount} pages` : ""}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFormType(m.type);
                        setEditing(m);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={busy}
                      onClick={() => run(() => deleteStudyMaterial(m.id), "Deleted.")}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog isOpen={creating} onClose={() => setCreating(false)} title="Add study material">
        <form onSubmit={onCreate} className="space-y-4">
          {fields(null)}
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

      <Dialog isOpen={!!editing} onClose={() => setEditing(null)} title="Edit study material">
        {editing && (
          <form onSubmit={onUpdate} className="space-y-4">
            {fields(editing)}
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
    </div>
  );
}
