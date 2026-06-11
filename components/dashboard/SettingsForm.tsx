"use client";

import React, { useState } from "react";
import { updateProfile, changePassword } from "@/app/actions/auth";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface SettingsFormProps {
  name: string;
  email: string;
  role: string;
}

type Feedback = { type: "success" | "error"; message: string } | null;

export function SettingsForm({ name, email, role }: SettingsFormProps) {
  const [profileFeedback, setProfileFeedback] = useState<Feedback>(null);
  const [passwordFeedback, setPasswordFeedback] = useState<Feedback>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileFeedback(null);
    const formData = new FormData(e.currentTarget);
    const res = await updateProfile(formData);
    if (res.error) {
      setProfileFeedback({ type: "error", message: res.error });
    } else {
      setProfileFeedback({ type: "success", message: res.message || "Saved." });
    }
    setSavingProfile(false);
  };

  const handlePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSavingPassword(true);
    setPasswordFeedback(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const res = await changePassword(formData);
    if (res.error) {
      setPasswordFeedback({ type: "error", message: res.error });
    } else {
      setPasswordFeedback({ type: "success", message: res.message || "Saved." });
      form.reset();
    }
    setSavingPassword(false);
  };

  const FeedbackBanner = ({ feedback }: { feedback: Feedback }) =>
    feedback ? (
      <div
        className={`flex items-center gap-2 text-xs font-semibold rounded-md p-2.5 ${
          feedback.type === "success"
            ? "bg-success/10 text-success"
            : "bg-danger/10 text-danger"
        }`}
      >
        {feedback.type === "success" ? (
          <CheckCircle2 className="h-4 w-4 shrink-0" />
        ) : (
          <AlertCircle className="h-4 w-4 shrink-0" />
        )}
        {feedback.message}
      </div>
    ) : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Profile */}
      <form className="space-y-4 max-w-md" onSubmit={handleProfile}>
        <h4 className="font-bold text-sm text-foreground">Profile Details</h4>
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">User Name</label>
          <Input type="text" name="name" defaultValue={name} placeholder="Display name" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address (Read-only)</label>
          <Input type="email" value={email} disabled className="bg-slate-100 dark:bg-slate-800 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">User Role</label>
          <Input type="text" value={role} disabled className="bg-slate-100 dark:bg-slate-800 text-muted-foreground" />
        </div>
        <FeedbackBanner feedback={profileFeedback} />
        <Button type="submit" disabled={savingProfile} className="font-semibold text-xs mt-2 flex items-center gap-1.5">
          {savingProfile && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Save Profile
        </Button>
      </form>

      {/* Change Password */}
      <form className="space-y-4 max-w-md" onSubmit={handlePassword}>
        <h4 className="font-bold text-sm text-foreground">Change Password</h4>
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current Password</label>
          <Input type="password" name="currentPassword" placeholder="••••••••" autoComplete="current-password" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">New Password</label>
          <Input type="password" name="newPassword" placeholder="•••••••• (Min 6 chars)" autoComplete="new-password" />
        </div>
        <FeedbackBanner feedback={passwordFeedback} />
        <Button type="submit" disabled={savingPassword} variant="secondary" className="font-semibold text-xs mt-2 flex items-center gap-1.5">
          {savingPassword && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Update Password
        </Button>
      </form>
    </div>
  );
}
