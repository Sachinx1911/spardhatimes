"use client";

import React, { useState } from "react";
import { updateProfile, changePassword } from "@/app/actions/auth";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { CheckCircle2, AlertCircle, Loader2, User, Mail, Phone, Shield, CalendarDays } from "lucide-react";

interface SettingsFormProps {
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  joinedAt?: string | Date | null;
}

type Feedback = { type: "success" | "error"; message: string } | null;

export function SettingsForm({ name, email, role, phone, joinedAt }: SettingsFormProps) {
  const [profileFeedback, setProfileFeedback] = useState<Feedback>(null);
  const [passwordFeedback, setPasswordFeedback] = useState<Feedback>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  // Local copies so the profile card refreshes immediately after saving.
  const [currentName, setCurrentName] = useState(name);
  const [currentPhone, setCurrentPhone] = useState(phone || "");

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
      setCurrentName(String(formData.get("name") || ""));
      setCurrentPhone(String(formData.get("phone") || ""));
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
    <div className="space-y-8">
      {/* Profile summary card */}
      <div className="rounded-lg border border-border/40 bg-slate-50 dark:bg-slate-950 p-5 flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="h-16 w-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-extrabold shrink-0">
          {(currentName || email).charAt(0).toUpperCase()}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5 text-sm min-w-0">
          <p className="font-extrabold text-lg text-foreground flex items-center gap-2 sm:col-span-2">
            {currentName || "Student"}
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/40 text-primary uppercase tracking-wide flex items-center gap-1">
              <Shield className="h-3 w-3" /> {role}
            </span>
          </p>
          <span className="flex items-center gap-1.5 text-muted-foreground truncate">
            <Mail className="h-3.5 w-3.5 text-primary shrink-0" /> {email}
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
            {currentPhone || <em className="not-italic text-muted-foreground/60">Mobile number not added</em>}
          </span>
          {joinedAt && (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5 text-primary shrink-0" />
              Joined {new Date(joinedAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile */}
        <form className="space-y-4 max-w-md" onSubmit={handleProfile}>
          <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
            <User className="h-4 w-4 text-primary" /> Profile Details
          </h4>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">User Name</label>
            <Input type="text" name="name" defaultValue={name} placeholder="Display name" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mobile Number</label>
            <Input type="tel" name="phone" defaultValue={phone || ""} placeholder="e.g. +919876543210" />
            <p className="text-[10px] text-muted-foreground">10-15 digits; +country code optional.</p>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address (Read-only)</label>
            <Input type="email" value={email} disabled className="bg-slate-100 dark:bg-slate-800 text-muted-foreground" />
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
    </div>
  );
}
