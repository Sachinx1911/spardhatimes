// The database half of lib/entitlements.ts: it says what to load so the pure rules
// can be applied, and turns a refusal into something a student can read.
//
// Both callers (the attempt page and submitQuizAttempt) already fetch the quiz for
// their own reasons, so instead of doing a second lookup they widen that one query
// with `attemptAccessInclude` and hand the result to `decideAttemptAccess`. Supabase
// is ~170ms away — an extra round trip on every submit is worth avoiding.

import { evaluateAttemptAccess, type AccessDecision, type AccessReason, type TimingMode } from "./entitlements";

/**
 * Include fragment that loads everything the access rules need: the series' publish
 * state and timing mode, plus this user's access row (if any).
 */
export const attemptAccessInclude = (userId: string) =>
  ({
    testSeries: {
      select: {
        published: true,
        timingMode: true,
        access: { where: { userId }, select: { id: true, expiresAt: true } },
      },
    },
  }) as const;

/** A quiz loaded with `attemptAccessInclude`. */
export interface QuizWithAccess {
  status: "DRAFT" | "PUBLISHED";
  releaseAt: Date | null;
  closeAt: Date | null;
  testSeries: {
    published: boolean;
    timingMode: TimingMode;
    access: { id: string; expiresAt: Date | null }[];
  } | null;
}

/** Apply the access rules to an already-loaded quiz. */
export function decideAttemptAccess(
  quiz: QuizWithAccess | null | undefined,
  role: string | null | undefined
): AccessDecision {
  return evaluateAttemptAccess({
    quiz: quiz
      ? {
          status: quiz.status,
          releaseAt: quiz.releaseAt,
          closeAt: quiz.closeAt,
          testSeries: quiz.testSeries
            ? {
                published: quiz.testSeries.published,
                timingMode: quiz.testSeries.timingMode,
              }
            : null,
        }
      : null,
    hasAccess: (quiz?.testSeries?.access.length ?? 0) > 0,
    // प्रत्येक विद्यार्थ्याला एका series ला एकच access row असते
    // (`@@unique([userId, testSeriesId])`), म्हणून पहिलीच तीच.
    accessExpiresAt: quiz?.testSeries?.access[0]?.expiresAt ?? null,
    role: role ?? null,
  });
}

/**
 * Student-facing explanation for a refusal. A quiz that does not exist, one that is
 * still a draft and one that was never assigned all give the same answer on purpose:
 * whether a test exists is not something an unassigned student needs to learn.
 */
export function messageForReason(reason: AccessReason): string {
  switch (reason) {
    case "NOT_LOGGED_IN":
      return "You must be logged in to attempt tests.";
    case "NOT_RELEASED":
      return "This test hasn't been unlocked yet. Check back at its scheduled release time.";
    case "CLOSED":
      return "This test is now closed and can no longer be attempted.";
    // मुदत संपली हे स्पष्ट सांगायचं — विद्यार्थ्याने पैसे भरलेले आहेत, त्याला
    // "तुम्हाला ही series दिलेली नाही" सांगणं चुकीचं आणि गोंधळात टाकणारं आहे.
    case "EXPIRED":
      return "Your access to this test series has expired. Renew it to continue.";
    default:
      return "This test is part of a series that hasn't been assigned to your account.";
  }
}
