"use client";

import { useState } from "react";
import { Bell, Heart, MessageCircle } from "lucide-react";
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
import { UserAvatar } from "@/components/auth/UserAvatar";
import { cn } from "@/lib/utils";

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

  // Interface for the parameter
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
              <div className="relative w-12 h-12 mt-1 shrink-0">
                <UserAvatar
                  user={{
                    name: `${notification.sender?.firstName} ${notification.sender?.lastName}`,
                    image: notification.sender?.image,
                  }}
                  className="w-12 h-12"
                />

                {/* Notification Type Badge */}
                <div
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 flex items-center justify-center",
                    "w-5 h-5 rounded-full ring-2 ring-white",
                    notification.type === "COMMENT"
                      ? "bg-blue-500"
                      : "bg-red-500",
                  )}
                >
                  {notification.type === "COMMENT" ? (
                    <MessageCircle
                      className="w-2.5 h-2.5 text-white"
                      strokeWidth={2.5}
                    />
                  ) : (
                    <Heart
                      className="w-2.5 h-2.5 text-white fill-white"
                      strokeWidth={2.5}
                    />
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-sm leading-snug text-gray-800">
                  <span className="font-semibold">
                    {notification.sender?.firstName}{" "}
                    {notification.sender?.lastName}
                  </span>{" "}
                  {notification.type === "COMMENT" ? "commented on" : "liked"}{" "}
                  <span className="font-medium text-black">
                    &quot;{notification.post?.title || "your post"}&quot;
                  </span>
                </p>
                <span
                  className={cn(
                    "text-xs font-medium",
                    !notification.isRead ? "text-blue-600" : "text-gray-400",
                  )}
                >
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
