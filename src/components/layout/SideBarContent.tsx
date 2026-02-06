"use client";

import { Home, PenSquare, BookOpen } from "lucide-react";
import { useModalStore } from "@/hooks/use-modal-store";
import { User } from "next-auth";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";

interface SidebarContentProps {
  user?: User;
  onNavigate?: () => void; // Optional callback to close the sheet on mobile
}

export function SidebarContent({ user, onNavigate }: SidebarContentProps) {
  const { openModal } = useModalStore();
  const pathname = usePathname();
  const router = useRouter();

  const handleNavigation = (href: string, protectedRoute: boolean) => {
    if (protectedRoute && !user) {
      openModal("login");
      return;
    }
    router.push(href);
    if (onNavigate) onNavigate();
  };

  const routes = [
    { label: "Home", href: "/", icon: Home, protected: false },
    { label: "My Blogs", href: "/my-blogs", icon: BookOpen, protected: true },
    {
      label: "Write",
      href: "/write",
      icon: PenSquare,
      protected: true,
    },
  ];

  return (
    <div className="flex flex-col gap-2 py-4">
      {routes.map((route) => (
        <button
          key={route.href}
          onClick={() => handleNavigation(route.href, route.protected)}
          className={cn(
            "flex items-center gap-4 px-4 py-3 text-lg font-medium transition-colors rounded-lg mx-2",
            pathname === route.href
              ? "bg-black text-white"
              : "text-gray-600 hover:bg-gray-100",
          )}
        >
          <route.icon className="h-5 w-5" />
          {route.label}
        </button>
      ))}
    </div>
  );
}
