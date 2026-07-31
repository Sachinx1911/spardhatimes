"use server";

import db from "@/lib/db";
import { getSession } from "@/lib/session";
import { AttemptStatus } from "@prisma/client";
import { gradeAttempt } from "@/lib/grading";

interface AnswerInput {
  questionId: string;
  chosenOption: string | null; // "A".."D", or comma list for multiple choice, or null
  timeSpent: number; // in seconds
}

export async function submitQuizAttempt(
  quizId: string,
  answers: AnswerInput[],
  timeTakenSeconds: number
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "You must be logged in to attempt tests." };
  }

  const userId = session.user.id;

  try {
    // 1. Fetch Quiz & Questions
    const quiz = await db.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true }
    });

    if (!quiz) {
      return { error: "Quiz not found." };
    }

    // 2. Grade the attempt. The scoring itself lives in lib/grading.ts as a pure
    // function so it can be unit tested — it decides every student's marks.
    const graded = gradeAttempt(
      quiz.questions,
      answers,
      quiz.negativeMarks,
      quiz.marks
    );

    const {
      correctAnswers: correctAnswersCount,
      wrongAnswers: wrongAnswersCount,
      skippedQuestions: skippedQuestionsCount,
      score: computedScore,
      percentage,
      responses: questionResponsesData,
    } = graded;

    // 3. Create Attempt and Responses in a database transaction.
    // NOTE: responses are inserted with a single createMany() instead of one
    // create() per question. Against a remote DB (Supabase) the per-row round trips
    // add up fast and a long quiz used to blow past the 5s transaction timeout,
    // making submit fail. createMany is one round trip; timeout is also raised.
    const attempt = await db.$transaction(async (tx) => {
      // Create Quiz Attempt
      const newAttempt = await tx.quizAttempt.create({
        data: {
          userId,
          quizId,
          score: computedScore,
          percentage,
          correctAnswers: correctAnswersCount,
          wrongAnswers: wrongAnswersCount,
          skippedQuestions: skippedQuestionsCount,
          timeTaken: timeTakenSeconds,
          status: AttemptStatus.COMPLETED,
        }
      });

      // Create all responses in one query
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

      // Check if certificate needs to be generated (if passed)
      const passed = computedScore >= quiz.passingMarks;
      if (passed) {
        // Check if certificate already exists
        const certExists = await tx.certificate.findFirst({
          where: { userId, quizId }
        });

        if (!certExists) {
          const code = `CERT-${quiz.slug.toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
          await tx.certificate.create({
            data: {
              userId,
              quizId,
              certificateCode: code,
              downloadUrl: `/api/certificates/${code}/pdf`
            }
          });

          // Send in-app notification
          await tx.notification.create({
            data: {
              userId,
              title: "Certificate Earned! 🎉",
              message: `Congratulations! You passed the "${quiz.title}" test and earned a certificate. Code: ${code}`,
              type: "certificate_generated"
            }
          });
        }
      }

      // Create completion notification
      await tx.notification.create({
        data: {
          userId,
          title: "Test Submitted 📄",
          message: `Your attempt for "${quiz.title}" has been graded. Score: ${computedScore}/${quiz.marks} (${percentage}%).`,
          type: "test_completed"
        }
      });

      return newAttempt;
    }, { timeout: 15000 });

    // 4. Calculate Rank and Percentile dynamically
    try {
      const allAttempts = await db.quizAttempt.findMany({
        where: { quizId, status: AttemptStatus.COMPLETED },
        orderBy: { score: "desc" },
      });

      const totalAttempts = allAttempts.length;
      const attemptIndex = allAttempts.findIndex((a) => a.id === attempt.id);
      const rank = attemptIndex + 1;

      // Percentile formula: ((Total Attempts - Rank) / Total Attempts) * 100
      // If only 1 attempt, percentile is 100%
      const percentile = totalAttempts > 1 
        ? Math.round((((totalAttempts - rank) / (totalAttempts - 1)) * 100) * 100) / 100
        : 100.0;

      await db.quizAttempt.update({
        where: { id: attempt.id },
        data: {
          rank,
          percentile,
        }
      });
    } catch (rankErr) {
      console.error("Error calculating attempt rank/percentile:", rankErr);
    }

    return { success: true, attemptId: attempt.id };
  } catch (err) {
    console.error("Error submitting test:", err);
    return { error: "Something went wrong while submitting the test." };
  }
}

// Toggle Bookmark Action
export async function toggleQuestionBookmark(questionId: string, quizId: string) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "You must be logged in to bookmark questions." };
  }
  const userId = session.user.id;

  try {
    const existingBookmark = await db.bookmark.findFirst({
      where: { userId, questionId }
    });

    if (existingBookmark) {
      await db.bookmark.delete({
        where: { id: existingBookmark.id }
      });
      return { bookmarked: false };
    } else {
      await db.bookmark.create({
        data: { userId, quizId, questionId }
      });
      return { bookmarked: true };
    }
  } catch (err) {
    console.error("Error toggling bookmark:", err);
    return { error: "Failed to toggle bookmark." };
  }
}
