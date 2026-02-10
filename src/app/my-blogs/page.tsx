import { auth } from "@/auth";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/posts/PostCard";
import { PostOptions } from "@/components/posts/PostOptions";

export default async function MyBlogsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/");
  }

  const user = session.user;

  // 1. Fetch posts (filtering only by this user)
  const userPosts = await db.query.posts.findMany({
    where: eq(posts.authorId, userId),
    with: {
      author: true,
      reactions: true,
      comments: {
        with: { author: true },
        orderBy: (comments, { desc }) => [desc(comments.createdAt)],
      },
    },
    orderBy: [desc(posts.createdAt)],
  });

  // 2. Calculate Stats
  const totalPosts = userPosts.length;
  const totalLikes = userPosts.reduce(
    (acc, post) => acc + post.reactions.length,
    0,
  );
  const totalComments = userPosts.reduce(
    (acc, post) => acc + post.comments.length,
    0,
  );

  return (
    <div className="flex-1 container mx-auto py-10 px-4">
      {/* --- Header Section (Name & Stats) --- */}
      <div className="flex flex-col items-center text-center mb-16 space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold font-playfair-display text-gray-900">
          {user?.name}
        </h1>

        {/* Stats Row */}
        <div className="flex items-center justify-center gap-8 md:gap-16 border-b border-gray-100 py-6 w-full max-w-2xl">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-gray-900">
              {totalPosts}
            </span>
            <span className="text-xs uppercase tracking-widest text-gray-500 font-medium">
              Posts
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-gray-900">
              {totalLikes}
            </span>
            <span className="text-xs uppercase tracking-widest text-gray-500 font-medium">
              Likes
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-gray-900">
              {totalComments}
            </span>
            <span className="text-xs uppercase tracking-widest text-gray-500 font-medium">
              Comments
            </span>
          </div>
        </div>
      </div>

      {/* --- Content Section --- */}
      {userPosts.length === 0 ? (
        // Empty State
        <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
          <p className="text-lg text-black mb-6">
            You haven&apos;t written any blogs yet.
          </p>
          <Button
            asChild
            className="border border-black bg-white hover:bg-black text-black hover:text-white sm:text-sm lg:text-lg py-6"
          >
            <Link href="/write">Start writing</Link>
          </Button>
        </div>
      ) : (
        // Grid State using PostCard
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userPosts.map((post) => (
            <div key={post.id} className="relative group">
              {/* 1. The Reused Card Component */}
              <div className="h-full">
                {/* Passed currentUserId so comments sidebar works here too */}
                <PostCard post={post} currentUserId={userId} />
              </div>

              {/* 2. The Edit/Delete Menu (Overlay) */}
              <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full shadow-sm">
                <PostOptions
                  postId={post.id}
                  slug={post.slug}
                  authorId={post.authorId}
                  currentUserId={userId}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
