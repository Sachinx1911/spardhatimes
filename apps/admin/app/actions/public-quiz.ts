"use server";

import { db } from "@mahatest/db";
import { AttemptStatus } from "@mahatest/db";

interface AnswerInput {
  questionId: string;
  chosenOption: string | null;
  timeSpent: number;
}

function normalizeAnswer(answer: string): string {
  return answer
    .toUpperCase()
    .split(",")
    .map((s) => s.trim())
    .filter((s) => ["A", "B", "C", "D"].includes(s))
    .sort()
    .join(",");
}

export async function submitPublicQuizAttempt(
  quizId: string,
  guestId: string,
  answers: AnswerInput[],
  timeTakenSeconds: number
) {
  try {
    const quiz = await db.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    });

    // This route grades attempts with no login at all, so the quiz has to clear
    // every bar: explicitly public, published, and not part of a series. Without
    // the last condition an admin flipping isPublic on a series test would hand it
    // to the whole internet.
    if (!quiz || !quiz.isPublic || quiz.status !== "PUBLISHED" || quiz.testSeriesId) {
      return { error: "Test not found or not available." };
    }

    let correctAnswersCount = 0;
    let wrongAnswersCount = 0;
    let skippedQuestionsCount = 0;
    let computedScore = 0.0;

    const questionResponsesData: {
      questionId: string;
      chosenOption: string | null;
      isCorrect: boolean;
      timeSpent: number;
    }[] = [];

    for (const question of quiz.questions) {
      const answer = answers.find((a) => a.questionId === question.id);
      const chosenOption = answer?.chosenOption || null;
      const timeSpent = answer?.timeSpent || 0;
      const normalizedChosen = chosenOption ? normalizeAnswer(chosenOption) : "";

      if (!normalizedChosen) {
        skippedQuestionsCount++;
        questionResponsesData.push({
          questionId: question.id,
          chosenOption: null,
          isCorrect: false,
          timeSpent,
        });
      } else {
        const isCorrect =
          normalizedChosen === normalizeAnswer(question.correctAnswer);
        if (isCorrect) {
          correctAnswersCount++;
          computedScore += question.marks;
        } else {
          wrongAnswersCount++;
          computedScore -= quiz.negativeMarks;
        }
        questionResponsesData.push({
          questionId: question.id,
          chosenOption: normalizedChosen,
          isCorrect,
          timeSpent,
        });
      }
    }

    computedScore = Math.round(computedScore * 100) / 100;
    const totalMarks = quiz.marks;
    const percentage =
      Math.round(((computedScore / totalMarks) * 100) * 100) / 100;

    const attempt = await db.$transaction(
      async (tx) => {
        const newAttempt = await tx.quizAttempt.create({
          data: {
            quizId,
            guestId,
            score: computedScore,
            percentage,
            correctAnswers: correctAnswersCount,
            wrongAnswers: wrongAnswersCount,
            skippedQuestions: skippedQuestionsCount,
            timeTaken: timeTakenSeconds,
            status: AttemptStatus.COMPLETED,
          },
        });

        if (questionResponsesData.length > 0) {
          await tx.questionResponse.createMany({
            data: questionResponsesData.map((r) => ({
              attemptId: newAttempt.id,
              questionId: r.questionId,
              chosenOption: r.chosenOption,
              isCorrect: r.isCorrect,
              timeSpent: r.timeSpent,
            })),
          });
        }

        return newAttempt;
      },
      { timeout: 15000 }
    );

    return { success: true, attemptId: attempt.id };
  } catch (err) {
    console.error("Error submitting public test:", err);
    return { error: "Something went wrong while submitting the test." };
  }
}
