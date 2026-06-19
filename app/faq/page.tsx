import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { HelpCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | QuizPlatform Pro",
  description:
    "Answers to common questions about mock tests, scoring, negative marking, ranks, percentiles, certificates, and the QuizPlatform Pro PWA app.",
  alternates: { canonical: "/faq" },
};

const faqs = [
  {
    q: "Are these mock tests free?",
    a: "Yes, we offer a wide variety of free mock tests. Some advanced, premium test series designed by top instructors are paid, which you can unlock anytime.",
  },
  {
    q: "Can I attempt a quiz multiple times?",
    a: "Absolutely! You can re-attempt any quiz to improve your score and speed. Your attempt history will show your growth chart over time.",
  },
  {
    q: "How is the rank and percentile calculated?",
    a: "Ranks are calculated dynamically based on user scores. Percentiles compare your score against all other students who attempted the same test.",
  },
  {
    q: "Do you support negative markings?",
    a: "Yes. To simulate real competitive exams, admins can configure custom positive and negative markings per question or per test.",
  },
  {
    q: "How do I earn a certificate?",
    a: "Score at or above the passing marks of any published mock test and a verified certificate is generated automatically. Download it anytime from your dashboard's Certificates tab.",
  },
  {
    q: "What happens if my internet disconnects during a test?",
    a: "Your answers are auto-saved locally as you select options. Reload the page and your progress is restored so you can continue from where you left off.",
  },
  {
    q: "Can I review my mistakes after a test?",
    a: "Yes. Every result page includes a full question review with your chosen answer, the correct answer, and a detailed explanation for self-correction.",
  },
  {
    q: "Can I install QuizPlatform as a mobile app?",
    a: "Yes! QuizPlatform is a PWA — open the site in your mobile browser and choose 'Add to Home Screen' to install it like a native app with offline support.",
  },
];

export default function FAQPage() {
  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Frequently Asked Questions
          </h1>
          <p className="mt-3 text-muted-foreground text-sm max-w-xl mx-auto">
            Everything you need to know about mock exams, analytics, scoring, and certificates.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <details
              key={i}
              className="group bg-white dark:bg-slate-900 border border-border rounded-lg open:shadow-md transition-shadow"
            >
              <summary className="flex items-center gap-3 cursor-pointer list-none p-5 font-bold text-sm sm:text-base text-foreground">
                <HelpCircle className="h-5 w-5 text-primary shrink-0" />
                <span className="flex-1">{faq.q}</span>
                <span className="text-muted-foreground transition-transform group-open:rotate-90">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </summary>
              <p className="px-5 pb-5 pl-[52px] text-sm text-muted-foreground leading-relaxed">
                {faq.a}
              </p>
            </details>
          ))}
        </div>

        <div className="mt-12 text-center bg-white dark:bg-slate-900 border border-border rounded-lg p-8">
          <h2 className="font-bold text-lg text-foreground">Still have questions?</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Sign in to open the test series assigned to you by your institute.
          </p>
          <Link href="/dashboard" className="inline-block mt-5">
            <Button className="font-semibold flex items-center gap-1.5">
              Go to My Dashboard <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
