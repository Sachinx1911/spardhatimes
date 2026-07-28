import { db } from "@mahatest/db";

/**
 * Release sweep for scheduled test-series tests.
 *
 * A test inside a series becomes visible to students once its `releaseAt`
 * time passes. There is no background scheduler — instead this sweep runs
 * lazily whenever a student (or admin) loads a page that calls it. The first
 * load after a test's release time fans out one in-app notification to every
 * student who has access to that series, then flips `releaseNotified` so the
 * notification is never sent twice.
 *
 * Safe to call on every dashboard/home render: it no-ops when nothing is due.
 */
export async function syncTestSeriesReleases() {
  const now = new Date();

  const due = await db.quiz.findMany({
    where: {
      testSeriesId: { not: null },
      status: "PUBLISHED",
      releaseNotified: false,
      releaseAt: { not: null, lte: now },
    },
    select: { id: true, title: true, testSeriesId: true },
  });

  if (due.length === 0) return;

  for (const q of due) {
    try {
      await db.$transaction(async (tx) => {
        // Re-check inside the transaction so two concurrent sweeps don't both
        // notify (whichever commits first flips the flag).
        const fresh = await tx.quiz.findUnique({
          where: { id: q.id },
          select: { releaseNotified: true },
        });
        if (!fresh || fresh.releaseNotified) return;

        const students = await tx.testSeriesAccess.findMany({
          where: { testSeriesId: q.testSeriesId! },
          select: { userId: true },
        });

        if (students.length > 0) {
          await tx.notification.createMany({
            data: students.map((s) => ({
              userId: s.userId,
              title: "New test unlocked 🎯",
              message: `"${q.title}" is now live. Open it from your dashboard and attempt it!`,
              type: "test_released",
            })),
          });
        }

        await tx.quiz.update({
          where: { id: q.id },
          data: { releaseNotified: true },
        });
      });
    } catch (err) {
      console.error("Release sweep failed for quiz", q.id, err);
    }
  }
}

// testState आता @mahatest/core मध्ये आहे, त्याच्यावर अवलंबून असणाऱ्या access rules
// शेजारी: तो package import-मुक्त आहे म्हणून त्याचे tests database शिवाय चालतात,
// तर ही file Prisma ओढते. जुने importers चालू राहावेत म्हणून इथून re-export.
export { testState, type TestState } from "@mahatest/core";
