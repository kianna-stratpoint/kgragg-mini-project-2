"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MessageCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CommentItem } from "./CommentItem";
import { CommentForm } from "./CommentForm";

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    image?: string | null;
  };
}

interface CommentSidebarProps {
  postId: string;
  slug: string;
  comments: Comment[];
  currentUserId?: string;
}

export function CommentSidebar({
  postId,
  slug,
  comments,
  currentUserId,
}: CommentSidebarProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="flex items-center gap-2 group text-gray-500 hover:text-black transition-colors">
          <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">{comments.length}</span>
          <span className="sr-only">Open comments</span>
        </button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md flex flex-col h-full p-0 gap-0">
        <SheetHeader className="px-6 py-4 border-b border-gray-100">
          <SheetTitle className="font-playfair-display text-2xl">
            Comments ({comments.length})
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="flex flex-col py-4">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  slug={slug}
                  currentUserId={currentUserId}
                />
              ))
            ) : (
              <div className="text-center py-10 text-gray-500">
                <p>No comments yet.</p>
                <p className="text-sm">Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-6 border-t border-gray-100 bg-white mt-auto">
          {currentUserId ? (
            <CommentForm postId={postId} slug={slug} />
          ) : (
            <div className="text-center text-sm text-gray-500">
              Please log in to leave a comment.
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
