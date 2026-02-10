"use client";

import { useActionState, useState, useTransition } from "react";
import {
  createPost,
  updatePost,
  PostFormState,
} from "@/lib/actions/post.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/ui/image-upload";
// 1. Import useUploadThing
import { useUploadThing } from "@/lib/uploadthing";

interface PostFormProps {
  initialData?: {
    id: string;
    title: string;
    content: string;
    imageUrl: string;
  };
  isEditing?: boolean;
}

export function PostForm({ initialData, isEditing = false }: PostFormProps) {
  const router = useRouter();

  // 2. Setup UploadThing hook
  const { startUpload } = useUploadThing("imageUploader");

  // State for the preview URL (can be remote URL or local blob URL)
  const [previewUrl, setPreviewUrl] = useState(initialData?.imageUrl || "");
  // State for the actual File object to be uploaded
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

  const [showImageInput, setShowImageInput] = useState(!!initialData?.imageUrl);

  // We use a manual transition for the upload phase
  const [isUploading, setIsUploading] = useState(false);
  const [, startTransition] = useTransition();

  const action =
    isEditing && initialData?.id
      ? updatePost.bind(null, initialData.id)
      : createPost;

  const [state, formAction, isPending] = useActionState<
    PostFormState,
    FormData
  >(action, null);

  const isLoading = isPending || isUploading;

  // 3. Custom Form Submission Handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);

    const formData = new FormData(e.currentTarget);

    try {
      // If there is a new file waiting to be uploaded...
      if (fileToUpload) {
        const uploadResponse = await startUpload([fileToUpload]);

        if (!uploadResponse || uploadResponse.length === 0) {
          throw new Error("Upload failed");
        }

        const uploadedUrl = uploadResponse[0].url;
        // Replace the 'imageUrl' in formData with the real remote URL
        formData.set("imageUrl", uploadedUrl);
      } else {
        // No new file? Use the existing preview URL (handles "keeping the same image")
        formData.set("imageUrl", previewUrl);
      }

      // Now call the Server Action
      startTransition(() => {
        formAction(formData);
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      // You might want to show a toast error here
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative max-w-3xl mx-auto mt-8 pb-20"
    >
      {/* --- Top Action Bar --- */}
      <div className="absolute -top-16 right-0 md:-right-12 lg:-right-24 flex items-center gap-2">
        <Button
          type="button"
          onClick={() => router.back()}
          className="border border-black bg-white hover:bg-gray-100 text-black sm:text-sm lg:text-base"
          disabled={isLoading}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={isLoading}
          className="bg-black text-white hover:bg-zinc-800 sm:text-sm lg:text-base"
        >
          {isLoading ? "Publishing..." : isEditing ? "Save Changes" : "Post"}
        </Button>
      </div>

      <div className="space-y-6">
        {/* --- Title Input --- */}
        <div className="group">
          <Input
            id="title"
            name="title"
            placeholder="Title"
            defaultValue={initialData?.title}
            required
            className="text-5xl md:text-6xl font-bold font-playfair-display border-none shadow-none focus-visible:ring-0 px-0 placeholder:text-gray-300 h-auto py-4"
          />
        </div>

        {/* --- Image Uploader Section --- */}
        <div className="relative group">
          {/* We don't need the hidden input for imageUrl anymore, we handle it in handleSubmit */}

          {showImageInput || previewUrl ? (
            <div className="relative mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
              <ImageUpload
                previewUrl={previewUrl}
                onFileSelect={(file) => {
                  if (file) {
                    // Create local preview
                    const url = URL.createObjectURL(file);
                    setPreviewUrl(url);
                    setFileToUpload(file);
                  }
                }}
                onClear={() => {
                  setPreviewUrl("");
                  setFileToUpload(null);
                  setShowImageInput(false);
                }}
                disabled={isLoading}
              />

              {!previewUrl && (
                <button
                  type="button"
                  onClick={() => setShowImageInput(false)}
                  className="absolute -top-3 -right-3 bg-gray-200 p-1 rounded-full hover:bg-gray-300 text-gray-500 transition-colors z-10"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4 h-12">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowImageInput(true)}
                className="rounded-full border border-gray-300 text-gray-400 hover:border-gray-800 hover:text-gray-800 transition-all h-8 w-8 shrink-0"
                title="Add Cover Image"
              >
                <Plus className="w-4 h-4" />
              </Button>
              <span className="text-gray-400 text-sm">Add cover image</span>
            </div>
          )}
        </div>

        {/* --- Content Textarea --- */}
        <div>
          <Textarea
            id="content"
            name="content"
            placeholder="What’s your commute story today?"
            defaultValue={initialData?.content}
            required
            className="min-h-[60vh] text-xl lg:text-lg leading-relaxed text-black border-none shadow-none focus-visible:ring-0 px-0 resize-none font-sans placeholder:font-sans placeholder:text-gray-300"
          />
        </div>
      </div>

      {state?.error && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-full shadow-lg text-sm font-medium animate-in fade-in slide-in-from-bottom-4">
          {state.error}
        </div>
      )}
    </form>
  );
}
