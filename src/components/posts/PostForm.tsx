"use client";

import { useActionState, useState } from "react";
import {
  createPost,
  updatePost,
  PostFormState,
} from "@/lib/actions/post.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

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
  const [showImageInput, setShowImageInput] = useState(!!initialData?.imageUrl);
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");

  const action =
    isEditing && initialData?.id
      ? updatePost.bind(null, initialData.id)
      : createPost;

  const [state, formAction, isPending] = useActionState<
    PostFormState,
    FormData
  >(action, null);

  return (
    <form action={formAction} className="relative max-w-3xl mx-auto mt-8 pb-20">
      {/* --- Top Action Bar --- */}
      <div className="absolute -top-16 right-0 md:-right-12 lg:-right-24 flex items-center gap-2">
        <Button
          type="button"
          onClick={() => router.back()} // Go back to previous page
          className="border border-black bg-white hover:bg-gray-100 text-black sm:text-sm lg:text-base"
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={isPending}
          className="bg-black text-white hover:bg-zinc-800 sm:text-sm lg:text-base"
        >
          {isPending
            ? isEditing
              ? "Updating..."
              : "Publishing..."
            : isEditing
              ? "Save Changes"
              : "Post"}
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
          {imageUrl ? (
            <div className="relative w-full h-64 md:h-80 bg-gray-50 rounded-lg overflow-hidden mb-6">
              {/* Uses Next/Image with 'fill' and 'unoptimized' */}
              <Image
                src={imageUrl}
                alt="Cover preview"
                fill
                className="object-cover"
                unoptimized
              />

              {/* Hidden input to actually send the data */}
              <input type="hidden" name="imageUrl" value={imageUrl} />

              <button
                type="button"
                onClick={() => {
                  setImageUrl("");
                  setShowImageInput(false);
                }}
                className="absolute top-4 right-4 bg-white/80 p-2 rounded-full hover:bg-white text-gray-700 transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4 h-12">
              {!showImageInput ? (
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
              ) : (
                <div className="flex-1 flex items-center gap-2 animate-in fade-in slide-in-from-left-4 duration-300">
                  <div className="relative flex-1">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      name="imageUrl"
                      placeholder="Paste an image link..."
                      className="pl-9 border-gray-200 bg-gray-50 focus-visible:ring-1 focus-visible:ring-gray-200 rounded-full"
                      autoFocus
                      onChange={(e) => setImageUrl(e.target.value)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowImageInput(false)}
                    className="h-8 w-8 rounded-full"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </Button>
                </div>
              )}
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
