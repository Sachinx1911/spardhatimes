"use server";

import db from "@/lib/db";
import { auth } from "@/auth";
import { AttemptStatus } from "@prisma/client";

interface AnswerInput {
  questionId: string;
  chosenOption: string | null; // "A", "B", "C", "D" or null
  timeSpent: number; // in seconds
}

export async function submitQuizAttempt(
  quizId: string,
  answers: AnswerInput[],
  timeTakenSeconds: number
) {
  const session = await auth();
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

    let correctAnswersCount = 0;
    let wrongAnswersCount = 0;
    let skippedQuestionsCount = 0;
    let computedScore = 0.0;

    const questionResponsesData: any[] = [];

    // 2. Grade each question
    for (const question of quiz.questions) {
      const answer = answers.find((a) => a.questionId === question.id);
      const chosenOption = answer?.chosenOption || null;
      const timeSpent = answer?.timeSpent || 0;

      if (!chosenOption) {
        skippedQuestionsCount++;
        questionResponsesData.push({
          questionId: question.id,
          chosenOption: null,
          isCorrect: false,
          timeSpent,
        });
      } else {
        const isCorrect = chosenOption === question.correctAnswer;
        if (isCorrect) {
          correctAnswersCount++;
          computedScore += question.marks;
        } else {
          wrongAnswersCount++;
          computedScore -= quiz.negativeMarks;
        }

        questionResponsesData.push({
          questionId: question.id,
          chosenOption,
          isCorrect,
          timeSpent,
        });
      }
    }

    // Ensure score is not negative if we don't want it to go below 0 (usually negative marks can go below zero, but let's floor it at 0 for display, or allow negative. Usually exams allow negative total score, but let's keep the actual computation).
    // Let's round to 2 decimal places
    computedScore = Math.round(computedScore * 100) / 100;
    const totalMarks = quiz.marks;
    const percentage = Math.round(((computedScore / totalMarks) * 100) * 100) / 100;

    // 3. Create Attempt and Responses in a database transaction
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

      // Create responses
      for (const response of questionResponsesData) {
        await tx.questionResponse.create({
          data: {
            attemptId: newAttempt.id,
            questionId: response.questionId,
            chosenOption: response.chosenOption,
            isCorrect: response.isCorrect,
            timeSpent: response.timeSpent,
          }
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
              message: `Congratulations! You passed the "${quiz.title}" mock exam and earned a certificate. Code: ${code}`,
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
          message: `Your attempt for "${quiz.title}" has been graded. Score: ${computedScore}/${totalMarks} (${percentage}%).`,
          type: "test_completed"
        }
      });

      return newAttempt;
    });

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
  const session = await auth();
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
