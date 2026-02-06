"use server";

import { db } from "@/db";
import { users, passwordResets } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import {
  SignupFormSchema,
  ForgotPasswordSchema,
  FormState,
  ResetPasswordSchema,
} from "@/lib/definitions";
import { randomBytes } from "crypto";

import { Resend } from "resend";
import { ResetPasswordEmail } from "@/components/emails/ResetPasswordEmail";

export async function signup(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  // 1. Validate Form Fields using Zod
  const validatedFields = SignupFormSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  // If validation fails, return errors to the UI
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Account.",
    };
  }

  const { email, password, firstName, lastName } = validatedFields.data;

  try {
    // 2. Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return {
        message: "Email already in use.",
        errors: { email: ["A user with this email already exists."] },
      };
    }

    // 3. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Insert into Database
    await db.insert(users).values({
      firstName,
      lastName,
      email,
      passwordHash: hashedPassword,
    });

    // 5. Success (We don't redirect here because we want the UI to switch to Login Modal)
    return { message: "Account created successfully!" };
  } catch (error) {
    console.error("Create account failed:", error);
    return { message: "Database Error: Failed to Create Account." };
  }
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function requestPasswordReset(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const validatedFields = ForgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid email address.",
    };
  }

  const { email } = validatedFields.data;

  // 1. Check if user exists
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    return { message: "If an account exists, a reset link has been sent." };
  }

  try {
    // 2. Generate Token
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

    // 3. Save to DB
    await db.insert(passwordResets).values({
      userId: user.id,
      token: token,
      expiresAt: expiresAt,
    });

    // 4. SEND EMAIL using Resend
    const resetLink = `http://localhost:3000/reset-password?token=${token}`;

    await resend.emails.send({
      from: "Shortcut App <onboarding@resend.dev>", // Default testing sender
      to: email,
      subject: "Reset your password",
      react: ResetPasswordEmail({
        resetLink,
        userFirstname: user.firstName,
      }),
    });

    return { message: "If an account exists, a reset link has been sent." };
  } catch (error) {
    console.error("Reset password error:", error);
    return { message: "Failed to send reset email." };
  }
}

export async function resetPassword(prevState: FormState, formData: FormData) {
  const token = formData.get("token") as string;

  // 1. Validate Password format
  const validatedFields = ResetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid password format.",
    };
  }

  const { password } = validatedFields.data;

  // 2. Find the valid reset token in DB
  const resetRecord = await db.query.passwordResets.findFirst({
    where: eq(passwordResets.token, token),
  });

  // 3. Validation Checks
  if (!resetRecord) {
    return { message: "Invalid or expired reset token." };
  }

  const hasExpired = new Date() > resetRecord.expiresAt;
  if (hasExpired) {
    return { message: "This reset link has expired." };
  }

  // 4. Update User's Password
  const hashedPassword = await bcrypt.hash(password, 10);

  await db
    .update(users)
    .set({ passwordHash: hashedPassword })
    .where(eq(users.id, resetRecord.userId));

  // 5. Delete the used token (Security best practice)
  await db.delete(passwordResets).where(eq(passwordResets.id, resetRecord.id));

  return { success: true, message: "Password updated successfully!" };
}
