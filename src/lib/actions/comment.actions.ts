"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { comments } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export async function createComment(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const content = formData.get("content") as string;
  const postId = formData.get("postId") as string;
  const slug = formData.get("slug") as string;

  if (!content || !postId) return;

  await db.insert(comments).values({
    content,
    postId,
    authorId: session.user.id,
  });

  revalidatePath(`/blog/${slug}`); // Refresh details page
  revalidatePath("/"); // Refresh home page
}

export async function updateComment(
  commentId: string,
  content: string,
  slug: string,
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("You must be logged in to update a comment.");
  }

  // Verify ownership
  const existingComment = await db.query.comments.findFirst({
    where: eq(comments.id, commentId),
  });

  if (!existingComment) {
    throw new Error("Comment not found.");
  }

  if (existingComment.authorId !== userId) {
    throw new Error("You are not authorized to update this comment.");
  }

  // Update the comment
  await db
    .update(comments)
    .set({
      content: content,
      updatedAt: new Date(),
    })
    .where(eq(comments.id, commentId));

  // 3. Revalidate paths to show changes immediately
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/");
}

export async function deleteComment(commentId: string, slug: string) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("You must be logged in to delete a comment.");
  }

  // Verify ownership
  const existingComment = await db.query.comments.findFirst({
    where: eq(comments.id, commentId),
  });

  if (!existingComment) {
    throw new Error("Comment not found.");
  }

  if (existingComment.authorId !== userId) {
    throw new Error("You are not authorized to delete this comment.");
  }

  // Delete the comment
  await db.delete(comments).where(eq(comments.id, commentId));

  // Revalidate
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/");
}
