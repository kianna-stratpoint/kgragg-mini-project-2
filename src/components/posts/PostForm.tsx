"use client";

import {
  useActionState,
  useState,
  useTransition,
  useRef,
  useEffect,
} from "react";
import {
  createPost,
  updatePost,
  PostFormState,
} from "@/lib/actions/post.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/ui/image-upload";
import { useUploadThing } from "@/lib/uploadthing";
import TiptapEditor from "@/components/posts/TipTapEditor";
import { toast } from "sonner";

interface PostFormProps {
  initialData?: {
    id: string;
    title: string;
    content: string;
    imageUrl: string | null;
  };
  isEditing?: boolean;
}

export function PostForm({ initialData, isEditing = false }: PostFormProps) {
  const router = useRouter();
  const { startUpload } = useUploadThing("imageUploader");

  const [content, setContent] = useState(initialData?.content || "");
  const [previewUrl, setPreviewUrl] = useState(initialData?.imageUrl || "");
  const [showImageInput, setShowImageInput] = useState(!!initialData?.imageUrl);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [, startTransition] = useTransition();

  const isSubmittingRef = useRef(false);

  const action =
    isEditing && initialData?.id
      ? updatePost.bind(null, initialData.id)
      : createPost;

  const [state, formAction, isPending] = useActionState<
    PostFormState,
    FormData
  >(action, null);

  const isLoading = isPending || isUploading;

  useEffect(() => {
    if (!isPending) {
      isSubmittingRef.current = false;
    }
  }, [isPending]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    const formData = new FormData(e.currentTarget);
    formData.set("content", content);

    if (fileToUpload) {
      setIsUploading(true);
      try {
        const uploadResponse = await startUpload([fileToUpload]);

        if (!uploadResponse || uploadResponse.length === 0) {
          throw new Error("Upload failed");
        }

        const uploadedUrl = uploadResponse[0].url;
        formData.set("imageUrl", uploadedUrl);
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error("Failed to upload image. Please try again.");
        setIsUploading(false);
        isSubmittingRef.current = false;
        return;
      }
    } else {
      formData.set("imageUrl", previewUrl || "");
    }

    startTransition(() => {
      formAction(formData);
      setIsUploading(false);
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative max-w-3xl mx-auto mt-8 pb-20"
    >
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

        <div className="relative group">
          {showImageInput || previewUrl ? (
            <div className="relative mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
              <ImageUpload
                previewUrl={previewUrl}
                onFileSelect={(file: File | null) => {
                  if (file) {
                    const objectUrl = URL.createObjectURL(file);
                    setPreviewUrl(objectUrl);
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

        <div>
          <TiptapEditor
            content={content}
            onChange={(newContent) => setContent(newContent)}
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
