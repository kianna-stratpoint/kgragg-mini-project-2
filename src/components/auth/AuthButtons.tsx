"use client";

import { Button } from "@/components/ui/button";
import { useModalStore } from "@/hooks/use-modal-store";

export function AuthButtons() {
  const { openModal } = useModalStore();

  return (
    <div className="flex gap-2">
      <Button
        className="border border-black bg-white hover:bg-gray-100 text-black sm:text-sm lg:text-base"
        onClick={() => openModal("login")}
      >
        Log In
      </Button>
      <Button
        className="bg-black text-white hover:bg-zinc-800 sm:text-sm lg:text-base"
        onClick={() => openModal("signup")}
      >
        Sign Up
      </Button>
    </div>
  );
}
