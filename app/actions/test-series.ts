"use server";

import db from "@/lib/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { Role, Difficulty, QuizStatus, TimingMode } from "@prisma/client";
import * as bcrypt from "bcryptjs";

// ---------------------------------------------------------------------------
// Shared helpers (kept local; not exported so they stay off the action surface
// indirectly via re-use of admin.ts patterns).
// ---------------------------------------------------------------------------

async function ensureAdmin() {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized access.");
  const role = (session.user as any).role;
  if (role !== Role.ADMIN && role !== Role.SUPERADMIN) {
    throw new Error("Access denied. Admin role required.");
  }
  return session.user;
}

async function ensureSuperAdmin() {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized access.");
  const role = (session.user as any).role;
  if (role !== Role.SUPERADMIN) {
    throw new Error("Only a Super Admin can perform this action.");
  }
  return session.user;
}

async function logAdminAction(adminId: string, action: string, details?: string) {
  try {
    await db.adminLog.create({ data: { adminId, action, details: details || null } });
  } catch (err) {
    console.warn("Failed to write admin log:", err);
  }
}

function baseSlug(s: string) {
  return (
    String(s || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || `item-${Date.now()}`
  );
}

// Ensure a unique slug for a model by appending a short suffix on collision.
async function uniqueSlug(desired: string, exists: (slug: string) => Promise<boolean>) {
  const slug = baseSlug(desired);
  let candidate = slug;
  let i = 0;
  while (await exists(candidate)) {
    i += 1;
    candidate = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
    if (i > 5) {
      candidate = `${slug}-${Date.now().toString(36)}`;
      break;
    }
  }
  return candidate;
}

// ---------------------------------------------------------------------------
// TEST SERIES CRUD
// ---------------------------------------------------------------------------

export async function createTestSeries(data: {
  title: string;
  description: string;
  categoryId: string;
  timingMode: TimingMode;
  plannedTotalTests: number;
}) {
  try {
    const admin = await ensureAdmin();
    if (!data.title?.trim()) return { error: "Series title is required." };
    if (!data.categoryId) return { error: "Please choose a category." };

    const slug = await uniqueSlug(data.title, async (s) =>
      !!(await db.testSeries.findUnique({ where: { slug: s }, select: { id: true } }))
    );

    const series = await db.testSeries.create({
      data: {
        title: data.title.trim(),
        slug,
        description: data.description?.trim() || null,
        categoryId: data.categoryId,
        timingMode: data.timingMode === "WINDOW" ? TimingMode.WINDOW : TimingMode.RELEASE_ONLY,
        plannedTotalTests: Math.max(0, Number(data.plannedTotalTests) || 0),
      },
    });

    await logAdminAction(admin.id!, "series.create", `Created test series "${series.title}"`);
    revalidatePath("/admin/series");
    return { success: true, seriesId: series.id };
  } catch (err: any) {
    console.error("createTestSeries:", err);
    return { error: err.message || "Failed to create test series." };
  }
}

export async function updateTestSeries(
  id: string,
  data: {
    title: string;
    description: string;
    categoryId: string;
    timingMode: TimingMode;
    plannedTotalTests: number;
    published: boolean;
  }
) {
  try {
    const admin = await ensureAdmin();
    if (!data.title?.trim()) return { error: "Series title is required." };

    await db.testSeries.update({
      where: { id },
      data: {
        title: data.title.trim(),
        description: data.description?.trim() || null,
        categoryId: data.categoryId,
        timingMode: data.timingMode === "WINDOW" ? TimingMode.WINDOW : TimingMode.RELEASE_ONLY,
        plannedTotalTests: Math.max(0, Number(data.plannedTotalTests) || 0),
        published: !!data.published,
      },
    });

    await logAdminAction(admin.id!, "series.update", `Updated test series "${data.title}"`);
    revalidatePath("/admin/series");
    revalidatePath(`/admin/series/${id}`);
    return { success: true };
  } catch (err: any) {
    console.error("updateTestSeries:", err);
    return { error: err.message || "Failed to update test series." };
  }
}

export async function deleteTestSeries(id: string) {
  try {
    const admin = await ensureAdmin();
    const series = await db.testSeries.findUnique({
      where: { id },
      select: { title: true, _count: { select: { quizzes: true } } },
    });
    // Deleting a series unlinks its quizzes (onDelete: SetNull) but keeps them.
    await db.testSeries.delete({ where: { id } });

    await logAdminAction(admin.id!, "series.delete", `Deleted test series "${series?.title || id}"`);
    revalidatePath("/admin/series");
    return { success: true };
  } catch (err: any) {
    console.error("deleteTestSeries:", err);
    return { error: err.message || "Failed to delete test series." };
  }
}

// ---------------------------------------------------------------------------
// TESTS INSIDE A SERIES (each test is a Quiz)
// ---------------------------------------------------------------------------

export async function createSeriesTest(
  seriesId: string,
  data: {
    title: string;
    description: string;
    duration: number;
    marks: number;
    negativeMarks: number;
    passingMarks: number;
    difficulty: Difficulty;
    instructions: string;
    releaseAt: string; // ISO datetime-local string
    closeAt: string;
  }
) {
  try {
    const admin = await ensureAdmin();
    if (!data.title?.trim()) return { error: "Test title is required." };

    const series = await db.testSeries.findUnique({
      where: { id: seriesId },
      select: { id: true, categoryId: true, title: true, _count: { select: { quizzes: true } } },
    });
    if (!series) return { error: "Test series not found." };

    const slug = await uniqueSlug(data.title, async (s) =>
      !!(await db.quiz.findUnique({ where: { slug: s }, select: { id: true } }))
    );

    const releaseAt = data.releaseAt ? new Date(data.releaseAt) : null;
    const closeAt = data.closeAt ? new Date(data.closeAt) : null;
    if (releaseAt && closeAt && closeAt <= releaseAt) {
      return { error: "Close time must be after the release time." };
    }

    const quiz = await db.quiz.create({
      data: {
        title: data.title.trim(),
        slug,
        description: data.description?.trim() || null,
        duration: Number(data.duration) || 10,
        marks: Number(data.marks) || 0,
        negativeMarks: Number(data.negativeMarks) || 0,
        passingMarks: Number(data.passingMarks) || 0,
        difficulty: data.difficulty || Difficulty.MEDIUM,
        status: QuizStatus.PUBLISHED, // visibility is gated by releaseAt, not draft state
        instructions: data.instructions?.trim() || null,
        categoryId: series.categoryId,
        testSeriesId: series.id,
        orderIndex: series._count.quizzes,
        releaseAt,
        closeAt,
        // releaseNotified defaults to false; the release sweep fans out the
        // unlock notification once releaseAt passes (or immediately if already past).
      },
    });

    await db.category.update({
      where: { id: series.categoryId },
      data: { totalTests: { increment: 1 } },
    });

    await logAdminAction(admin.id!, "series.test_add", `Added test "${quiz.title}" to series "${series.title}"`);
    revalidatePath(`/admin/series/${seriesId}`);
    return { success: true, quizId: quiz.id };
  } catch (err: any) {
    console.error("createSeriesTest:", err);
    return { error: err.message || "Failed to add test." };
  }
}

export async function updateSeriesTest(
  quizId: string,
  data: {
    title: string;
    description: string;
    duration: number;
    marks: number;
    negativeMarks: number;
    passingMarks: number;
    difficulty: Difficulty;
    instructions: string;
    releaseAt: string;
    closeAt: string;
  }
) {
  try {
    const admin = await ensureAdmin();
    if (!data.title?.trim()) return { error: "Test title is required." };

    const existing = await db.quiz.findUnique({
      where: { id: quizId },
      select: { testSeriesId: true, releaseAt: true, releaseNotified: true },
    });
    if (!existing) return { error: "Test not found." };

    const releaseAt = data.releaseAt ? new Date(data.releaseAt) : null;
    const closeAt = data.closeAt ? new Date(data.closeAt) : null;
    if (releaseAt && closeAt && closeAt <= releaseAt) {
      return { error: "Close time must be after the release time." };
    }

    // If the release date was changed to a future time, re-arm notifications.
    const releaseChanged =
      (existing.releaseAt?.getTime() || 0) !== (releaseAt?.getTime() || 0);
    const reArm = releaseChanged && releaseAt && releaseAt > new Date();

    await db.quiz.update({
      where: { id: quizId },
      data: {
        title: data.title.trim(),
        description: data.description?.trim() || null,
        duration: Number(data.duration) || 10,
        marks: Number(data.marks) || 0,
        negativeMarks: Number(data.negativeMarks) || 0,
        passingMarks: Number(data.passingMarks) || 0,
        difficulty: data.difficulty || Difficulty.MEDIUM,
        instructions: data.instructions?.trim() || null,
        releaseAt,
        closeAt,
        ...(reArm ? { releaseNotified: false } : {}),
      },
    });

    await logAdminAction(admin.id!, "series.test_update", `Updated test "${data.title}"`);
    if (existing.testSeriesId) revalidatePath(`/admin/series/${existing.testSeriesId}`);
    return { success: true };
  } catch (err: any) {
    console.error("updateSeriesTest:", err);
    return { error: err.message || "Failed to update test." };
  }
}

export async function removeSeriesTest(quizId: string) {
  try {
    const admin = await ensureAdmin();
    const quiz = await db.quiz.findUnique({
      where: { id: quizId },
      select: { categoryId: true, testSeriesId: true, title: true, questions: { select: { id: true } } },
    });
    if (!quiz) return { error: "Test not found." };

    await db.quiz.delete({ where: { id: quizId } });
    await db.category.update({
      where: { id: quiz.categoryId },
      data: {
        totalTests: { decrement: 1 },
        totalQuestions: { decrement: quiz.questions.length },
      },
    });

    await logAdminAction(admin.id!, "series.test_remove", `Removed test "${quiz.title}"`);
    if (quiz.testSeriesId) revalidatePath(`/admin/series/${quiz.testSeriesId}`);
    return { success: true };
  } catch (err: any) {
    console.error("removeSeriesTest:", err);
    return { error: err.message || "Failed to remove test." };
  }
}

// ---------------------------------------------------------------------------
// STUDENT CREATION + SERIES ASSIGNMENT
// ---------------------------------------------------------------------------

export async function createStudent(data: {
  name: string;
  email: string;
  password: string;
  phone: string;
  seriesIds: string[];
}) {
  try {
    const admin = await ensureAdmin();
    const email = String(data.email || "").trim().toLowerCase();
    if (!data.name?.trim()) return { error: "Student name is required." };
    if (!email || !email.includes("@")) return { error: "A valid email is required." };
    if (!data.password || data.password.length < 6) {
      return { error: "Password must be at least 6 characters." };
    }

    const existing = await db.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) return { error: "A user with this email already exists." };

    const passwordHash = await bcrypt.hash(data.password, await bcrypt.genSalt(10));

    const student = await db.user.create({
      data: {
        name: data.name.trim(),
        email,
        phone: data.phone?.trim() || null,
        passwordHash,
        role: Role.STUDENT,
      },
    });

    const seriesIds = Array.from(new Set((data.seriesIds || []).filter(Boolean)));
    if (seriesIds.length > 0) {
      await db.testSeriesAccess.createMany({
        data: seriesIds.map((sid) => ({
          userId: student.id,
          testSeriesId: sid,
          assignedById: admin.id,
        })),
        skipDuplicates: true,
      });
    }

    await logAdminAction(
      admin.id!,
      "student.create",
      `Created student ${email} with ${seriesIds.length} series`
    );
    revalidatePath("/admin/users");
    return { success: true, userId: student.id };
  } catch (err: any) {
    console.error("createStudent:", err);
    return { error: err.message || "Failed to create student." };
  }
}

