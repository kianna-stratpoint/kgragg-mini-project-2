"use client";

import { User } from "next-auth";
import { SidebarContent } from "./SideBarContent";

interface DesktopSidebarProps {
  user?: User;
}

export function DesktopSidebar({ user }: DesktopSidebarProps) {
  return (
    <aside className="hidden md:flex flex-col w-62.5 border-r bg-white h-[calc(100vh-80px)] sticky top-20">
      <div className="h-full px-2 py-4">
        <SidebarContent user={user} />
      </div>
    </aside>
  );
}
