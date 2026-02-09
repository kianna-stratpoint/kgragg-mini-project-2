"use client";

import { UserAvatar } from "@/components/auth/UserAvatar";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { MoreHorizontal, Trash2, Pencil } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updateComment } from "@/lib/actions/comment.actions";

interface CommentItemProps {
  comment: {
    id: string;
    content: string;
    createdAt: Date;
    author: {
      id: string;
      firstName: string;
      lastName: string;
      image?: string | null;
    };
  };
  currentUserId?: string;
  slug: string;
}

export function CommentItem({
  comment,
  currentUserId,
  slug,
}: CommentItemProps) {
  // Local state for editing
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isSaving, setIsSaving] = useState(false);

  // Check if the current user owns this comment
  const isOwner = currentUserId === comment.author.id;

  const handleSave = async () => {
    if (!editContent.trim()) return;
    setIsSaving(true);
    try {
      await updateComment(comment.id, editContent, slug);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update comment", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      //await deleteComment(comment.id, slug);
    } catch (error) {
      console.error("Failed to delete comment", error);
    }
  };

  return (
    <div className="flex gap-4 py-6 border-b border-gray-100 last:border-0">
      <UserAvatar
        user={{
          name: `${comment.author.firstName} ${comment.author.lastName}`,
          image: comment.author.image,
        }}
        className="h-8 w-8 md:h-10 md:w-10 shrink-0"
      />
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-900">
            {comment.author.firstName} {comment.author.lastName}
          </span>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
              })}
            </span>

            {/* Options Menu (Only for Owner) */}
            {isOwner && !isEditing && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 ml-1">
                    <MoreHorizontal className="h-4 w-4 text-gray-400" />
                    <span className="sr-only">Options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Pencil className="text-black mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onClick={handleDelete}
                  >
                    <Trash2 className="text-red-600 mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Display Content OR Edit Form */}
        {isEditing ? (
          <div className="mt-2 space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-20 text-sm"
            />
            <div className="flex gap-2 justify-end">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(comment.content); // Reset on cancel
                }}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-700 leading-relaxed mt-1 wrap-break-words">
            {comment.content}
          </p>
        )}
      </div>
    </div>
  );
}
