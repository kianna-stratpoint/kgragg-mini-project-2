import { db } from "@/db";
import { posts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { auth } from "@/auth";
import { PostOptions } from "@/components/posts/PostOptions";
import { BackLink } from "@/components/layout/BackLink";
import { CommentSidebar } from "@/components/comments/CommentSidebar";
import { ReactionButton } from "@/components/reaction/ReactionButton";
import { ShareButton } from "@/components/posts/ShareButton";
import { Suspense } from "react";
import sanitizeHtml from "sanitize-html";
import { type Metadata } from "next";

// HELPER FUNCTION (Calculate Read Time)
function calculateReadTime(htmlContent: string) {
  const wordsPerMinute = 200;
  const text = sanitizeHtml(htmlContent, { allowedTags: [] });
  const words = (text || "").trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;

  const post = await db.query.posts.findFirst({
    where: eq(posts.slug, slug),
    with: { author: true },
  });

  if (!post) {
    return {
      title: "Post Not Found",
      description: "The blog post you are looking for does not exist.",
    };
  }

  // Create a clean description by stripping HTML
  const cleanDescription = sanitizeHtml(post.content, { allowedTags: [] })
    .slice(0, 160)
    .trim();

  return {
    title: post.title,
    description: cleanDescription,
    openGraph: {
      title: post.title,
      description: cleanDescription,
      type: "article",
      publishedTime: post.createdAt.toISOString(),
      authors: [`${post.author.firstName} ${post.author.lastName}`],
      // Only add image if one exists
      images: post.imageUrl ? [{ url: post.imageUrl }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: cleanDescription,
      images: post.imageUrl ? [post.imageUrl] : [],
    },
  };
}
// --------------------------------

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const session = await auth();
  const userId = session?.user?.id;
  const { slug } = await params;

  const post = await db.query.posts.findFirst({
    where: eq(posts.slug, slug),
    with: {
      author: true,
      comments: {
        with: { author: true },
        orderBy: (comments, { desc }) => [desc(comments.createdAt)],
      },
      reactions: true,
    },
  });

  if (!post) {
    notFound();
  }

  // CALCULATE READ TIME
  const readTime = calculateReadTime(post.content);

  const createdDate = new Date(post.createdAt);
  const updatedDate = new Date(post.updatedAt);
  const isEdited = updatedDate.getTime() > createdDate.getTime() + 60 * 1000;

  const userHasLiked = userId
    ? post.reactions.some((r) => r.userId === userId)
    : false;

  return (
    <article className="min-h-screen bg-white pb-20">
      {/* Header / Hero Section */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-6">
            <Suspense
              fallback={
                <div className="h-6 w-24 bg-gray-100 animate-pulse rounded" />
              }
            >
              <BackLink />
            </Suspense>
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
                <p className="font-medium text-gray-900 mb-0.5">
                  {post.author.firstName} {post.author.lastName}
                </p>

                <div className="text-xs sm:text-sm text-gray-500 flex flex-wrap items-center gap-x-2">
                  <time
                    dateTime={post.createdAt.toString()}
                    className="whitespace-nowrap"
                  >
                    {formatDistanceToNow(createdDate, {
                      addSuffix: true,
                    })}
                  </time>

                  {isEdited && (
                    <span className="text-gray-400 whitespace-nowrap italic">
                      (Updated{" "}
                      {formatDistanceToNow(updatedDate, {
                        addSuffix: true,
                      })}
                      )
                    </span>
                  )}

                  <span className="text-gray-300">•</span>

                  <span className="whitespace-nowrap">{readTime} min read</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ReactionButton
                postId={post.id}
                slug={post.slug}
                initialCount={post.reactions.length}
                initialUserHasLiked={userHasLiked}
                isLoggedIn={!!userId}
              />

              <CommentSidebar
                postId={post.id}
                slug={post.slug}
                comments={post.comments}
                currentUserId={session?.user?.id}
                postAuthorId={post.authorId}
              />

              <ShareButton slug={post.slug} title={post.title} />

              <PostOptions
                postId={post.id}
                slug={post.slug}
                authorId={post.authorId}
                currentUserId={userId}
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

        <div
          className="prose prose-lg prose-gray max-w-none 
          prose-headings:font-playfair-display prose-headings:font-bold 
          prose-a:text-blue-600 hover:prose-a:underline prose-img:rounded-xl
          prose-p:leading-normal
          prose-p:my-2
          [&_p:empty]:min-h-[1em]"
        >
          <div
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(post.content, {
                allowedTags: [
                  "p",
                  "br",
                  "strong",
                  "em",
                  "u",
                  "h1",
                  "h2",
                  "h3",
                  "ul",
                  "ol",
                  "li",
                  "blockquote",
                  "code",
                  "pre",
                  "img",
                  "a",
                  "span",
                  "div",
                ],
                allowedAttributes: {
                  a: ["href", "target", "rel"],
                  img: ["src", "alt", "title", "width", "height"],
                  "*": ["class", "style"],
                },
              }),
            }}
          />
        </div>
      </div>
    </article>
  );
}
