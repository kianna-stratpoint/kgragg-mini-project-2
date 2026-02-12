import { auth } from "@/auth";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { PostForm } from "@/components/posts/PostForm";
import { Metadata } from "next";

interface EditPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: EditPostPageProps): Promise<Metadata> {
  const { slug } = await params;

  const post = await db.query.posts.findFirst({
    where: eq(posts.slug, slug),
    columns: { title: true },
  });

  if (!post) return { title: "Post Not Found" };

  return {
    title: `Edit: ${post.title}`,
    description: `Editing post: ${post.title}`,
  };
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/");

  const { slug } = await params;

  // Fetch the existing post
  const post = await db.query.posts.findFirst({
    where: eq(posts.slug, slug),
  });

  if (!post) notFound();

  // Security Check: Ensure the logged-in user is the author
  if (post.authorId !== session.user.id) {
    redirect("/");
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      {/* Pass existing data to the form */}
      <PostForm
        initialData={{
          id: post.id,
          title: post.title,
          content: post.content,
          imageUrl: post.imageUrl || "",
        }}
        isEditing={true}
      />
    </div>
  );
}
