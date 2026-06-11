"use server";

import db from "@/lib/db";
import * as bcrypt from "bcryptjs";

export async function registerUser(prevState: any, formData: FormData) {
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
