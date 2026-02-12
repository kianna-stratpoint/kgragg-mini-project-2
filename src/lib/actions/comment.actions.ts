"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { comments, posts } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import {
  createNotification,
  deleteNotification,
} from "@/lib/actions/notification.actions";

export async function createComment(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const content = formData.get("content") as string;
  const postId = formData.get("postId") as string;
  const slug = formData.get("slug") as string;

  if (!content || !postId) return;

  // Insert Comment
  await db.insert(comments).values({
    content,
    postId,
    authorId: session.user.id,
  });

  // Fetch Post to get Author ID for notification
  const post = await db.query.posts.findFirst({
    where: eq(posts.id, postId),
    columns: { authorId: true, title: true },
  });

  // Create Notification
  if (post) {
    await createNotification({
      recipientId: post.authorId,
      senderId: session.user.id,
      postId: postId,
      type: "COMMENT",
      message: `commented on your post "${post.title}"`,
    });
  }

  revalidatePath(`/blog/${slug}`);
  revalidatePath("/");
}

// 2. UPDATE COMMENT
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

  // Revalidate paths
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/");
}

// 3. DELETE COMMENT
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

  // Delete the comment from DB
  await db.delete(comments).where(eq(comments.id, commentId));

  const post = await db.query.posts.findFirst({
    where: eq(posts.id, existingComment.postId),
    columns: { authorId: true },
  });

  if (post) {
    await deleteNotification({
      recipientId: post.authorId,
      senderId: userId,
      postId: existingComment.postId,
      type: "COMMENT",
    });
  }

  // Revalidate
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/");
}
