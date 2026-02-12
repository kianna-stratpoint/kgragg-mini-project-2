"use server";

import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// 1. Fetch Notifications
export async function getUserNotifications(userId: string) {
  try {
    const data = await db.query.notifications.findMany({
      where: eq(notifications.recipientId, userId),
      orderBy: [desc(notifications.createdAt)],
      limit: 20,
      with: {
        sender: {
          columns: {
            firstName: true,
            lastName: true,
            image: true,
          },
        },
        post: {
          columns: {
            slug: true,
            title: true,
          },
        },
      },
    });

    const validNotifications = data.filter(
      (n) => n.post !== null && n.sender !== null,
    );

    const unreadCount = validNotifications.filter((n) => !n.isRead).length;

    return { notifications: validNotifications, unreadCount };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return { notifications: [], unreadCount: 0 };
  }
}

// 2. Mark a notification as read
export async function markNotificationAsRead(notificationId: string) {
  try {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId));

    revalidatePath("/");
  } catch (error) {
    console.error("Error marking notification as read:", error);
  }
}

// 4. Create Notification
export async function createNotification({
  recipientId,
  senderId,
  postId,
  type,
  message,
}: {
  recipientId: string;
  senderId: string;
  postId: string;
  type: "COMMENT" | "REACTION";
  message: string;
}) {
  try {
    if (recipientId === senderId) return;

    await db.insert(notifications).values({
      recipientId,
      senderId,
      postId,
      type,
      message,
    });
  } catch (error) {
    console.error("Error creating notification:", error);
  }
}

export async function deleteNotification({
  recipientId,
  senderId,
  postId,
  type,
}: {
  recipientId: string;
  senderId: string;
  postId: string;
  type: "COMMENT" | "REACTION";
}) {
  try {
    if (recipientId === senderId) return;

    await db
      .delete(notifications)
      .where(
        and(
          eq(notifications.recipientId, recipientId),
          eq(notifications.senderId, senderId),
          eq(notifications.postId, postId),
          eq(notifications.type, type),
        ),
      );
  } catch (error) {
    console.error("Error deleting notification:", error);
  }
}
