import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { AuthButtons } from "@/components/auth/AuthButtons";
import { UserButton } from "@/components/auth/UserButton";
import { Sidebar } from "./SideBar";
// 1. ADD 'type NotificationItem' to this import
import {
  NotificationBell,
  type NotificationItem,
} from "@/components/ui/notification-bell";
import { getUserNotifications } from "@/lib/actions/notification.actions";

interface NotificationResponse {
  notifications: NotificationItem[];
  unreadCount: number;
}

export default async function TopNavBar() {
  const session = await auth();
  let user = session?.user;

  let notificationsData: NotificationResponse = {
    notifications: [],
    unreadCount: 0,
  };

  if (session?.user?.id) {
    const freshUser = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });
    if (freshUser) {
      user = { ...session.user, ...freshUser };
    }
    const data = await getUserNotifications(session.user.id);
    notificationsData = data as NotificationResponse;
  }

  return (
    <nav className="sticky top-0 z-50 flex h-20 items-center justify-between border-b px-6 bg-white">
      <div className="flex items-center gap-4">
        <Sidebar user={user} />
        <Link href="/" className="text-3xl font-bold font-playfair-display">
          shortcut
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <NotificationBell
              // 2. REMOVE userId={user.id} from here
              unreadCount={notificationsData.unreadCount}
              data={notificationsData.notifications}
            />
            <UserButton user={user} />
          </>
        ) : (
          <AuthButtons />
        )}
      </div>
    </nav>
  );
}
