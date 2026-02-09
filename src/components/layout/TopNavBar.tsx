import Link from "next/link";
import { auth } from "@/auth";
import { AuthButtons } from "@/components/auth/AuthButtons";
import { UserButton } from "@/components/auth/UserButton";
import { Sidebar } from "./SideBar";

export default async function TopNavBar() {
  const session = await auth();
  const user = session?.user;

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
        {session?.user ? <UserButton user={session.user} /> : <AuthButtons />}
      </div>
    </nav>
  );
}
