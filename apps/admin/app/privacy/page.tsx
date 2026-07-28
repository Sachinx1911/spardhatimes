import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Spardha Times",
  description: "How Spardha Times collects, uses, and protects your personal data.",
  alternates: { canonical: "/privacy" },
};

const sections = [
  {
    h: "1. Information We Collect",
    p: "When you register we collect your name, email address, and a securely hashed password. As you use the platform we store your quiz attempts, answers, scores, bookmarks, certificates, and notification history so we can power your dashboard and analytics.",
  },
  {
    h: "2. How We Use Your Data",
    p: "Your data is used to grade attempts, compute ranks and percentiles, generate certificates, personalize your dashboard, and send in-app notifications about tests and results. We do not sell your personal data to third parties.",
  },
  {
    h: "3. Passwords & Security",
    p: "Passwords are stored only as bcrypt hashes — we never store or transmit your plain-text password. Access to admin functionality is restricted by role-based access control, and administrative actions are logged.",
  },
  {
    h: "4. Cookies & Sessions",
    p: "We use session cookies strictly for authentication (keeping you signed in). We also use browser localStorage to auto-save in-progress test answers on your device so you can recover from connection drops.",
  },
  {
    h: "5. Leaderboards & Public Display",
    p: "If you appear on a leaderboard or top-performers list, only your display name, score, and accuracy are shown. Your email address is never displayed publicly.",
  },
  {
    h: "6. Data Retention & Deletion",
    p: "Your attempt history is retained to power long-term analytics. You may request deletion of your account, which permanently removes your profile, attempts, bookmarks, certificates, and notifications.",
  },
  {
    h: "7. Children's Privacy",
    p: "The platform is intended for exam aspirants. If you believe a child has registered without appropriate consent, contact us and we will remove the account.",
  },
  {
    h: "8. Changes to This Policy",
    p: "We may update this policy as the platform evolves. Material changes will be announced via in-app notification.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">Privacy Policy</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: 11 June 2026</p>

        <div className="mt-10 space-y-8 bg-white dark:bg-slate-900 border border-border rounded-lg p-8">
          {sections.map((s) => (
            <section key={s.h}>
              <h2 className="font-bold text-base text-foreground">{s.h}</h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.p}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
