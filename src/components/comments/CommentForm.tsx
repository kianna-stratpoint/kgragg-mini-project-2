"use client";

import { createComment } from "@/lib/actions/comment.actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRef } from "react";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      size="sm"
      className="bg-black text-white hover:bg-zinc-800 px-6"
    >
      {pending ? "Posting..." : "Reply"}
    </Button>
  );
}

export function CommentForm({
  postId,
  slug,
}: {
  postId: string;
  slug: string;
}) {
  const ref = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={ref}
      action={async (formData) => {
        await createComment(formData);
        ref.current?.reset();
      }}
      className="space-y-4"
    >
      <input type="hidden" name="postId" value={postId} />
      <input type="hidden" name="slug" value={slug} />

      <Textarea
        name="content"
        placeholder="Share your thoughts..."
        className="resize-none min-h-25 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
        required
      />
      <div className="flex justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          type="button"
          className="px-6"
          onClick={() => ref.current?.reset()}
        >
          Cancel
        </Button>
        <SubmitButton />
      </div>
    </form>
  );
}
