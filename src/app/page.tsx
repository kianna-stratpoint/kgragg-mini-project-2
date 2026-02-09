import { auth } from "@/auth";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { desc } from "drizzle-orm";
import { PostCard } from "@/components/posts/PostCard";
import Link from "next/link";

export default async function Home() {
  const session = await auth();
  const user = session?.user;

  // Used db.query to easily include the author relation
  const allPosts = await db.query.posts.findMany({
    orderBy: [desc(posts.createdAt)],
    with: {
      author: true, // fetches the author details for each post automatically
    },
  });
  return (
    <div className="flex-1 container mx-auto py-10 px-4">
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

      {/* 2. Render Posts Grid */}
      {allPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        /* Empty State if DB is empty */
        <div className="text-center py-20 bg-white rounded-lg border-2 border-dashed">
          <p className="text-gray-600 mb-4">No stories yet.</p>
          {user && (
            <Link
              href="/write"
              className="text-blue-600 hover:underline font-medium"
            >
              Be the first to share your commute story!
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
