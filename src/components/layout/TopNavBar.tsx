import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { AuthButtons } from "@/components/auth/AuthButtons";
import { UserButton } from "@/components/auth/UserButton";
import { Sidebar } from "./SideBar";

export default async function TopNavBar() {
  const session = await auth();
  let user = session?.user;

  if (session?.user?.id) {
    const freshUser = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });
    if (freshUser) {
      user = { ...session.user, ...freshUser };
    }
  }

  return (
    <nav className="sticky top-0 z-50 flex h-20 items-center justify-between border-b px-6 bg-white">
      {/* Left: Menu Icon & Logo */}
      <div className="flex items-center gap-4">
        <Sidebar user={user} />
        <Link href="/" className="text-3xl font-bold font-playfair-display">
          shortcut
        </Link>
      </div>

      {/* Right: Auth Status */}
      <div className="flex items-center gap-4">
        {user ? <UserButton user={user} /> : <AuthButtons />}
      </div>
    </nav>
  );
}
