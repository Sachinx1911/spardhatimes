"use server";

import crypto from "crypto";
import { db } from "@mahatest/db";
import * as bcrypt from "bcryptjs";
import { sendMail } from "@/lib/mailer";

const TOKEN_TTL_MINUTES = 30;

const sha256 = (value: string) => crypto.createHash("sha256").update(value).digest("hex");

// Step 1: user submits their email. Always responds with success so the form
// can't be used to probe which emails are registered.
export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!email) {
    return { error: "Email address is required." };
  }

  const genericResponse: { success: true; message: string; devResetUrl?: string } = {
    success: true,
    message: "If an account exists for that email, a password reset link has been sent.",
  };

  try {
    const user = await db.user.findUnique({ where: { email } });
    if (!user || user.isBlocked) {
      return genericResponse;
    }

    // Invalidate any previous unused tokens, then issue a fresh one.
    await db.passwordResetToken.deleteMany({
      where: { userId: user.id, usedAt: null },
    });

    const rawToken = crypto.randomBytes(32).toString("hex");
    await db.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: sha256(rawToken),
        expiresAt: new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000),
      },
    });

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password/${rawToken}`;

    const { sent } = await sendMail({
      to: user.email,
      subject: "Reset your Spardha Times password",
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto">
          <h2 style="color:#0F172A">Password Reset Request</h2>
          <p>Hi ${user.name || "there"},</p>
          <p>We received a request to reset your Spardha Times password. Click the button below to choose a new one. This link is valid for ${TOKEN_TTL_MINUTES} minutes.</p>
          <p style="margin:24px 0">
            <a href="${resetUrl}" style="background:#2563EB;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Reset Password</a>
          </p>
          <p style="color:#64748b;font-size:13px">If you didn't request this, you can safely ignore this email — your password will not change.</p>
        </div>`,
    });

    // In development without an email provider, hand the link back to the UI
    // so the flow can be exercised end-to-end. Never do this in production.
    if (!sent && process.env.NODE_ENV !== "production") {
      return { ...genericResponse, devResetUrl: resetUrl };
    }

    return genericResponse;
  } catch (err) {
    console.error("Password reset request error:", err);
    return genericResponse;
  }
}

// Step 2: user opens the emailed link and submits a new password.
export async function resetPassword(formData: FormData) {
  const token = String(formData.get("token") || "");
  const newPassword = String(formData.get("newPassword") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (!token) return { error: "Invalid reset link." };
  if (newPassword.length < 6) {
    return { error: "Password must be at least 6 characters long." };
  }
  if (newPassword !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  try {
    const record = await db.passwordResetToken.findUnique({
      where: { tokenHash: sha256(token) },
      include: { user: { select: { id: true, isBlocked: true } } },
    });

    if (!record || record.usedAt || record.expiresAt < new Date() || record.user.isBlocked) {
      return { error: "This reset link is invalid or has expired. Please request a new one." };
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await db.$transaction([
      db.user.update({
        where: { id: record.user.id },
        data: { passwordHash },
      }),
      db.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      db.notification.create({
        data: {
          userId: record.user.id,
          title: "Password Changed 🔐",
          message: "Your account password was reset successfully. If this wasn't you, contact support immediately.",
          type: "security",
        },
      }),
    ]);

    return { success: true, message: "Password reset successfully. You can now sign in with your new password." };
  } catch (err) {
    console.error("Password reset error:", err);
    return { error: "Something went wrong while resetting your password." };
  }
}
