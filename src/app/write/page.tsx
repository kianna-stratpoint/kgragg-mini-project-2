import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PostForm } from "@/components/posts/PostForm";

export default async function WritePage() {
  const session = await auth();
  if (!session?.user) redirect("/");

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <PostForm />
    </div>
  );
}
