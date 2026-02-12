import { BlogPostSkeleton } from "@/components/ui/skeletons";

export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      <BlogPostSkeleton />
    </div>
  );
}
