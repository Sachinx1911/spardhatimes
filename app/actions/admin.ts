"use server";

import db from "@/lib/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { Role, Difficulty, QuizStatus, QuestionType } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { mapImportedRow, normalizeAnswerList } from "@/lib/question-import";

// Helper to check admin authorization
async function ensureAdmin() {
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Unauthorized access.");
  }
  const role = session.user.role;
  if (role !== Role.ADMIN && role !== Role.SUPERADMIN) {
    throw new Error("Access denied. Admin role required.");
  }
  return session.user;
}

// Fire-and-forget audit trail. Logging must never break the admin action
// itself, so failures are swallowed after a console warning.
async function logAdminAction(adminId: string, action: string, details?: string) {
  try {
    await db.adminLog.create({
      data: { adminId, action, details: details || null },
    });
  } catch (err) {
    console.warn("Failed to write admin log:", err);
  }
}

// -------------------------------------------------------------
// CATEGORY MANAGEMENT ACTIONS
// -------------------------------------------------------------

export async function createCategory(formData: FormData) {
  try {
    const admin = await ensureAdmin();
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

    await logAdminAction(admin.id!, "category.create", `Created category "${name}"`);
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
    const admin = await ensureAdmin();
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

    await logAdminAction(admin.id!, "category.update", `Updated category "${name}"`);
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
    const admin = await ensureAdmin();
    const cat = await db.category.findUnique({ where: { id }, select: { name: true } });
    await db.category.delete({
      where: { id }
    });

    await logAdminAction(admin.id!, "category.delete", `Deleted category "${cat?.name || id}"`);
    revalidatePath("/admin/categories");
    revalidatePath("/categories");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    console.error(err);
    return { error: err.message || "Failed to delete category." };
  }
}

