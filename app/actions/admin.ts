"use server";

import db from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { Role, Difficulty, QuizStatus } from "@prisma/client";
import * as bcrypt from "bcryptjs";

// Helper to check admin authorization
async function ensureAdmin() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized access.");
  }
  const role = (session.user as any).role;
  if (role !== Role.ADMIN && role !== Role.SUPERADMIN) {
    throw new Error("Access denied. Admin role required.");
  }
  return session.user;
}

// -------------------------------------------------------------
// CATEGORY MANAGEMENT ACTIONS
// -------------------------------------------------------------

export async function createCategory(formData: FormData) {
  try {
    await ensureAdmin();
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const icon = formData.get("icon") as string;
    const metaTitle = formData.get("metaTitle") as string;
    const metaDescription = formData.get("metaDescription") as string;

    if (!name || !slug) return { error: "Name and Slug are required." };

    await db.category.create({
      data: {
        name,
        slug: slug.toLowerCase(),
        icon: icon || "Brain",
        metaTitle,
        metaDescription,
      }
    });

    revalidatePath("/admin/categories");
    revalidatePath("/categories");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    console.error(err);
    return { error: err.message || "Failed to create category." };
  }
}

export async function updateCategory(id: string, formData: FormData) {
  try {
    await ensureAdmin();
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const icon = formData.get("icon") as string;
    const metaTitle = formData.get("metaTitle") as string;
    const metaDescription = formData.get("metaDescription") as string;

    if (!name || !slug) return { error: "Name and Slug are required." };

    await db.category.update({
      where: { id },
      data: {
        name,
        slug: slug.toLowerCase(),
        icon: icon || "Brain",
        metaTitle,
        metaDescription,
      }
    });

    revalidatePath("/admin/categories");
    revalidatePath("/categories");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    console.error(err);
    return { error: err.message || "Failed to update category." };
  }
}

export async function deleteCategory(id: string) {
  try {
    await ensureAdmin();
    await db.category.delete({
      where: { id }
    });

    revalidatePath("/admin/categories");
    revalidatePath("/categories");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    console.error(err);
    return { error: err.message || "Failed to delete category." };
  }
}

// -------------------------------------------------------------
// QUIZ MANAGEMENT ACTIONS
// -------------------------------------------------------------

export async function createQuiz(data: {
  title: string;
  slug: string;
  description: string;
  duration: number;
  marks: number;
  negativeMarks: number;
  passingMarks: number;
  difficulty: Difficulty;
  status: QuizStatus;
  instructions: string;
  categoryId: string;
}) {
  try {
    await ensureAdmin();

    if (!data.title || !data.slug || !data.categoryId) {
      return { error: "Title, Slug, and Category are required." };
    }

    const quiz = await db.quiz.create({
      data: {
        title: data.title,
        slug: data.slug.toLowerCase(),
        description: data.description,
        duration: Number(data.duration),
        marks: Number(data.marks),
        negativeMarks: Number(data.negativeMarks),
        passingMarks: Number(data.passingMarks),
        difficulty: data.difficulty,
        status: data.status,
        instructions: data.instructions,
        categoryId: data.categoryId,
      }
    });

    // Increment category quiz counter
    await db.category.update({
      where: { id: data.categoryId },
      data: { totalTests: { increment: 1 } }
    });

    revalidatePath("/admin/quizzes");
    revalidatePath("/quizzes");
    return { success: true, quizId: quiz.id };
  } catch (err: any) {
    console.error(err);
    return { error: err.message || "Failed to create quiz." };
  }
}

export async function updateQuiz(
  id: string,
  data: {
    title: string;
    slug: string;
    description: string;
    duration: number;
    marks: number;
    negativeMarks: number;
    passingMarks: number;
    difficulty: Difficulty;
    status: QuizStatus;
    instructions: string;
    categoryId: string;
  }
) {
  try {
    await ensureAdmin();
    
    const oldQuiz = await db.quiz.findUnique({
      where: { id },
      select: { categoryId: true }
    });

    await db.quiz.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug.toLowerCase(),
        description: data.description,
        duration: Number(data.duration),
        marks: Number(data.marks),
        negativeMarks: Number(data.negativeMarks),
        passingMarks: Number(data.passingMarks),
        difficulty: data.difficulty,
        status: data.status,
        instructions: data.instructions,
        categoryId: data.categoryId,
      }
    });

    // Update categories counters if category changed
    if (oldQuiz && oldQuiz.categoryId !== data.categoryId) {
      await db.category.update({
        where: { id: oldQuiz.categoryId },
        data: { totalTests: { decrement: 1 } }
      });
      await db.category.update({
        where: { id: data.categoryId },
        data: { totalTests: { increment: 1 } }
      });
    }

    revalidatePath("/admin/quizzes");
    revalidatePath("/quizzes");
    return { success: true };
  } catch (err: any) {
    console.error(err);
    return { error: err.message || "Failed to update quiz." };
  }
}

