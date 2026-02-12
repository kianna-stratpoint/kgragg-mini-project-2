import { auth } from "@/auth";
import { db } from "@/db";
import { PostCard } from "@/components/posts/PostCard";
import { PostOptions } from "@/components/posts/PostOptions";
import Link from "next/link";
import { Suspense } from "react";
import { PostGridSkeleton } from "@/components/ui/skeletons";
import { PostFilter } from "@/components/posts/PostFilter";
import { BusFront } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "shortcut | Home",
  description:
    "Discover the latest commute stories, traffic updates, and travel tips from fellow Filipino commuters.",
  openGraph: {
    title: "shortcut - Share Your Journey",
    description:
      "Join the community of commuters sharing real stories about the daily grind in the Philippines.",
    type: "website",
  },
};

// ISOLATED DATA COMPONENT
async function LatestPostsList({ sort }: { sort: string }) {
  const session = await auth();
  const userId = session?.user?.id;

  const allPosts = await db.query.posts.findMany({
    with: {
      author: true,
      comments: {
        with: { author: true },
        // Callback helpers for nested relations
        orderBy: (comments, { desc }) => [desc(comments.createdAt)],
      },
      reactions: true,
    },
    // Callback to access 'posts' columns and 'asc'/'desc' helpers
    orderBy: (posts, { asc, desc }) =>
      sort === "oldest" ? [asc(posts.createdAt)] : [desc(posts.createdAt)],
  });

  // Handle "Most Popular" (Sort by reaction)
  if (sort === "popular") {
    allPosts.sort((a, b) => b.reactions.length - a.reactions.length);
  }

  if (allPosts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center animate-in fade-in zoom-in duration-500">
        {/* Icon Container */}
        <div className="bg-gray-100 p-4 rounded-full mb-6">
          <BusFront className="w-8 h-8 text-gray-600" />
        </div>

        {/* Headline */}
        <h3 className="font-playfair-display text-2xl md:text-3xl font-bold text-gray-900 mb-3">
          The route is empty
        </h3>

        {/* Subtext */}
        <p className="text-gray-500 max-w-md mx-auto mb-8 leading-relaxed">
          No stories have been posted yet.
        </p>

        {/* Call to Action */}
        {userId && (
          <Button
            asChild
            className="border rounded-lg border-black px-8 bg-white text-black hover:bg-gray-800 hover:text-white transition-all"
          >
            <Link href="/write">Share your journey</Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {allPosts.map((post) => (
        <div key={post.id} className="relative group h-full">
          {/* Card Component */}
          <PostCard
            post={post}
            currentUserId={userId}
            postAuthorId={post.authorId}
            source="home"
          />

          {/* Edit/Delete Options (Only visible to Author) */}
          {userId === post.authorId && (
            <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full shadow-sm">
              <PostOptions
                postId={post.id}
                slug={post.slug}
                authorId={post.authorId}
                currentUserId={userId}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// MAIN PAGE COMPONENT
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const session = await auth();
  const userId = session?.user?.id;

  // Next.js 15: Await searchParams
  const { sort } = await searchParams;
  const currentSort = sort || "newest";

  return (
    <div className="flex-1 container mx-auto py-10 px-4">
      {/* Header Section */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4 font-playfair-display">
          Blog Posts
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover the latest commute stories and practical tips. From your
          daily route to hidden shortcuts, stay updated with real stories from
          fellow Filipino commuters.
        </p>
      </div>

      {/* Filter Tabs */}
      <PostFilter />

      {/* Post Grid with Suspense */}
      <Suspense
        key={`${userId}-${currentSort}`} // Force re-render on sort or login change
        fallback={<PostGridSkeleton />}
      >
        <LatestPostsList sort={currentSort} />
      </Suspense>
    </div>
  );
}
