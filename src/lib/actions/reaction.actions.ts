"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { reactions } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function toggleReaction(postId: string, slug: string) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("You must be logged in to like a post.");
  }

  // 1. Check if reaction already exists
  const existingReaction = await db.query.reactions.findFirst({
    where: and(eq(reactions.postId, postId), eq(reactions.userId, userId)),
  });

  if (existingReaction) {
    // 2. If exists, REMOVE it (Unlike)
    await db
      .delete(reactions)
      .where(and(eq(reactions.postId, postId), eq(reactions.userId, userId)));
  } else {
    // 3. If not exists, ADD it (Like)
    await db.insert(reactions).values({
      postId,
      userId,
    });

    // TODO: Trigger Notification here in the future
  }

  // 4. Revalidate to update counts
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/");
}
