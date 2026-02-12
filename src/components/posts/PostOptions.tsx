"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2, Edit } from "lucide-react";
import { useState } from "react";
import { deletePost } from "@/lib/actions/post.actions";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface PostOptionsProps {
  postId: string;
  slug: string;
  authorId: string;
  currentUserId?: string;
}

export function PostOptions({
  postId,
  slug,
  authorId,
  currentUserId,
}: PostOptionsProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (authorId !== currentUserId) return null;

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deletePost(postId);
      toast.success("Post deleted successfully");

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
      setIsDeleting(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild className="text-base font-normal">
            <Link
              href={`/blog/${slug}/edit`}
              className="cursor-pointer flex items-center"
            >
              <Edit className="text-black mr-2 h-10 w-10" />
              Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-base font-normal text-red-600 focus:text-red-600"
            onSelect={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="text-bold text-red-600 mr-2 h-10 w-10" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="items-center justify-center">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-playfair-display font-bold text-2xl">
              Delete Post
            </AlertDialogTitle>
            <AlertDialogDescription className="text-black text-light">
              This action cannot be undone. Are you sure you want to delete this
              post?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault(); // Prevent closing immediately
                handleDelete();
              }}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
