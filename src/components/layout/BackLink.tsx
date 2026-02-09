"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackLink() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="inline-flex items-center text-sm text-gray-500 hover:text-black transition-colors"
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Back to Posts
    </button>
  );
}
