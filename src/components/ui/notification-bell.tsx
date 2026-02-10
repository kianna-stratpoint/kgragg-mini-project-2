"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { markNotificationAsRead } from "@/lib/actions/notification.actions";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { UserAvatar } from "@/components/auth/UserAvatar"; // Use the component we made!

// 1. Define the notification shape explicitly
export interface NotificationItem {
  id: string;
  isRead: boolean;
  type: "COMMENT" | "REACTION";
  createdAt: Date | null;
  sender: {
    firstName: string | null;
    lastName: string | null;
    image: string | null;
  } | null;
  post: {
    slug: string | null;
    title: string | null;
  } | null;
}

export interface NotificationBellProps {
  // We'll remove userId since it's unused, or prefix with _ to ignore
  unreadCount: number;
  data: NotificationItem[];
}

export function NotificationBell({
  unreadCount: initialCount,
  data,
}: NotificationBellProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [optimisticCount, setOptimisticCount] = useState(initialCount);
  const [notifications, setNotifications] = useState<NotificationItem[]>(data);

  // 2. Use the interface for the parameter
  const handleNotificationClick = async (notification: NotificationItem) => {
    if (!notification.isRead) {
      setOptimisticCount((prev) => Math.max(0, prev - 1));
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, isRead: true } : n,
        ),
      );

      await markNotificationAsRead(notification.id);
    }

    setIsOpen(false);

    if (notification.post?.slug) {
      router.push(`/blog/${notification.post.slug}`);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger className="relative outline-none">
        <div className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <Bell className="w-6 h-6 text-gray-700" />
          {optimisticCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white">
              {optimisticCount > 9 ? "9+" : optimisticCount}
            </span>
          )}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 max-h-125 overflow-y-auto"
      >
        <DropdownMenuLabel className="font-playfair-display text-lg">
          Notifications
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            No notifications yet.
          </div>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`flex items-start gap-3 p-3 cursor-pointer ${
                !notification.isRead ? "bg-blue-50/50" : ""
              }`}
            >
              {/* 3. Using the shared UserAvatar component for consistency */}
              <UserAvatar
                user={{
                  name: `${notification.sender?.firstName} ${notification.sender?.lastName}`,
                  image: notification.sender?.image,
                }}
                className="w-8 h-8 mt-1"
              />

              <div className="flex flex-col gap-1">
                <p className="text-sm leading-snug text-gray-800">
                  <span className="font-semibold">
                    {notification.sender?.firstName}{" "}
                    {notification.sender?.lastName}
                  </span>{" "}
                  {notification.type === "COMMENT" ? "commented on" : "liked"}{" "}
                  <span className="font-medium text-blue-600">
                    &quot;{notification.post?.title || "your post"}&quot;
                  </span>
                </p>
                <span className="text-xs text-gray-500">
                  {notification.createdAt
                    ? formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })
                    : "Just now"}
                </span>
              </div>

              {!notification.isRead && (
                <span className="h-2 w-2 rounded-full bg-blue-500 mt-2 shrink-0" />
              )}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
