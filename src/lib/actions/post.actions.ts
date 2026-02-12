"use server";

import { db } from "@/db";
import { posts } from "@/db/schema";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

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

  // Generate excerpt
  const excerpt = content.slice(0, 150) + (content.length > 150 ? "..." : "");

  let postSlug = null;

  try {
    // Update and return the slug in one query
    const [updatedPost] = await db
      .update(posts)
      .set({
        title,
        content,
        excerpt,
        imageUrl: imageUrl || null,
        updatedAt: new Date(),
      })
      .where(and(eq(posts.id, postId), eq(posts.authorId, session.user.id)))
      .returning({ slug: posts.slug }); // <--- Extract the slug

    if (updatedPost) {
      postSlug = updatedPost.slug;
    }
  } catch (error) {
    console.error("Failed to update post:", error);
    return { error: "Failed to update post." };
  }

  // Revalidate paths
  revalidatePath("/");
  revalidatePath("/my-blogs");

  if (postSlug) {
    revalidatePath(`/blog/${postSlug}`);
    // Redirect to the specific blog post
    redirect(`/blog/${postSlug}`);
  }

  redirect("/");
}

export async function deletePost(postId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  const deleted = await db
    .delete(posts)
    .where(and(eq(posts.id, postId), eq(posts.authorId, session.user.id)))
    .returning();

  if (!deleted.length) {
    throw new Error("Post not found or you are not the author");
  }

  const deletedPost = deleted[0];

  if (deletedPost.imageUrl) {
    try {
      const imageKey = deletedPost.imageUrl.split("/").pop();

      if (imageKey) {
        await utapi.deleteFiles(imageKey);
      }
    } catch (error) {
      console.error("Failed to delete image from UploadThing:", error);
    }
  }

  revalidatePath("/");
  revalidatePath("/my-blogs");
}
