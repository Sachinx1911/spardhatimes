import React from "react";
import { db } from "@mahatest/db";
import { getSession } from "@/lib/session";
import { UserManager } from "@/components/admin/UserManager";

export const revalidate = 0;

export default async function AdminUsersPage() {
  const session = await getSession();
  const currentRole = session?.user?.role || "ADMIN";

  let users: any[] = [];
  let allSeries: any[] = [];
  try {
    [users, allSeries] = await Promise.all([
      db.user.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          seriesAccess: {
            select: {
              testSeriesId: true,
              testSeries: { select: { id: true, title: true } },
            },
          },
        },
      }),
      db.testSeries.findMany({
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, category: { select: { name: true } } },
      }),
    ]);
  } catch (err) {
    console.error("Error fetching users for admin:", err);
  }

  return (
    <UserManager
      initialUsers={users as any}
      allSeries={allSeries as any}
      currentRole={currentRole}
    />
  );
}
