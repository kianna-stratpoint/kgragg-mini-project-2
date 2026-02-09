"use server";

import { db } from "@/db";
import { posts } from "@/db/schema";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";

// 1. Define the state type for better TypeScript support
export type PostFormState = {
  error?: string;
} | null;

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createPost(
  prevState: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "You must be logged in to post." };
  }

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const imageUrl = formData.get("imageUrl") as string;

  if (!title || !content) {
    return { error: "Title and content are required." };
  }

  const slug = generateSlug(title) + "-" + Date.now().toString().slice(-4);
  const excerpt = content.slice(0, 150) + (content.length > 150 ? "..." : "");

  try {
    await db.insert(posts).values({
      title,
      content,
      slug,
      excerpt,
      imageUrl: imageUrl || null,
      authorId: session.user.id,
    });
  } catch (error) {
    console.error("Failed to create post:", error);
    return { error: "Failed to create post. Please try again." };
  }

  // 3. Revalidate and redirect
  revalidatePath("/");
  revalidatePath("/my-blogs");
  redirect("/");
}

export async function updatePost(
  postId: string,
  prevState: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const imageUrl = formData.get("imageUrl") as string;

  if (!title || !content) {
    return { error: "Title and content are required." };
  }

  // Generate a new excerpt
  const excerpt = content.slice(0, 150) + (content.length > 150 ? "..." : "");

  try {
    // Update ONLY if the ID matches and the Author is the current user
    await db
      .update(posts)
      .set({
        title,
        content,
        excerpt,
        imageUrl: imageUrl || null,
        updatedAt: new Date(), // Update the timestamp
      })
      .where(and(eq(posts.id, postId), eq(posts.authorId, session.user.id)));
  } catch (error) {
    console.error("Failed to update post:", error);
    return { error: "Failed to update post." };
  }

  revalidatePath("/");
  revalidatePath("/my-blogs");
  revalidatePath(`/blog/${postId}`); // In case we redirect to ID

  // Redirect back to the blog post (we need to find the slug, or just redirect to home/my-blogs)
  // For simplicity, let's redirect to My Blogs or Home
  redirect("/");
}

export async function deletePost(postId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Verify ownership and delete in one go
  // The 'where' clause ensures we only delete if ID matches AND Author matches
  const deleted = await db
    .delete(posts)
    .where(and(eq(posts.id, postId), eq(posts.authorId, session.user.id)))
    .returning();

  if (!deleted.length) {
    throw new Error("Post not found or you are not the author");
  }

  revalidatePath("/");
  revalidatePath("/my-blogs");
}
