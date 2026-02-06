import Link from "next/link";
import { auth } from "@/auth";
import { AuthButtons } from "@/components/auth/AuthButtons";
import { UserButton } from "@/components/auth/UserButton";
import { Menu } from "lucide-react";

export default async function TopNavBar() {
  const session = await auth();

  return (
    <nav className="flex h-20 items-center justify-between border-b px-6 bg-white">
      {/* Left: Menu Icon & Logo */}
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <Menu className="h-6 w-6" />
        </button>
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
