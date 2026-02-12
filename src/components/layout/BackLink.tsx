"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackLink() {
  const searchParams = useSearchParams();
  // Read the 'from' parameter from the URL
  const from = searchParams.get("from");

  const backHref = from === "my-blogs" ? "/my-blogs" : "/";
  const backLabel = from === "my-blogs" ? "Back to My Blogs" : "Back to Home";

  return (
    <Link
      href={backHref}
      className="inline-flex items-center text-sm text-gray-500 hover:text-black transition-colors"
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      {backLabel}
    </Link>
  );
}
