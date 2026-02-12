import { auth } from "@/auth";
import { db } from "@/db";
import { posts, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/posts/PostCard";
import { PostOptions } from "@/components/posts/PostOptions";
import { AvatarUploader } from "@/components/ui/avatar-upload";
import { Suspense } from "react";
import { PostGridSkeleton, StatsSkeleton } from "@/components/ui/skeletons";
import { PostFilter } from "@/components/posts/PostFilter";
import { NotebookPen } from "lucide-react";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const session = await auth();
  if (!session?.user) return { title: "My Stories" };

  return {
    title: `${session.user.name || "User"}'s Stories`,
    description: "Manage your published stories and view your stats.",
  };
}

async function UserContent({ userId, sort }: { userId: string; sort: string }) {
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
    // Callback style for sorting
    orderBy: (posts, { asc, desc }) =>
      sort === "oldest" ? [asc(posts.createdAt)] : [desc(posts.createdAt)],
  });

  if (sort === "popular") {
    userPosts.sort((a, b) => b.reactions.length - a.reactions.length);
  }

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
    <>
      <div className="flex items-center justify-center gap-8 md:gap-16 border-b border-gray-100 py-6 w-full max-w-2xl mb-16">
        <StatItem count={totalPosts} label="Posts" />
        <StatItem count={totalLikes} label="Likes" />
        <StatItem count={totalComments} label="Comments" />
      </div>

      <div className="w-full">
        <PostFilter />
      </div>

      {userPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
          <div className="bg-gray-50 p-6 rounded-full mb-6 border border-gray-100">
            <NotebookPen className="w-8 h-8 text-gray-800" strokeWidth={1.25} />
          </div>
          <h3 className="font-playfair-display text-3xl font-bold text-gray-900 mb-3">
            Your story awaits
          </h3>

          <p className="text-gray-500 max-w-md mx-auto mb-8 leading-relaxed">
            You haven&apos;t published any commute stories yet. Document your
            daily route, share a tip, or rant about the traffic.
          </p>

          <Button
            asChild
            className="border border-black bg-white hover:bg-black text-black hover:text-white py-5"
          >
            <Link href="/write">Start writing</Link>
          </Button>
        </div>
      ) : (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userPosts.map((post) => (
            <div key={post.id} className="relative group h-full">
              <div className="h-full">
                <PostCard
                  post={post}
                  currentUserId={userId}
                  source="my-blogs"
                  postAuthorId={post.authorId}
                />
              </div>
              <div className="absolute top-3 right-3 z-10 opacity-0 rounded-full group-hover:opacity-100 transition-opacity bg-white shadow-sm">
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
    </>
  );
}

function StatItem({ count, label }: { count: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-2xl font-bold text-gray-900">{count}</span>
      <span className="text-xs uppercase tracking-widest text-gray-500 font-medium">
        {label}
      </span>
    </div>
  );
}

function UserContentLoading() {
  return (
    <div className="w-full flex flex-col items-center">
      <StatsSkeleton />
      <div className="w-full mt-10">
        <PostGridSkeleton />
      </div>
    </div>
  );
}

export default async function MyBlogsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/");

  const { sort } = await searchParams;
  const currentSort = sort || "newest";

  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  const dbUserName = dbUser ? `${dbUser.firstName} ${dbUser.lastName}` : null;
  const displayName = dbUserName || session?.user?.name || "User";

  const rawImage = dbUser?.image || session?.user?.image;

  const displayImage = rawImage?.trim() ? rawImage : null;

  return (
    <div className="flex-1 container mx-auto py-10 px-4">
      <div className="flex flex-col items-center">
        <div className="mb-2">
          <AvatarUploader
            user={{ id: userId, name: displayName, image: displayImage }}
          />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold font-playfair-display text-gray-900 mb-6">
          {displayName}
        </h1>

        <Suspense key={currentSort} fallback={<UserContentLoading />}>
          <UserContent userId={userId} sort={currentSort} />
        </Suspense>
      </div>
    </div>
  );
}
