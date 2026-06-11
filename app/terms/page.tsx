import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | QuizPlatform Pro",
  description: "Terms and conditions for using the QuizPlatform Pro mock test and quiz platform.",
  alternates: { canonical: "/terms" },
};

const sections = [
  {
    h: "1. Acceptance of Terms",
    p: "By creating an account or using QuizPlatform Pro, you agree to these Terms of Service. If you do not agree, please discontinue use of the platform.",
  },
  {
    h: "2. Accounts & Eligibility",
    p: "You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account. Provide accurate registration information and keep it up to date.",
  },
  {
    h: "3. Acceptable Use",
    p: "You agree not to misuse the platform — including attempting to manipulate scores or leaderboards, sharing answers during live tests, scraping content, reverse-engineering, or disrupting service availability. Violations may result in account suspension or termination.",
  },
  {
    h: "4. Content & Intellectual Property",
    p: "All questions, explanations, analytics, and platform design are the intellectual property of QuizPlatform Pro or its content partners. You may not reproduce or redistribute test content without written permission.",
  },
  {
    h: "5. Scores, Ranks & Certificates",
    p: "Scores, ranks, percentiles, and certificates are generated automatically from your attempt data. They are provided for self-assessment and motivation; they do not constitute an official qualification.",
  },
  {
    h: "6. Service Availability",
    p: "We aim for high availability but do not guarantee uninterrupted service. Features may be added, modified, or removed at any time as the platform evolves.",
  },
  {
    h: "7. Limitation of Liability",
    p: "QuizPlatform Pro is provided on an 'as is' basis. To the maximum extent permitted by law, we are not liable for indirect or consequential damages arising from use of the platform, including reliance on practice results for actual examinations.",
  },
  {
    h: "8. Changes to These Terms",
    p: "We may update these terms periodically. Continued use after changes take effect constitutes acceptance of the revised terms.",
  },
  {
    h: "9. Contact",
    p: "Questions about these terms can be sent to the platform administrators via the contact details published on the website.",
  },
];

export default function TermsPage() {
  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">Terms of Service</h1>
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
