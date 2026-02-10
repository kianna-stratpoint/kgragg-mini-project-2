"use client";

import { useState, useTransition, useRef } from "react";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { useUploadThing } from "@/lib/uploadthing";
import { updateUserImage, deleteUserImage } from "@/lib/actions/user.actions";
import { Camera, Loader2, Check, X, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

interface AvatarUploaderProps {
  user: {
    id: string;
    name?: string | null;
    image?: string | null;
  };
}

export function AvatarUploader({ user }: AvatarUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for Modals
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // State for Upload/Preview
  const [isUploading, setIsUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { startUpload } = useUploadThing("imageUploader");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

  // 1. Handle Resetting state when main modal closes
  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      // Small delay to prevent flickering while closing
      setTimeout(() => {
        setPreviewUrl(null);
        setFileToUpload(null);
      }, 300);
    }
  };

  // 2. Handle File Selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setFileToUpload(file);
    }
  };

  // 3. Handle Cancel inside Preview
  const handleCancelPreview = () => {
    setPreviewUrl(null);
    setFileToUpload(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 4. Handle Save (Upload)
  const handleSave = async () => {
    if (!fileToUpload) return;

    setIsUploading(true);
    try {
      const uploadRes = await startUpload([fileToUpload]);
      if (!uploadRes || !uploadRes[0]?.url) throw new Error("Upload failed");

      const newImageUrl = uploadRes[0].url;

      startTransition(async () => {
        const result = await updateUserImage(newImageUrl);
        if (result.success) {
          toast.success("Profile updated");
          setIsDialogOpen(false); // Close modal on success
          window.location.reload();
        } else {
          toast.error("Failed to update profile");
        }
      });
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setIsUploading(false);
    }
  };

  // 5. Handle Delete
  const handleDelete = async () => {
    setIsUploading(true);
    startTransition(async () => {
      const result = await deleteUserImage();
      if (result.success) {
        toast.success("Profile photo removed");
        setShowDeleteDialog(false);
        setIsDialogOpen(false);
        window.location.reload();
      } else {
        toast.error("Failed to remove photo");
      }
      setIsUploading(false);
    });
  };

  const isLoading = isUploading || isPending;
  const displayUser = { ...user, image: previewUrl || user.image };

  return (
    <>
      {/* --- Main Modal (Triggered by Avatar Click) --- */}
      <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
        <DialogTrigger asChild>
          <div className="relative group inline-block cursor-pointer">
            <UserAvatar
              user={user}
              className="h-32 w-32 border-4 border-white shadow-lg transition-opacity group-hover:opacity-90"
            />
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
              <Camera className="w-8 h-8 text-white" />
            </div>
            {isLoading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
          </div>
        </DialogTrigger>

        <DialogContent className="sm:max-w-106.5 flex flex-col items-center text-center">
          <DialogHeader>
            <DialogTitle className="font-playfair-display font-bold text-2xl">
              {previewUrl ? "Preview Photo" : "Profile Photo"}
            </DialogTitle>
          </DialogHeader>

          {/* Avatar Display inside Modal */}
          <div className="py-6">
            <UserAvatar
              user={displayUser}
              className="h-40 w-40 border-4 border-gray-100 shadow-sm"
            />
          </div>

          <div className="flex flex-col gap-3 w-full max-w-xs">
            {previewUrl ? (
              /* --- View 2: Preview Mode (Save/Cancel) --- */
              <div className="flex gap-3 w-full">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleCancelPreview}
                  disabled={isLoading}
                >
                  <X className="w-4 h-4 mr-2" /> Cancel
                </Button>
                <Button
                  className="flex-1 bg-black text-white"
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" /> Save
                    </>
                  )}
                </Button>
              </div>
            ) : (
              /* --- View 1: Menu Mode (Update/Remove) --- */
              <>
                <Button
                  className="w-full bg-black hover:bg-gray-800 text-white font-semibold"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Update Profile Photo
                </Button>

                {user.image && (
                  <Button
                    variant="ghost"
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 font-semibold"
                    onClick={() => setShowDeleteDialog(true)}
                    disabled={isLoading}
                  >
                    Remove Profile Photo
                  </Button>
                )}

                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* --- Delete Confirmation Alert Dialog --- */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="items-center justify-center">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-playfair-display font-bold text-2xl">
              Remove Profile Photo
            </AlertDialogTitle>
            <AlertDialogDescription className="text-black text-light">
              This action cannot be undone. Are you sure you want to delete this
              profile photo?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* --- Hidden File Input --- */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
        disabled={isLoading}
      />
    </>
  );
}
