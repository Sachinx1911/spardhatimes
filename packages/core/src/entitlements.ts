// Who is allowed to attempt a given test.
//
// Every entry point that can produce a graded attempt asks this module the same
// question, so the answer cannot drift between the page that renders the test and
// the server action that grades it. Before this existed, submitQuizAttempt checked
// only that a session was present — any logged-in student could post an arbitrary
// quizId and get back a score, a rank and a certificate for a series that was never
// assigned to them. Once test series are sold, that is a revenue leak, so the
// decision lives in one tested place.
//
// Deliberately free of Prisma and session access, in the same spirit as
// lib/grading.ts: plain data in, plain data out. The database lookup that feeds it
// lives in lib/quiz-access.ts.

/** Series timing mode, mirrored from the Prisma enum to keep this module import-free. */
export type TimingMode = "RELEASE_ONLY" | "WINDOW";

/** Derived availability state of a series test for a student, given now. */
export type TestState = "UPCOMING" | "OPEN" | "CLOSED";

export function testState(
  quiz: { releaseAt: Date | null; closeAt: Date | null },
  timingMode: TimingMode,
  now: Date = new Date()
): TestState {
  if (quiz.releaseAt && quiz.releaseAt > now) return "UPCOMING";
  if (timingMode === "WINDOW" && quiz.closeAt && quiz.closeAt <= now) return "CLOSED";
  return "OPEN";
}

/**
 * Why an attempt was refused. `NO_ACCESS` means there is no TestSeriesAccess row —
 * today that row is created by an admin assigning the series, and later it will also
 * be created by a purchase, so one reason covers both.
 */
export type AccessReason =
  | "OK"
  | "NOT_LOGGED_IN"
  | "NOT_FOUND"
  | "DRAFT"
  | "NO_ACCESS"
  | "EXPIRED"
  | "NOT_RELEASED"
  | "CLOSED";

export interface AttemptableQuiz {
  status: "DRAFT" | "PUBLISHED";
  releaseAt: Date | null;
  closeAt: Date | null;
  /** null for a standalone quiz that belongs to no series. */
  testSeries: { published: boolean; timingMode: TimingMode } | null;
}

export interface AttemptContext {
  /** null when no quiz matched the id/slug. */
  quiz: AttemptableQuiz | null;
  /** Whether a TestSeriesAccess row exists for this user and the quiz's series. */
  hasAccess: boolean;
  /**
   * त्या access ची मुदत कधी संपते. **null = कायमस्वरूपी** — admin ने हाताने
   * दिलेला access असाच असतो. `hasAccess` false असेल तर याला अर्थ नाही.
   */
  accessExpiresAt?: Date | null;
  /** The viewer's role, or null when nobody is logged in. */
  role: string | null;
}

export interface AccessDecision {
  allowed: boolean;
  reason: AccessReason;
}

const ALLOWED: AccessDecision = { allowed: true, reason: "OK" };

const deny = (reason: AccessReason): AccessDecision => ({ allowed: false, reason });

/**
 * Decide whether the viewer may attempt this quiz.
 *
 * Admins bypass every check so they can preview drafts and unreleased tests, which
 * is how the attempt page has always behaved. Standalone quizzes (no series) stay
 * open to any logged-in student — only the DRAFT check is new for them.
 */
export function evaluateAttemptAccess(
  ctx: AttemptContext,
  now: Date = new Date()
): AccessDecision {
  if (!ctx.role) return deny("NOT_LOGGED_IN");
  if (!ctx.quiz) return deny("NOT_FOUND");

  if (ctx.role === "ADMIN" || ctx.role === "SUPERADMIN") return ALLOWED;

  if (ctx.quiz.status !== "PUBLISHED") return deny("DRAFT");

  const series = ctx.quiz.testSeries;
  if (!series) return ALLOWED;

  // An unpublished series is indistinguishable from one you were never given.
  if (!series.published || !ctx.hasAccess) return deny("NO_ACCESS");

  // मुदत NO_ACCESS **नंतर** तपासतो — आधी तपासली असती तर series कधी संपते हे
  // ती न घेतलेल्यालाही कळलं असतं. सीमेवर उदार नाही: नेमक्या क्षणी संपलेली धरतो,
  // नाहीतर "मुदत संपली" कधीच खरं होत नाही.
  const expiresAt = ctx.accessExpiresAt;
  if (expiresAt && expiresAt <= now) return deny("EXPIRED");

  const state = testState(ctx.quiz, series.timingMode, now);
  if (state === "UPCOMING") return deny("NOT_RELEASED");
  if (state === "CLOSED") return deny("CLOSED");

  return ALLOWED;
}
