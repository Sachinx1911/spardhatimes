// Pure parsing of one spreadsheet row into a Question row, extracted from the
// bulkImportQuestions server action so it can be unit tested. Admins paste
// arbitrary Excel files through this, so every column is treated as untrusted:
// missing, blank, wrongly-cased and misspelled values all have to land somewhere
// sensible rather than throwing mid-import.
import { Difficulty, QuestionType } from "@prisma/client";

/** A single row as xlsx hands it over — header text to cell value. */
export type ImportedRow = Record<string, unknown>;

export interface MappedQuestion {
  quizId: string;
  type: QuestionType;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string | null;
  difficulty: Difficulty;
  marks: number;
  categoryName: string | null;
}

/**
 * Normalize a correct-answer cell to a canonical sorted comma list
 * ("C,A" -> "A,C"). Anything outside A-D is dropped, so junk becomes "".
 */
export function normalizeAnswerList(answer: unknown): string {
  return String(answer ?? "")
    .toUpperCase()
    .split(",")
    .map((s) => s.trim())
    .filter((s) => ["A", "B", "C", "D"].includes(s))
    .sort()
    .join(",");
}

/** EASY / HARD are recognised; everything else (including blank) is MEDIUM. */
export function parseDifficulty(raw: unknown): Difficulty {
  const value = String(raw ?? "").toUpperCase().trim();
  if (value === "EASY") return Difficulty.EASY;
  if (value === "HARD") return Difficulty.HARD;
  return Difficulty.MEDIUM;
}

/**
 * Optional Type column. Matched on a prefix after stripping non-letters, so
 * "multiple choice", "MULTI" and "true/false" all resolve. Blank or unknown
 * falls back to single choice, which is by far the common case.
 */
export function parseQuestionType(raw: unknown): QuestionType {
  const value = String(raw ?? "").toUpperCase().replace(/[^A-Z]/g, "");
  if (value.startsWith("MULTI")) return QuestionType.MULTIPLE_CHOICE;
  if (value.startsWith("TRUE")) return QuestionType.TRUE_FALSE;
  return QuestionType.SINGLE_CHOICE;
}

/**
 * Map one spreadsheet row to a Question row for `createMany`.
 *
 * True/false questions get their options forced to True/False and accept either
 * a letter ("A"/"B") or the words TRUE/FALSE as the answer, because admins write
 * both. Multiple choice normalizes the answer list; single choice keeps the
 * letter as typed (uppercased).
 */
export function mapImportedRow(row: ImportedRow, quizId: string): MappedQuestion {
  const type = parseQuestionType(row.Type);
  const rawAnswer = String(row["Correct Answer"] ?? "").toUpperCase().trim();

  let correctAnswer = rawAnswer;
  let optionA = String(row["Option A"] ?? "").trim();
  let optionB = String(row["Option B"] ?? "").trim();
  let optionC = String(row["Option C"] ?? "").trim();
  let optionD = String(row["Option D"] ?? "").trim();

  if (type === QuestionType.TRUE_FALSE) {
    optionA = "True";
    optionB = "False";
    optionC = "";
    optionD = "";
    correctAnswer =
      rawAnswer === "TRUE" ? "A" : rawAnswer === "FALSE" ? "B" : rawAnswer;
  } else if (type === QuestionType.MULTIPLE_CHOICE) {
    correctAnswer = normalizeAnswerList(rawAnswer);
  }

  return {
    quizId,
    type,
    text: String(row.Question ?? "").trim(),
    optionA,
    optionB,
    optionC,
    optionD,
    correctAnswer,
    explanation: row.Explanation ? String(row.Explanation).trim() : null,
    difficulty: parseDifficulty(row.Difficulty),
    marks: 1.0,
    categoryName: row.Category ? String(row.Category).trim() : null,
  };
}
