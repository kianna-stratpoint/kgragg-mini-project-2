import { db } from "@/db";
import { posts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { PostOptions } from "@/components/posts/PostOptions";
import { BackLink } from "@/components/layout/BackLink";
// 1. IMPORT THE COMMENT SIDEBAR
import { CommentSidebar } from "@/components/comments/CommentSidebar";

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const session = await auth();
  const { slug } = await params;

  // 2. UPDATE QUERY TO FETCH COMMENTS
  const post = await db.query.posts.findFirst({
    where: eq(posts.slug, slug),
    with: {
      author: true,
      comments: {
        with: { author: true }, // We need the comment author info
        orderBy: (comments, { desc }) => [desc(comments.createdAt)], // Newest first
      },
    },
  });

  if (!post) {
    notFound();
  }

  return (
    <article className="min-h-screen bg-white pb-20">
      {/* Header / Hero Section */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-6">
            <BackLink />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold font-playfair-display text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center justify-between border-y py-6">
            <div className="flex items-center gap-3">
              <UserAvatar
                user={{
                  name: `${post.author.firstName} ${post.author.lastName}`,
                  image: post.author.image,
                }}
                className="h-10 w-10"
              />
              <div>
                <p className="font-medium text-gray-900">
                  {post.author.firstName} {post.author.lastName}
                </p>
                <p className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(post.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* 3. ADD THE COMMENT SIDEBAR HERE */}
              <CommentSidebar
                postId={post.id}
                slug={post.slug}
                comments={post.comments}
                currentUserId={session?.user?.id}
              />

              <Button variant="ghost" size="sm" className="text-gray-500">
                Share
              </Button>

              <PostOptions
                postId={post.id}
                slug={post.slug}
                authorId={post.authorId}
                currentUserId={session?.user?.id}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        {post.imageUrl && (
          <div className="relative w-full aspect-video mb-10 rounded-xl overflow-hidden shadow-sm">
            <Image
              src={post.imageUrl}
              alt={post.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}

        <div className="prose prose-lg prose-gray max-w-none">
          <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">
            {post.content}
          </p>
        </div>
      </div>
    </article>
  );
}
