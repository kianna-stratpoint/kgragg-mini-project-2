"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateUserImage(imageUrl: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    await db
      .update(users)
      .set({ image: imageUrl })
      .where(eq(users.id, session.user.id));

    // Revalidate pages where the avatar appears
    revalidatePath("/", "layout");
    revalidatePath("/my-blogs");

    return { success: true };
  } catch (error) {
    console.error("Failed to update profile image:", error);
    return { success: false, error: "Failed to update image" };
  }
}

export async function deleteUserImage() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    await db
      .update(users)
      .set({ image: null }) // Set to null to remove
      .where(eq(users.id, session.user.id));

    revalidatePath("/", "layout");
    revalidatePath("/my-blogs");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete profile image:", error);
    return { success: false, error: "Failed to delete image" };
  }
}
