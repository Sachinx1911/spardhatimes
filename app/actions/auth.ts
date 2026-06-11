"use server";

import db from "@/lib/db";
import * as bcrypt from "bcryptjs";
import { getSession } from "@/lib/session";
import { getSetting } from "@/lib/settings";
import { revalidatePath } from "next/cache";

export async function registerUser(prevState: any, formData: FormData) {
  // Admin setting can temporarily close new sign-ups.
  const registrationsOpen = await getSetting("registrations_open");
  if (registrationsOpen === "false") {
    return { error: "Registrations are temporarily closed. Please check back later." };
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return { error: "All fields are required." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters long." };
  }

  try {
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return { error: "Email is already registered." };
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await db.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: "STUDENT",
      },
    });

    return { success: true };
  } catch (err) {
    console.error("Registration error:", err);
    return { error: "Something went wrong during registration. Please try again." };
  }
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
