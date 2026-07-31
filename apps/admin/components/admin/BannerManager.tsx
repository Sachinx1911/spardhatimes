"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createBanner, updateBanner, deleteBanner } from "@/app/actions/admin";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Input } from "../ui/input";
import { Dialog } from "../ui/dialog";
import { AlertCircle, CheckCircle, Edit, ImageOff, Plus, Trash2 } from "lucide-react";

interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string | null;
  active: boolean;
  orderIndex: number;
  startsAt: string | null;
  endsAt: string | null;
}

/** `datetime-local` ला "YYYY-MM-DDTHH:mm" लागतं; ISO चा उरलेला भाग तो नाकारतो. */
const forInput = (iso: string | null) => (iso ? iso.slice(0, 16) : "");

/**
 * Dashboard वरच्या सरकत्या पट्टीतल्या जाहिराती.
 *
 * विद्यार्थ्याच्या Home वर पहिलं जे दिसतं तेच हे, म्हणून इथे चूक झाली की ती
 * सगळ्यांना दिसते. त्यामुळे प्रत्येक जाहिरातीची प्रतिमा इथेच दाखवली आहे —
 * URL चुकलेली असेल तर ती save करण्याआधीच कळते.
 */
export function BannerManager({ initialBanners }: { initialBanners: Banner[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const [editing, setEditing] = useState<Banner | null>(null);
  const [creating, setCreating] = useState(false);

  // Form मध्ये लिहिताना प्रतिमा लगेच दिसावी म्हणून.
  const [preview, setPreview] = useState("");

  const banners = initialBanners;
  const liveCount = banners.filter((b) => b.active).length;

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
    if (await run(() => createBanner(form), "Banner added.")) {
      setCreating(false);
      setPreview("");
    }
  };

  const onUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editing) return;
    const form = new FormData(e.currentTarget);
    if (await run(() => updateBanner(editing.id, form), "Banner updated.")) {
      setEditing(null);
      setPreview("");
    }
  };

  const fields = (b: Banner | null) => (
    <>
      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">Title</label>
        <Input name="title" defaultValue={b?.title} required autoFocus />
        <p className="text-xs text-muted-foreground">
          For your own reference — students see the image, not this.
        </p>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">Image URL</label>
        <Input
          name="imageUrl"
          defaultValue={b?.imageUrl}
          placeholder="https://…"
          required
          onChange={(e) => setPreview(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Host the image anywhere and paste the link. Uploads are not used here —
          files written into the app folder do not survive a deploy.
        </p>
      </div>

      {(preview || b?.imageUrl) && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview || b?.imageUrl}
          alt=""
          className="w-full rounded-lg border border-border object-cover max-h-40"
        />
      )}

      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">Link (optional)</label>
        <Input name="linkUrl" defaultValue={b?.linkUrl ?? ""} placeholder="https://…" />
        <p className="text-xs text-muted-foreground">
          Where tapping it goes. Leave blank for a banner that just shows.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Starts (optional)</label>
          <Input name="startsAt" type="datetime-local" defaultValue={forInput(b?.startsAt ?? null)} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Ends (optional)</label>
          <Input name="endsAt" type="datetime-local" defaultValue={forInput(b?.endsAt ?? null)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 items-end">
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Order</label>
          <Input name="orderIndex" type="number" defaultValue={b?.orderIndex ?? 0} min={0} />
        </div>
        <label className="flex items-center gap-2 text-sm pb-2">
          <input
            type="checkbox"
            name="active"
            defaultChecked={b ? b.active : true}
            className="h-4 w-4 accent-primary"
          />
          <span>Active</span>
        </label>
      </div>
    </>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Banners</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {liveCount} of {banners.length} showing on the student home screen.
          </p>
        </div>
        <Button
          onClick={() => {
            setPreview("");
            setCreating(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Banner
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

      {banners.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center space-y-2">
            <ImageOff className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No banners yet. Until one is added, the home screen shows a plain text
              panel in this slot.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All banners</CardTitle>
            <CardDescription>
              Shown in order. Anything inactive, not yet started or already ended is
              skipped.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {banners.map((b) => (
                <div key={b.id} className="flex items-center gap-3 px-4 py-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={b.imageUrl}
                    alt=""
                    className="h-12 w-20 rounded-md object-cover border border-border shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{b.title}</p>
                    <p className="text-xs text-muted-foreground">
                      order {b.orderIndex}
                      {b.active ? "" : " · inactive"}
                      {b.linkUrl ? " · links out" : ""}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setPreview(b.imageUrl);
                      setEditing(b);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={busy}
                    onClick={() => run(() => deleteBanner(b.id), "Banner deleted.")}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog
        isOpen={creating}
        onClose={() => {
          setCreating(false);
          setPreview("");
        }}
        title="Add banner"
      >
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

      <Dialog
        isOpen={!!editing}
        onClose={() => {
          setEditing(null);
          setPreview("");
        }}
        title="Edit banner"
      >
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
