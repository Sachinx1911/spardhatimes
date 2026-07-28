"use server";

import { db } from "@mahatest/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

// Fetch the current user's latest notifications (used by the navbar bell).
export async function getMyNotifications() {
  const session = await getSession();
  if (!session?.user?.id) {
    return { notifications: [], unreadCount: 0 };
  }

  try {
    const notifications = await db.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 15,
    });
    const unreadCount = notifications.filter((n) => !n.read).length;
    return { notifications, unreadCount };
  } catch (err) {
    console.error("Error fetching notifications:", err);
    return { notifications: [], unreadCount: 0 };
  }
}

export async function markNotificationRead(id: string) {
  const session = await getSession();
  if (!session?.user?.id) return { error: "Unauthorized." };

  try {
    // Scope to the owner so a user can't flip someone else's notification.
    await db.notification.updateMany({
      where: { id, userId: session.user.id },
      data: { read: true },
    });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("Error marking notification read:", err);
    return { error: "Failed to update notification." };
  }
}

export async function markAllNotificationsRead() {
  const session = await getSession();
  if (!session?.user?.id) return { error: "Unauthorized." };

  try {
    await db.notification.updateMany({
      where: { userId: session.user.id, read: false },
      data: { read: true },
    });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("Error marking all notifications read:", err);
    return { error: "Failed to update notifications." };
  }
}
