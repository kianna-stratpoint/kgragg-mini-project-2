import { auth } from "@/auth";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { PostForm } from "@/components/posts/PostForm";

interface EditPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/");

  const { slug } = await params;

  // 1. Fetch the existing post
  const post = await db.query.posts.findFirst({
    where: eq(posts.slug, slug),
  });

  if (!post) notFound();

  // 2. Security Check: Ensure the logged-in user is the author
  if (post.authorId !== session.user.id) {
    redirect("/"); // Or show an unauthorized error
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      {/* 3. Pass existing data to the form */}
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
