"use server";

import { db } from "@mahatest/db";
import * as bcrypt from "bcryptjs";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

// Public self-registration is permanently disabled — student accounts are
// created by an admin from the dashboard (see createStudent in
// app/actions/test-series.ts). This stub keeps the action safe even if it is
// somehow still invoked.
export async function registerUser(_prevState: any, _formData: FormData) {
  return {
    error: "Self sign-up is disabled. Please contact your institute / admin for an account.",
  };
}

// Update the logged-in user's display name and mobile number.
export async function updateProfile(formData: FormData) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "You must be logged in." };
  }

  const name = String(formData.get("name") || "").trim();
  if (!name) {
    return { error: "Display name cannot be empty." };
  }
  if (name.length > 80) {
    return { error: "Display name is too long." };
  }

  // Mobile number is optional; when provided it must be 10-15 digits
  // (an optional leading + country code is allowed).
  const phoneRaw = String(formData.get("phone") || "").trim();
  let phone: string | null = null;
  if (phoneRaw) {
    const normalized = phoneRaw.replace(/[\s-]/g, "");
    if (!/^\+?\d{10,15}$/.test(normalized)) {
      return { error: "Enter a valid mobile number (10-15 digits, optional +country code)." };
    }
    phone = normalized;
  }

  try {
    await db.user.update({
      where: { id: session.user.id },
      data: { name, phone },
    });
    revalidatePath("/dashboard");
    return { success: true, message: "Profile updated." };
  } catch (err) {
    console.error("Profile update error:", err);
    return { error: "Failed to update profile." };
  }
}

// Change the logged-in user's password after verifying the current one.
export async function changePassword(formData: FormData) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "You must be logged in." };
  }

  const currentPassword = String(formData.get("currentPassword") || "");
  const newPassword = String(formData.get("newPassword") || "");

  if (!currentPassword || !newPassword) {
    return { error: "Both current and new passwords are required." };
  }
  if (newPassword.length < 6) {
    return { error: "New password must be at least 6 characters long." };
  }

  try {
    const user = await db.user.findUnique({ where: { id: session.user.id } });
    if (!user) {
      return { error: "User not found." };
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      return { error: "Current password is incorrect." };
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);
    await db.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return { success: true, message: "Password changed successfully." };
  } catch (err) {
    console.error("Password change error:", err);
    return { error: "Failed to change password." };
  }
}
