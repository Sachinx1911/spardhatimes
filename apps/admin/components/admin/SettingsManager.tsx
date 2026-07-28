"use client";

import React, { useState } from "react";
import { updateSettings } from "@/app/actions/admin";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { Settings, CheckCircle2, AlertCircle, Loader2, Megaphone, UserPlus, Trophy } from "lucide-react";

export function SettingsManager({ initial }: { initial: Record<string, string> }) {
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const set = (key: string, value: string) => setValues((prev) => ({ ...prev, [key]: value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    const res = await updateSettings(values);
    setSaving(false);
    setFeedback(
      res.error
        ? { type: "error", message: res.error }
        : { type: "success", message: "Settings saved and applied." }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" /> Platform Settings
        </h2>
        <p className="text-xs text-muted-foreground">
          Global configuration — changes take effect immediately across the platform.
        </p>
      </div>

      <form onSubmit={handleSave}>
        <Card className="divide-y divide-border/40">
          {/* Announcement */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <div>
              <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                <Megaphone className="h-4 w-4 text-primary" /> Site Announcement
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Banner shown at the top of the homepage. Leave empty to hide.
              </p>
            </div>
            <div className="md:col-span-2">
              <Input
                type="text"
                value={values.site_announcement || ""}
                onChange={(e) => set("site_announcement", e.target.value)}
                placeholder="e.g. New MPSC test series launching Monday!"
              />
            </div>
          </div>

          {/* Registrations */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <div>
              <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                <UserPlus className="h-4 w-4 text-primary" /> New Registrations
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Closing registrations blocks new student sign-ups; existing users are unaffected.
              </p>
            </div>
            <div className="md:col-span-2">
              <Select
                value={values.registrations_open || "true"}
                onChange={(e) => set("registrations_open", e.target.value)}
              >
                <option value="true">Open — anyone can register</option>
                <option value="false">Closed — registrations disabled</option>
              </Select>
            </div>
          </div>

          {/* Leaderboard size */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <div>
              <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-primary" /> Leaderboard Size
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Number of top performers shown per leaderboard tab (1–100).
              </p>
            </div>
            <div className="md:col-span-2">
              <Input
                type="number"
                min={1}
                max={100}
                value={values.leaderboard_size || "20"}
                onChange={(e) => set("leaderboard_size", e.target.value)}
                className="max-w-[140px]"
              />
            </div>
          </div>

          {/* Save bar */}
          <div className="p-5 flex items-center justify-between gap-4">
            {feedback ? (
              <span className={`flex items-center gap-1.5 text-xs font-semibold ${
                feedback.type === "success" ? "text-success" : "text-danger"
              }`}>
                {feedback.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                {feedback.message}
              </span>
            ) : <span />}
            <Button type="submit" disabled={saving} className="font-semibold flex items-center gap-1.5">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Settings
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
