import { Skeleton } from "@/components/ui/skeleton";

// Single Card Skeleton
export function PostCardSkeleton() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-50 w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
      </div>
      <div className="flex items-center gap-2 pt-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

// Grid Skeleton (Used for Home and My Blogs)
export function PostGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Blog Detail Skeleton
export function BlogPostSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl animate-pulse">
      <div className="h-6 w-24 bg-gray-200 rounded mb-6" />
      <div className="h-12 w-3/4 bg-gray-200 rounded mb-6" />
      <div className="flex items-center gap-3 mb-8 border-y py-6 border-gray-100">
        <div className="h-10 w-10 bg-gray-200 rounded-full" />
        <div className="space-y-2">
          <div className="h-4 w-32 bg-gray-200 rounded" />
          <div className="h-3 w-24 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="w-full aspect-video bg-gray-200 rounded-xl mb-10" />
      <div className="space-y-4">
        <div className="h-4 w-full bg-gray-200 rounded" />
        <div className="h-4 w-full bg-gray-200 rounded" />
        <div className="h-4 w-2/3 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

// User's My Blogs Page Loading State
export function StatsSkeleton() {
  return (
    <div className="flex items-center justify-center gap-8 md:gap-16 border-b border-gray-100 py-6 w-full max-w-2xl mb-16">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-2">
          <Skeleton className="h-8 w-12" /> {/* Number */}
          <Skeleton className="h-3 w-16" /> {/* Label */}
        </div>
      ))}
    </div>
  );
}
