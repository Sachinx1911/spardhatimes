import React from "react";
import db from "@/lib/db";
import { UserManager } from "@/components/admin/UserManager";

export const revalidate = 0;

export default async function AdminUsersPage() {
  let users: any[] = [];
  try {
    users = await db.user.findMany({
      orderBy: { createdAt: "desc" }
    });
  } catch (err) {
    console.error("Error fetching users for admin:", err);
  }

  return <UserManager initialUsers={users as any} />;
}
