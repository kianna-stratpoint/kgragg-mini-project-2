"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { User } from "next-auth";
import { useState } from "react";
import { SidebarContent } from "./SideBarContent";

interface SidebarProps {
  user?: User;
}

export function Sidebar({ user }: SidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden hover:bg-gray-100 rounded-full"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-75">
        <SheetHeader>
          <SheetTitle className="text-left text-2xl font-bold font-playfair-display mb-2 pl-4">
            shortcut
          </SheetTitle>
        </SheetHeader>
        <SidebarContent user={user} onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