// SUPERADMIN-only: create an ADMIN account. Admins manage students, series,
// quizzes, etc. but cannot create other admins (only a super admin can).
export async function createAdminUser(data: {
  name: string;
  email: string;
  password: string;
}) {
  try {
    const superAdmin = await ensureSuperAdmin();
    const email = String(data.email || "").trim().toLowerCase();
    if (!data.name?.trim()) return { error: "Admin name is required." };
    if (!email || !email.includes("@")) return { error: "A valid email is required." };
    if (!data.password || data.password.length < 6) {
      return { error: "Password must be at least 6 characters." };
    }

    const existing = await db.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) return { error: "A user with this email already exists." };

    const passwordHash = await bcrypt.hash(data.password, await bcrypt.genSalt(10));

    const admin = await db.user.create({
      data: {
        name: data.name.trim(),
        email,
        passwordHash,
        role: Role.ADMIN,
      },
    });

    await logAdminAction(superAdmin.id!, "admin.create", `Created admin ${email}`);
    revalidatePath("/admin/users");
    return { success: true, userId: admin.id };
  } catch (err: any) {
    console.error("createAdminUser:", err);
    return { error: err.message || "Failed to create admin." };
  }
}

export async function assignSeries(userId: string, seriesId: string) {
  try {
    const admin = await ensureAdmin();
    await db.testSeriesAccess.upsert({
      where: { userId_testSeriesId: { userId, testSeriesId: seriesId } },
      update: {},
      create: { userId, testSeriesId: seriesId, assignedById: admin.id },
    });

    await logAdminAction(admin.id!, "student.assign_series", `Assigned series ${seriesId} to ${userId}`);
    revalidatePath(`/admin/users/${userId}`);
    revalidatePath("/admin/users");
    return { success: true };
  } catch (err: any) {
    console.error("assignSeries:", err);
    return { error: err.message || "Failed to assign series." };
  }
}

export async function unassignSeries(userId: string, seriesId: string) {
  try {
    const admin = await ensureAdmin();
    await db.testSeriesAccess.deleteMany({
      where: { userId, testSeriesId: seriesId },
    });

    await logAdminAction(admin.id!, "student.unassign_series", `Removed series ${seriesId} from ${userId}`);
    revalidatePath(`/admin/users/${userId}`);
    revalidatePath("/admin/users");
    return { success: true };
  } catch (err: any) {
    console.error("unassignSeries:", err);
    return { error: err.message || "Failed to remove series." };
  }
}
