import { describe, it, expect } from "vitest";
import { gradeAttempt, normalizeAnswer, type GradableQuestion } from "./grading";

const q = (id: string, correctAnswer: string, marks = 1): GradableQuestion => ({
  id,
  correctAnswer,
  marks,
});

describe("normalizeAnswer", () => {
  it("sorts a multiple-choice selection so click order does not matter", () => {
    expect(normalizeAnswer("C,A")).toBe("A,C");
    expect(normalizeAnswer("A,C")).toBe("A,C");
  });

  it("uppercases and trims", () => {
    expect(normalizeAnswer(" b , a ")).toBe("A,B");
  });

  it("drops anything that is not A-D", () => {
    expect(normalizeAnswer("A,E,9,,B")).toBe("A,B");
  });

  it("returns empty string for null, undefined and junk", () => {
    expect(normalizeAnswer(null)).toBe("");
    expect(normalizeAnswer(undefined)).toBe("");
    expect(normalizeAnswer("zzz")).toBe("");
  });
});

describe("gradeAttempt", () => {
  it("awards each question's own marks rather than assuming 1", () => {
    const result = gradeAttempt(
      [q("1", "A", 2), q("2", "B", 3)],
      [
        { questionId: "1", chosenOption: "A", timeSpent: 5 },
        { questionId: "2", chosenOption: "B", timeSpent: 5 },
      ],
      0,
      5
    );
    expect(result.score).toBe(5);
    expect(result.correctAnswers).toBe(2);
    expect(result.percentage).toBe(100);
  });

  it("applies negative marking to wrong answers only", () => {
    const result = gradeAttempt(
      [q("1", "A"), q("2", "A"), q("3", "A")],
      [
        { questionId: "1", chosenOption: "A", timeSpent: 1 }, // correct  +1
        { questionId: "2", chosenOption: "B", timeSpent: 1 }, // wrong    -0.25
        { questionId: "3", chosenOption: null, timeSpent: 1 }, // skipped  0
      ],
      0.25,
      3
    );
    expect(result.correctAnswers).toBe(1);
    expect(result.wrongAnswers).toBe(1);
    expect(result.skippedQuestions).toBe(1);
    expect(result.score).toBe(0.75);
  });

  it("does not penalise skipped questions", () => {
    const result = gradeAttempt(
      [q("1", "A"), q("2", "A")],
      [{ questionId: "1", chosenOption: null, timeSpent: 0 }],
      1,
      2
    );
    // question 2 has no answer entry at all — also skipped, not wrong
    expect(result.skippedQuestions).toBe(2);
    expect(result.wrongAnswers).toBe(0);
    expect(result.score).toBe(0);
  });

  it("treats an unparseable answer as skipped, not wrong", () => {
    const result = gradeAttempt(
      [q("1", "A")],
      [{ questionId: "1", chosenOption: "E", timeSpent: 1 }],
      1,
      1
    );
    expect(result.skippedQuestions).toBe(1);
    expect(result.wrongAnswers).toBe(0);
    expect(result.score).toBe(0);
  });

  it("marks a multiple-choice answer correct regardless of order", () => {
    const result = gradeAttempt(
      [q("1", "A,C")],
      [{ questionId: "1", chosenOption: "C,A", timeSpent: 1 }],
      0,
      1
    );
    expect(result.correctAnswers).toBe(1);
    expect(result.responses[0].chosenOption).toBe("A,C");
  });

  it("counts a partial multiple-choice selection as wrong", () => {
    const result = gradeAttempt(
      [q("1", "A,C")],
      [{ questionId: "1", chosenOption: "A", timeSpent: 1 }],
      0.25,
      1
    );
    expect(result.wrongAnswers).toBe(1);
    expect(result.score).toBe(-0.25);
  });

  it("allows the total score to go negative", () => {
    const result = gradeAttempt(
      [q("1", "A"), q("2", "A")],
      [
        { questionId: "1", chosenOption: "B", timeSpent: 1 },
        { questionId: "2", chosenOption: "C", timeSpent: 1 },
      ],
      1,
      2
    );
    expect(result.score).toBe(-2);
    expect(result.percentage).toBe(-100);
  });

  it("rounds score and percentage to two decimals", () => {
    const result = gradeAttempt(
      [q("1", "A"), q("2", "A"), q("3", "A")],
      [
        { questionId: "1", chosenOption: "B", timeSpent: 1 },
        { questionId: "2", chosenOption: "B", timeSpent: 1 },
        { questionId: "3", chosenOption: "B", timeSpent: 1 },
      ],
      0.33,
      3
    );
    expect(result.score).toBe(-0.99);
    expect(result.percentage).toBe(-33);
  });

  it("returns 0% instead of Infinity when the quiz has no total marks", () => {
    const result = gradeAttempt(
      [q("1", "A")],
      [{ questionId: "1", chosenOption: "A", timeSpent: 1 }],
      0,
      0
    );
    expect(result.percentage).toBe(0);
    expect(Number.isFinite(result.percentage)).toBe(true);
  });

  it("emits one response per question, in question order", () => {
    const result = gradeAttempt(
      [q("1", "A"), q("2", "B"), q("3", "C")],
      [{ questionId: "2", chosenOption: "B", timeSpent: 9 }],
      0,
      3
    );
    expect(result.responses.map((r) => r.questionId)).toEqual(["1", "2", "3"]);
    expect(result.responses[1]).toMatchObject({ isCorrect: true, timeSpent: 9 });
  });

  it("ignores answers for questions that are not in the quiz", () => {
    const result = gradeAttempt(
      [q("1", "A")],
      [
        { questionId: "1", chosenOption: "A", timeSpent: 1 },
        { questionId: "ghost", chosenOption: "A", timeSpent: 1 },
      ],
      0,
      1
    );
    expect(result.responses).toHaveLength(1);
    expect(result.correctAnswers).toBe(1);
  });

  it("handles an empty quiz without dividing by zero", () => {
    const result = gradeAttempt([], [], 1, 0);
    expect(result).toMatchObject({
      correctAnswers: 0,
      wrongAnswers: 0,
      skippedQuestions: 0,
      score: 0,
      percentage: 0,
    });
  });
});
