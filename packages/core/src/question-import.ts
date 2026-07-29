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
  /**
   * विषयाचं **नाव** — हा database चा column नाही.
   *
   * Import करणाऱ्याला `subjectId` माहीत नसतो, तो Excel मध्ये "Indian Polity" असं
   * नाव लिहितो. नाव → id हे रूपांतर import action मध्ये होतं, कारण त्यासाठी
   * database लागतो आणि हे module मुद्दाम database-मुक्त आहे.
   */
  subjectName: string | null;
}

/** `createMany` ला जाणारा आकार — `subjectName` वजा, `subjectId` सह. */
export type QuestionRow = Omit<MappedQuestion, 'subjectName'> & { subjectId: string | null };

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
    subjectName: cleanSubjectName(row.Subject),
  };
}

/**
 * विषयाचं नाव नीट करणे.
 *
 * "  indian   polity " आणि "Indian Polity" हे एकच असले पाहिजेत — नाहीतर
 * database मध्ये दोन विषय बनतात आणि Result मध्ये तोच विषय दोनदा दिसतो. फक्त
 * मधली जास्तीची जागा काढतो; अक्षरांची case जशीच्या तशी ठेवतो कारण "GK" चं
 * "Gk" करणं चुकीचं दिसेल. जुळवणी slug वर होते.
 */
export function cleanSubjectName(raw: unknown): string | null {
  const name = String(raw ?? "").replace(/\s+/g, " ").trim();
  return name.length > 0 ? name : null;
}

/**
 * जुळवणीसाठी key. Case आणि विरामचिन्हांकडे दुर्लक्ष करतो, म्हणजे "Indian Polity",
 * "indian polity" आणि "Indian-Polity" एकाच विषयावर जातात.
 */
export function subjectSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9ऀ-ॿ]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * एका import मधले सगळे वेगळे विषय — नाव आणि slug सह.
 *
 * Import action याने विषय **एकदाच** शोधतो/बनवतो. प्रत्येक ओळीसाठी वेगळी query
 * मारली असती तर 100 प्रश्नांच्या file वर 100 फेऱ्या होतील आणि Supabase च्या
 * अंतरामुळे तेच आधी import तोडून गेलं होतं.
 */
export function collectSubjects(rows: MappedQuestion[]): { name: string; slug: string }[] {
  const bySlug = new Map<string, string>();
  for (const r of rows) {
    if (!r.subjectName) continue;
    const slug = subjectSlug(r.subjectName);
    if (slug && !bySlug.has(slug)) bySlug.set(slug, r.subjectName);
  }
  return [...bySlug].map(([slug, name]) => ({ name, slug }));
}
