"use client";

import { Heart } from "lucide-react";
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { toggleReaction } from "@/lib/actions/reaction.actions";
import { Button } from "@/components/ui/button";
import { useModalStore } from "@/hooks/use-modal-store";

interface ReactionButtonProps {
  postId: string;
  slug: string;
  initialCount: number;
  initialUserHasLiked: boolean;
  isLoggedIn: boolean;
}

export function ReactionButton({
  postId,
  slug,
  initialCount,
  initialUserHasLiked,
  isLoggedIn,
}: ReactionButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [hasLiked, setHasLiked] = useState(initialUserHasLiked);
  const [isPending, startTransition] = useTransition();

  const { openModal } = useModalStore();

  const handleToggle = () => {
    // CHECK LOGIN STATUS
    if (!isLoggedIn) {
      openModal("login");
      return;
    }

    const newHasLiked = !hasLiked;
    setHasLiked(newHasLiked);
    setCount((prev) => (newHasLiked ? prev + 1 : prev - 1));

    // Call Server Action
    startTransition(async () => {
      try {
        await toggleReaction(postId, slug);
      } catch (error) {
        // Revert on error
        setHasLiked(!newHasLiked);
        setCount((prev) => (!newHasLiked ? prev + 1 : prev - 1));
        console.error("Failed to toggle reaction", error);
      }
    });
  };

  return (
    <Button
      className={cn(
        "h-auto p-2 flex items-center gap-2 group bg-transparent text-gray-500 hover:text-red-600 hover:bg-transparent transition-colors",
        hasLiked && "text-red-600",
      )}
      onClick={handleToggle}
      disabled={isPending}
    >
      <Heart
        className={cn(
          "w-5.5! h-5.5! transition-transform group-hover:scale-110",
          hasLiked && "fill-current",
        )}
      />
      <span className="text-sm font-medium">{count}</span>
      <span className="sr-only">Like</span>
    </Button>
  );
}