export async function deleteQuiz(id: string) {
  try {
    await ensureAdmin();
    const quiz = await db.quiz.findUnique({
      where: { id },
      select: { categoryId: true, questions: { select: { id: true } } }
    });

    if (quiz) {
      await db.quiz.delete({
        where: { id }
      });

      // Update category counters
      await db.category.update({
        where: { id: quiz.categoryId },
        data: {
          totalTests: { decrement: 1 },
          totalQuestions: { decrement: quiz.questions.length }
        }
      });
    }

    revalidatePath("/admin/quizzes");
    revalidatePath("/quizzes");
    return { success: true };
  } catch (err: any) {
    console.error(err);
    return { error: err.message || "Failed to delete quiz." };
  }
}

// -------------------------------------------------------------
// USER MANAGEMENT ACTIONS
// -------------------------------------------------------------

export async function toggleBlockUser(userId: string) {
  try {
    await ensureAdmin();
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return { error: "User not found." };
    if (user.role === Role.SUPERADMIN) return { error: "Super Admins cannot be blocked." };

    await db.user.update({
      where: { id: userId },
      data: { isBlocked: !user.isBlocked }
    });

    revalidatePath("/admin/users");
    return { success: true, isBlocked: !user.isBlocked };
  } catch (err: any) {
    console.error(err);
    return { error: err.message || "Failed to toggle user block status." };
  }
}

export async function resetUserPassword(userId: string, pass: string) {
  try {
    await ensureAdmin();
    if (!pass || pass.length < 6) return { error: "Password must be at least 6 characters." };

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(pass, salt);

    await db.user.update({
      where: { id: userId },
      data: { passwordHash }
    });

    return { success: true };
  } catch (err: any) {
    console.error(err);
    return { error: err.message || "Failed to reset user password." };
  }
}

export async function deleteUser(userId: string) {
  try {
    await ensureAdmin();
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return { error: "User not found." };
    if (user.role === Role.SUPERADMIN) return { error: "Super Admins cannot be deleted." };

    await db.user.delete({
      where: { id: userId }
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (err: any) {
    console.error(err);
    return { error: err.message || "Failed to delete user." };
  }
}

export async function bulkImportQuestions(quizId: string, questions: any[]) {
  try {
    await ensureAdmin();

    const quiz = await db.quiz.findUnique({
      where: { id: quizId },
      select: { id: true, categoryId: true }
    });

    if (!quiz) return { error: "Quiz not found." };

    // Transactional rollback import
    await db.$transaction(async (tx) => {
      for (const q of questions) {
        let diff: Difficulty = Difficulty.MEDIUM;
        const rawDiff = String(q.Difficulty || "").toUpperCase().trim();
        if (rawDiff === "EASY") diff = Difficulty.EASY;
        else if (rawDiff === "HARD") diff = Difficulty.HARD;

        await tx.question.create({
          data: {
            quizId,
            text: String(q.Question || "").trim(),
            optionA: String(q["Option A"] || "").trim(),
            optionB: String(q["Option B"] || "").trim(),
            optionC: String(q["Option C"] || "").trim(),
            optionD: String(q["Option D"] || "").trim(),
            correctAnswer: String(q["Correct Answer"] || "").toUpperCase().trim(),
            explanation: q.Explanation ? String(q.Explanation).trim() : null,
            difficulty: diff,
            marks: 1.0,
            categoryName: q.Category ? String(q.Category).trim() : null,
          }
        });
      }

      // Update Category questions counter
      await tx.category.update({
        where: { id: quiz.categoryId },
        data: {
          totalQuestions: { increment: questions.length }
        }
      });
    });

    revalidatePath("/admin/quizzes");
    revalidatePath("/quizzes");
    return { success: true, count: questions.length };
  } catch (err: any) {
    console.error("Bulk import error:", err);
    return { error: err.message || "Failed to import questions. All changes rolled back." };
  }
}
