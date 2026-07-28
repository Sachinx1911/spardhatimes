import { describe, it, expect } from "vitest";
import {
  evaluateAttemptAccess,
  testState,
  type AttemptContext,
  type AttemptableQuiz,
  type TimingMode,
} from "./entitlements";

const NOW = new Date("2026-07-28T12:00:00Z");
const HOUR = 60 * 60 * 1000;
const before = (ms: number) => new Date(NOW.getTime() - ms);
const after = (ms: number) => new Date(NOW.getTime() + ms);

/** A published series quiz that is currently open, unless overridden. */
const quiz = (over: Partial<AttemptableQuiz> = {}): AttemptableQuiz => ({
  status: "PUBLISHED",
  releaseAt: before(HOUR),
  closeAt: after(HOUR),
  testSeries: { published: true, timingMode: "RELEASE_ONLY" },
  ...over,
});

/** A student who has been given the series. */
const ctx = (over: Partial<AttemptContext> = {}): AttemptContext => ({
  quiz: quiz(),
  hasAccess: true,
  role: "STUDENT",
  ...over,
});

describe("testState", () => {
  it("is UPCOMING before releaseAt", () => {
    expect(testState({ releaseAt: after(HOUR), closeAt: null }, "RELEASE_ONLY", NOW)).toBe(
      "UPCOMING"
    );
  });

  it("is OPEN once releaseAt has passed", () => {
    expect(testState({ releaseAt: before(HOUR), closeAt: null }, "RELEASE_ONLY", NOW)).toBe(
      "OPEN"
    );
  });

  it("ignores closeAt in RELEASE_ONLY mode", () => {
    // A RELEASE_ONLY series stays open forever, even with a closeAt left on the row.
    expect(
      testState({ releaseAt: before(2 * HOUR), closeAt: before(HOUR) }, "RELEASE_ONLY", NOW)
    ).toBe("OPEN");
  });

  it("is CLOSED past closeAt in WINDOW mode", () => {
    expect(
      testState({ releaseAt: before(2 * HOUR), closeAt: before(HOUR) }, "WINDOW", NOW)
    ).toBe("CLOSED");
  });

  it("is OPEN with no schedule at all", () => {
    expect(testState({ releaseAt: null, closeAt: null }, "WINDOW", NOW)).toBe("OPEN");
  });
});

describe("evaluateAttemptAccess", () => {
  it("allows a student who has the series and whose test is open", () => {
    expect(evaluateAttemptAccess(ctx(), NOW)).toEqual({ allowed: true, reason: "OK" });
  });

  it("refuses anonymous visitors", () => {
    expect(evaluateAttemptAccess(ctx({ role: null }), NOW)).toEqual({
      allowed: false,
      reason: "NOT_LOGGED_IN",
    });
  });

  it("refuses a quiz that does not exist", () => {
    expect(evaluateAttemptAccess(ctx({ quiz: null }), NOW)).toEqual({
      allowed: false,
      reason: "NOT_FOUND",
    });
  });

  // The hole this module was written to close: posting a quizId from a series you
  // were never assigned used to be graded like any other attempt.
  it("refuses a series the student was never given", () => {
    expect(evaluateAttemptAccess(ctx({ hasAccess: false }), NOW)).toEqual({
      allowed: false,
      reason: "NO_ACCESS",
    });
  });

  it("refuses a series that is not published, even with an access row", () => {
    const q = quiz({ testSeries: { published: false, timingMode: "RELEASE_ONLY" } });
    expect(evaluateAttemptAccess(ctx({ quiz: q }), NOW).reason).toBe("NO_ACCESS");
  });

  it("refuses a DRAFT quiz", () => {
    expect(evaluateAttemptAccess(ctx({ quiz: quiz({ status: "DRAFT" }) }), NOW)).toEqual({
      allowed: false,
      reason: "DRAFT",
    });
  });

  it("refuses a DRAFT standalone quiz too", () => {
    const q = quiz({ status: "DRAFT", testSeries: null });
    expect(evaluateAttemptAccess(ctx({ quiz: q, hasAccess: false }), NOW).reason).toBe(
      "DRAFT"
    );
  });

  it("allows a published standalone quiz for any logged-in student", () => {
    const q = quiz({ testSeries: null, releaseAt: null, closeAt: null });
    expect(evaluateAttemptAccess(ctx({ quiz: q, hasAccess: false }), NOW).allowed).toBe(
      true
    );
  });

  it("refuses a test whose release time has not arrived", () => {
    const q = quiz({ releaseAt: after(HOUR) });
    expect(evaluateAttemptAccess(ctx({ quiz: q }), NOW)).toEqual({
      allowed: false,
      reason: "NOT_RELEASED",
    });
  });

  it("refuses a WINDOW test that has closed", () => {
    const q = quiz({
      closeAt: before(HOUR),
      testSeries: { published: true, timingMode: "WINDOW" },
    });
    expect(evaluateAttemptAccess(ctx({ quiz: q }), NOW)).toEqual({
      allowed: false,
      reason: "CLOSED",
    });
  });

  it("keeps a RELEASE_ONLY test open past its closeAt", () => {
    const q = quiz({ closeAt: before(HOUR) });
    expect(evaluateAttemptAccess(ctx({ quiz: q }), NOW).allowed).toBe(true);
  });

  it("checks access before the schedule, so an unreleased test is not a hint", () => {
    // Someone without the series should not learn when the test unlocks.
    const q = quiz({ releaseAt: after(HOUR) });
    expect(evaluateAttemptAccess(ctx({ quiz: q, hasAccess: false }), NOW).reason).toBe(
      "NO_ACCESS"
    );
  });

  describe("admins bypass every refusal", () => {
    const denials: [string, Partial<AttemptContext>][] = [
      ["a series they were not assigned", { hasAccess: false }],
      ["a DRAFT quiz", { quiz: quiz({ status: "DRAFT" }), hasAccess: false }],
      ["an unreleased test", { quiz: quiz({ releaseAt: after(HOUR) }) }],
      [
        "a closed window",
        {
          quiz: quiz({
            closeAt: before(HOUR),
            testSeries: { published: true, timingMode: "WINDOW" },
          }),
        },
      ],
      [
        "an unpublished series",
        { quiz: quiz({ testSeries: { published: false, timingMode: "RELEASE_ONLY" } }) },
      ],
    ];

    for (const role of ["ADMIN", "SUPERADMIN"]) {
      for (const [label, over] of denials) {
        it(`${role} may open ${label}`, () => {
          expect(evaluateAttemptAccess(ctx({ ...over, role }), NOW).allowed).toBe(true);
        });
      }
    }

    it("but a missing quiz is still not found", () => {
      expect(evaluateAttemptAccess(ctx({ quiz: null, role: "ADMIN" }), NOW).reason).toBe(
        "NOT_FOUND"
      );
    });
  });

  it("defaults now to the current time", () => {
    const q = quiz({ releaseAt: new Date(Date.now() + HOUR) });
    expect(evaluateAttemptAccess(ctx({ quiz: q })).reason).toBe("NOT_RELEASED");
  });

  it("covers both timing modes for an open test", () => {
    for (const timingMode of ["RELEASE_ONLY", "WINDOW"] as TimingMode[]) {
      const q = quiz({ testSeries: { published: true, timingMode } });
      expect(evaluateAttemptAccess(ctx({ quiz: q }), NOW).allowed).toBe(true);
    }
  });
});