// Notify every student when a quiz becomes published (in-app notification).
async function notifyQuizPublished(quizTitle: string) {
  try {
    const students = await db.user.findMany({
      where: { role: Role.STUDENT, isBlocked: false },
      select: { id: true },
    });
    if (students.length === 0) return;

    await db.notification.createMany({
      data: students.map((s) => ({
        userId: s.id,
        title: "New Quiz Published 📢",
        message: `A new test "${quizTitle}" is now available. Open it from your dashboard.`,
        type: "quiz_published",
      })),
    });
  } catch (err) {
    console.error("Failed to send quiz-published notifications:", err);
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
    const admin = await ensureAdmin();

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

    if (data.status === QuizStatus.PUBLISHED) {
      await notifyQuizPublished(quiz.title);
    }

    await logAdminAction(admin.id!, "quiz.create", `Created quiz "${quiz.title}" (${data.status})`);
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
    const admin = await ensureAdmin();

    const oldQuiz = await db.quiz.findUnique({
      where: { id },
      select: { categoryId: true, status: true }
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

    // Fire a notification only on a DRAFT -> PUBLISHED transition.
    if (oldQuiz?.status === QuizStatus.DRAFT && data.status === QuizStatus.PUBLISHED) {
      await notifyQuizPublished(data.title);
    }

    await logAdminAction(admin.id!, "quiz.update", `Updated quiz "${data.title}" (${data.status})`);
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
    const admin = await ensureAdmin();
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

      await logAdminAction(admin.id!, "quiz.delete", `Deleted quiz ${id} (${quiz.questions.length} questions)`);
    }

    revalidatePath("/admin/quizzes");
    revalidatePath("/quizzes");
    return { success: true };
  } catch (err: any) {
    console.error(err);
    return { error: err.message || "Failed to delete quiz." };
  }
}

export async function toggleQuizPublic(id: string) {
  try {
    const admin = await ensureAdmin();
    const quiz = await db.quiz.findUnique({ where: { id }, select: { isPublic: true, title: true } });
    if (!quiz) return { error: "Quiz not found." };

    const updated = await db.quiz.update({
      where: { id },
      data: { isPublic: !quiz.isPublic },
      select: { isPublic: true },
    });

    await logAdminAction(admin.id!, "quiz.toggle_public", `Set "${quiz.title}" public=${updated.isPublic}`);
    revalidatePath("/admin/quizzes");
    return { success: true, isPublic: updated.isPublic };
  } catch (err: any) {
    console.error(err);
    return { error: err.message || "Failed to toggle public status." };
  }
}

// -------------------------------------------------------------
// USER MANAGEMENT ACTIONS
// -------------------------------------------------------------

export async function toggleBlockUser(userId: string) {
  try {
    const admin = await ensureAdmin();
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return { error: "User not found." };
    if (user.role === Role.SUPERADMIN) return { error: "Super Admins cannot be blocked." };

    await db.user.update({
      where: { id: userId },
      data: { isBlocked: !user.isBlocked }
    });

    await logAdminAction(admin.id!, user.isBlocked ? "user.unblock" : "user.block", `${user.isBlocked ? "Unblocked" : "Blocked"} user ${user.email}`);
    revalidatePath("/admin/users");
    return { success: true, isBlocked: !user.isBlocked };
  } catch (err: any) {
    console.error(err);
    return { error: err.message || "Failed to toggle user block status." };
  }
}

export async function resetUserPassword(userId: string, pass: string) {
  try {
    const admin = await ensureAdmin();
    if (!pass || pass.length < 6) return { error: "Password must be at least 6 characters." };

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(pass, salt);

    await db.user.update({
      where: { id: userId },
      data: { passwordHash }
    });

    await logAdminAction(admin.id!, "user.reset_password", `Reset password for user ${userId}`);
    return { success: true };
  } catch (err: any) {
    console.error(err);
    return { error: err.message || "Failed to reset user password." };
  }
}

export async function deleteUser(userId: string) {
  try {
    const admin = await ensureAdmin();
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return { error: "User not found." };
    if (user.role === Role.SUPERADMIN) return { error: "Super Admins cannot be deleted." };

    await db.user.delete({
      where: { id: userId }
    });

    await logAdminAction(admin.id!, "user.delete", `Deleted user ${user.email}`);
    revalidatePath("/admin/users");
    return { success: true };
  } catch (err: any) {
    console.error(err);
    return { error: err.message || "Failed to delete user." };
  }
}

// -------------------------------------------------------------
// QUESTION MANAGEMENT ACTIONS (individual CRUD)
// -------------------------------------------------------------

interface QuestionInput {
  type?: QuestionType;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string;
  difficulty: Difficulty;
  marks: number;
  categoryName: string;
}

// Validates per question type and returns the prepared (normalized) data,
// or an error string.
function prepareQuestion(data: QuestionInput): { error?: string; prepared?: QuestionInput } {
  const type = data.type || QuestionType.SINGLE_CHOICE;
  if (!data.text?.trim()) return { error: "Question text is required." };

  const prepared: QuestionInput = { ...data, type };

  if (type === QuestionType.TRUE_FALSE) {
    // True/False questions always carry fixed A/B options; C/D stay empty.
    prepared.optionA = "True";
    prepared.optionB = "False";
    prepared.optionC = "";
    prepared.optionD = "";
    const ans = String(data.correctAnswer || "").toUpperCase().trim();
    const mapped = ans === "TRUE" ? "A" : ans === "FALSE" ? "B" : ans;
    if (!["A", "B"].includes(mapped)) {
      return { error: "True/False answer must be True (A) or False (B)." };
    }
    prepared.correctAnswer = mapped;
    return { prepared };
  }

  if (!data.optionA?.trim() || !data.optionB?.trim() || !data.optionC?.trim() || !data.optionD?.trim()) {
    return { error: "All four options (A-D) are required." };
  }

  if (type === QuestionType.MULTIPLE_CHOICE) {
    const normalized = normalizeAnswerList(data.correctAnswer);
    if (!normalized) {
      return { error: "Select at least one correct answer (e.g. A,C)." };
    }
    prepared.correctAnswer = normalized;
    return { prepared };
  }

  // SINGLE_CHOICE
  const ans = String(data.correctAnswer || "").toUpperCase().trim();
  if (!["A", "B", "C", "D"].includes(ans)) {
    return { error: "Correct Answer must be A, B, C, or D." };
  }
  prepared.correctAnswer = ans;
  return { prepared };
}

export async function createQuestion(quizId: string, data: QuestionInput) {
  try {
    const admin = await ensureAdmin();

    const { error, prepared } = prepareQuestion(data);
    if (error || !prepared) return { error: error || "Invalid question." };

    const quiz = await db.quiz.findUnique({
      where: { id: quizId },
      select: { id: true, categoryId: true },
    });
    if (!quiz) return { error: "Quiz not found." };

    await db.$transaction(async (tx) => {
      await tx.question.create({
        data: {
          quizId,
          type: prepared.type,
          text: prepared.text.trim(),
          optionA: prepared.optionA.trim(),
          optionB: prepared.optionB.trim(),
          optionC: prepared.optionC.trim(),
          optionD: prepared.optionD.trim(),
          correctAnswer: prepared.correctAnswer,
          explanation: prepared.explanation?.trim() || null,
          difficulty: prepared.difficulty,
          marks: Number(prepared.marks) || 1.0,
          categoryName: prepared.categoryName?.trim() || null,
        },
      });
      await tx.category.update({
        where: { id: quiz.categoryId },
        data: { totalQuestions: { increment: 1 } },
      });
    });

    await logAdminAction(admin.id!, "question.create", `Added a question to quiz ${quizId}`);
    revalidatePath(`/admin/quizzes/${quizId}/questions`);
    revalidatePath("/admin/quizzes");
    return { success: true };
  } catch (err: any) {
    console.error("Create question error:", err);
    return { error: err.message || "Failed to create question." };
  }
}

export async function updateQuestion(id: string, data: QuestionInput) {
  try {
    const admin = await ensureAdmin();

    const { error, prepared } = prepareQuestion(data);
    if (error || !prepared) return { error: error || "Invalid question." };

    await db.question.update({
      where: { id },
      data: {
        type: prepared.type,
        text: prepared.text.trim(),
        optionA: prepared.optionA.trim(),
        optionB: prepared.optionB.trim(),
        optionC: prepared.optionC.trim(),
        optionD: prepared.optionD.trim(),
        correctAnswer: prepared.correctAnswer,
        explanation: prepared.explanation?.trim() || null,
        difficulty: prepared.difficulty,
        marks: Number(prepared.marks) || 1.0,
        categoryName: prepared.categoryName?.trim() || null,
      },
    });

    await logAdminAction(admin.id!, "question.update", `Updated question ${id}`);
    revalidatePath("/admin/quizzes");
    return { success: true };
  } catch (err: any) {
    console.error("Update question error:", err);
    return { error: err.message || "Failed to update question." };
  }
}

export async function deleteQuestion(id: string) {
  try {
    const admin = await ensureAdmin();

    const question = await db.question.findUnique({
      where: { id },
      select: { quiz: { select: { categoryId: true } } },
    });
    if (!question) return { error: "Question not found." };

    await db.$transaction(async (tx) => {
      await tx.question.delete({ where: { id } });
      await tx.category.update({
        where: { id: question.quiz.categoryId },
        data: { totalQuestions: { decrement: 1 } },
      });
    });

    await logAdminAction(admin.id!, "question.delete", `Deleted question ${id}`);
    revalidatePath("/admin/quizzes");
    return { success: true };
  } catch (err: any) {
    console.error("Delete question error:", err);
    return { error: err.message || "Failed to delete question." };
  }
}

// -------------------------------------------------------------
// CATEGORY ICON UPLOAD
// -------------------------------------------------------------

// Stores the uploaded icon under public/uploads/icons and returns its public
// URL. Swap the file write for an R2 PutObject call when R2_* env vars are
// configured — the returned path contract stays the same.
export async function uploadCategoryIcon(formData: FormData) {
  try {
    const admin = await ensureAdmin();

    const file = formData.get("icon") as File | null;
    if (!file || file.size === 0) return { error: "No file selected." };
    if (file.size > 1024 * 1024) return { error: "Icon must be under 1 MB." };

    const allowed: Record<string, string> = {
      "image/png": "png",
      "image/jpeg": "jpg",
      "image/svg+xml": "svg",
      "image/webp": "webp",
    };
    const ext = allowed[file.type];
    if (!ext) return { error: "Only PNG, JPG, SVG, or WebP images are allowed." };

    const { mkdir, writeFile } = await import("fs/promises");
    const path = await import("path");

    const dir = path.join(process.cwd(), "public", "uploads", "icons");
    await mkdir(dir, { recursive: true });

    const filename = `icon-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(dir, filename), buffer);

    const url = `/uploads/icons/${filename}`;
    await logAdminAction(admin.id!, "category.icon_upload", `Uploaded category icon ${url}`);
    return { success: true, url };
  } catch (err: any) {
    console.error("Icon upload error:", err);
    return { error: err.message || "Failed to upload icon." };
  }
}

// -------------------------------------------------------------
// PLATFORM SETTINGS
// -------------------------------------------------------------

export async function updateSettings(values: Record<string, string>) {
  try {
    const admin = await ensureAdmin();

    // Validate known keys only; ignore anything else.
    const allowedKeys = ["site_announcement", "registrations_open", "leaderboard_size"];
    const entries = Object.entries(values).filter(([k]) => allowedKeys.includes(k));

    for (const [key, raw] of entries) {
      let value = String(raw ?? "").trim();
      if (key === "registrations_open") {
        value = value === "false" ? "false" : "true";
      }
      if (key === "leaderboard_size") {
        const n = parseInt(value, 10);
        if (!Number.isFinite(n) || n < 1 || n > 100) {
          return { error: "Leaderboard size must be a number between 1 and 100." };
        }
        value = String(n);
      }
      await db.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }

    await logAdminAction(admin.id!, "settings.update", `Updated settings: ${entries.map(([k]) => k).join(", ")}`);
    revalidatePath("/");
    revalidatePath("/leaderboard");
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (err: any) {
    console.error("Settings update error:", err);
    return { error: err.message || "Failed to update settings." };
  }
}

export async function bulkImportQuestions(quizId: string, questions: any[]) {
  try {
    const admin = await ensureAdmin();

    const quiz = await db.quiz.findUnique({
      where: { id: quizId },
      select: { id: true, categoryId: true }
    });

    if (!quiz) return { error: "Quiz not found." };

    // Build every row in memory first, then write them in ONE statement.
    //
    // This used to be an interactive transaction with `tx.question.create()`
    // inside the loop — one network round-trip per question. Against a
    // Supabase region ~170ms away that spent the whole 5s default interactive
    // transaction budget at roughly 30 questions, and the import then died with
    // "Transaction not found ... refers to an old closed transaction".
    // Nothing in this loop reads from the database, so there was never a reason
    // to hold a transaction open across it.
    const rows = questions.map((q) => mapImportedRow(q, quizId));

    // Array form of $transaction: still atomic (either both land or neither),
    // but sent as one batch instead of holding a session open, so the size of
    // the import no longer competes with a timeout.
    await db.$transaction([
      db.question.createMany({ data: rows }),
      db.category.update({
        where: { id: quiz.categoryId },
        data: {
          totalQuestions: { increment: questions.length }
        }
      }),
    ]);

    await logAdminAction(admin.id!, "question.bulk_import", `Imported ${questions.length} questions into quiz ${quizId}`);
    revalidatePath("/admin/quizzes");
    revalidatePath("/quizzes");
    return { success: true, count: questions.length };
  } catch (err: any) {
    console.error("Bulk import error:", err);
    return { error: err.message || "Failed to import questions. All changes rolled back." };
  }
}
