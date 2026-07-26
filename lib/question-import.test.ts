import { describe, it, expect } from "vitest";
import {
  mapImportedRow,
  normalizeAnswerList,
  parseDifficulty,
  parseQuestionType,
} from "./question-import";

describe("normalizeAnswerList", () => {
  it("sorts so answer order in the sheet does not matter", () => {
    expect(normalizeAnswerList("C,A")).toBe("A,C");
  });

  it("tolerates spacing and lowercase", () => {
    expect(normalizeAnswerList(" d , a ")).toBe("A,D");
  });

  it("drops out-of-range letters and blanks", () => {
    expect(normalizeAnswerList("A,,E,B,7")).toBe("A,B");
  });

  it("returns empty string for missing cells", () => {
    expect(normalizeAnswerList(undefined)).toBe("");
    expect(normalizeAnswerList(null)).toBe("");
  });
});

describe("parseDifficulty", () => {
  it("recognises EASY and HARD in any casing", () => {
    expect(parseDifficulty("easy")).toBe("EASY");
    expect(parseDifficulty("  Hard ")).toBe("HARD");
  });

  it("falls back to MEDIUM for blank or unknown values", () => {
    expect(parseDifficulty(undefined)).toBe("MEDIUM");
    expect(parseDifficulty("")).toBe("MEDIUM");
    expect(parseDifficulty("impossible")).toBe("MEDIUM");
  });
});

describe("parseQuestionType", () => {
  it("matches multiple choice however it is written", () => {
    expect(parseQuestionType("MULTIPLE")).toBe("MULTIPLE_CHOICE");
    expect(parseQuestionType("multiple choice")).toBe("MULTIPLE_CHOICE");
    expect(parseQuestionType("Multi")).toBe("MULTIPLE_CHOICE");
  });

  it("matches true/false however it is written", () => {
    expect(parseQuestionType("TRUEFALSE")).toBe("TRUE_FALSE");
    expect(parseQuestionType("true/false")).toBe("TRUE_FALSE");
    expect(parseQuestionType("True False")).toBe("TRUE_FALSE");
  });

  it("defaults to single choice when the column is missing", () => {
    expect(parseQuestionType(undefined)).toBe("SINGLE_CHOICE");
    expect(parseQuestionType("")).toBe("SINGLE_CHOICE");
    expect(parseQuestionType("something else")).toBe("SINGLE_CHOICE");
  });
});

describe("mapImportedRow", () => {
  const base = {
    Question: "  What is 2 + 2?  ",
    "Option A": " 3 ",
    "Option B": " 4 ",
    "Option C": "5",
    "Option D": "6",
    "Correct Answer": "b",
  };

  it("trims text and options and uppercases the answer", () => {
    const row = mapImportedRow(base, "quiz-1");
    expect(row).toMatchObject({
      quizId: "quiz-1",
      type: "SINGLE_CHOICE",
      text: "What is 2 + 2?",
      optionA: "3",
      optionB: "4",
      correctAnswer: "B",
      difficulty: "MEDIUM",
      marks: 1,
    });
  });

  it("forces True/False options and accepts the words as the answer", () => {
    const row = mapImportedRow(
      { ...base, Type: "TRUEFALSE", "Correct Answer": "false" },
      "quiz-1"
    );
    expect(row).toMatchObject({
      type: "TRUE_FALSE",
      optionA: "True",
      optionB: "False",
      optionC: "",
      optionD: "",
      correctAnswer: "B",
    });
  });

  it("also accepts a letter answer for True/False", () => {
    const row = mapImportedRow(
      { ...base, Type: "true/false", "Correct Answer": "A" },
      "quiz-1"
    );
    expect(row.correctAnswer).toBe("A");
  });

  it("normalizes a multiple-choice answer list", () => {
    const row = mapImportedRow(
      { ...base, Type: "MULTIPLE", "Correct Answer": "c,a" },
      "quiz-1"
    );
    expect(row).toMatchObject({ type: "MULTIPLE_CHOICE", correctAnswer: "A,C" });
  });

  it("keeps explanation and category as null when the columns are absent", () => {
    const row = mapImportedRow(base, "quiz-1");
    expect(row.explanation).toBeNull();
    expect(row.categoryName).toBeNull();
  });

  it("trims explanation and category when present", () => {
    const row = mapImportedRow(
      { ...base, Explanation: "  because  ", Category: " Maths " },
      "quiz-1"
    );
    expect(row.explanation).toBe("because");
    expect(row.categoryName).toBe("Maths");
  });

  it("survives a completely empty row instead of throwing", () => {
    const row = mapImportedRow({}, "quiz-1");
    expect(row).toMatchObject({
      text: "",
      optionA: "",
      correctAnswer: "",
      type: "SINGLE_CHOICE",
      difficulty: "MEDIUM",
      explanation: null,
      categoryName: null,
    });
  });

  it("coerces numeric cells that xlsx hands over as numbers", () => {
    const row = mapImportedRow(
      { Question: 42, "Option A": 1, "Option B": 2, "Correct Answer": "A" },
      "quiz-1"
    );
    expect(row.text).toBe("42");
    expect(row.optionA).toBe("1");
  });

  it("drops an invalid multiple-choice answer to empty rather than storing junk", () => {
    const row = mapImportedRow(
      { ...base, Type: "MULTIPLE", "Correct Answer": "X,Y" },
      "quiz-1"
    );
    expect(row.correctAnswer).toBe("");
  });
});
