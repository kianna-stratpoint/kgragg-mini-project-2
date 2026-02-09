"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { comments } from "@/db/schema";
import { revalidatePath } from "next/cache";

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
