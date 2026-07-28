// Pure grading logic, extracted from the submitQuizAttempt server action so it
// can be unit tested. This decides every student's marks — negative marking,
// skipped questions and percentage all come from here — so it is the one piece
// of the codebase that most needs tests around it.
//
// Deliberately free of Prisma and session access: it takes plain data in and
// returns plain data out.

export interface GradableQuestion {
  id: string;
  correctAnswer: string;
  marks: number;
}

export interface SubmittedAnswer {
  questionId: string;
  chosenOption: string | null; // "A".."D", a comma list for multiple choice, or null
  timeSpent: number; // seconds
}

export interface GradedResponse {
  questionId: string;
  chosenOption: string | null;
  isCorrect: boolean;
  timeSpent: number;
}

export interface GradedAttempt {
  correctAnswers: number;
  wrongAnswers: number;
  skippedQuestions: number;
  score: number;
  percentage: number;
  responses: GradedResponse[];
}

/**
 * Normalize an answer to a canonical sorted comma list ("C,A" -> "A,C") so a
 * multiple-choice selection compares equal regardless of click order. Anything
 * that is not A-D is dropped, so junk input becomes "" (treated as skipped).
 */
export function normalizeAnswer(answer: string | null | undefined): string {
  return String(answer ?? "")
    .toUpperCase()
    .split(",")
    .map((s) => s.trim())
    .filter((s) => ["A", "B", "C", "D"].includes(s))
    .sort()
    .join(",");
}

/**
 * Grade a submitted attempt.
 *
 * A question with no answer (or an unparseable one) counts as skipped and is
 * neither rewarded nor penalised. A wrong answer costs `negativeMarks`. The
 * score is allowed to go negative — that matches how competitive exams score,
 * and the UI is responsible for how it presents that.
 */
export function gradeAttempt(
  questions: GradableQuestion[],
  answers: SubmittedAnswer[],
  negativeMarks: number,
  totalMarks: number
): GradedAttempt {
  let correctAnswers = 0;
  let wrongAnswers = 0;
  let skippedQuestions = 0;
  let score = 0;
  const responses: GradedResponse[] = [];

  for (const question of questions) {
    const answer = answers.find((a) => a.questionId === question.id);
    const timeSpent = answer?.timeSpent || 0;
    const normalizedChosen = normalizeAnswer(answer?.chosenOption);

    if (!normalizedChosen) {
      skippedQuestions++;
      responses.push({
        questionId: question.id,
        chosenOption: null,
        isCorrect: false,
        timeSpent,
      });
      continue;
    }

    const isCorrect = normalizedChosen === normalizeAnswer(question.correctAnswer);
    if (isCorrect) {
      correctAnswers++;
      score += question.marks;
    } else {
      wrongAnswers++;
      score -= negativeMarks;
    }

    responses.push({
      questionId: question.id,
      chosenOption: normalizedChosen,
      isCorrect,
      timeSpent,
    });
  }

  score = Math.round(score * 100) / 100;

  // Guard against a quiz configured with 0 total marks, which would otherwise
  // yield Infinity or NaN and poison the stored result and every average.
  const percentage =
    totalMarks > 0 ? Math.round((score / totalMarks) * 100 * 100) / 100 : 0;

  return {
    correctAnswers,
    wrongAnswers,
    skippedQuestions,
    score,
    percentage,
    responses,
  };
}
