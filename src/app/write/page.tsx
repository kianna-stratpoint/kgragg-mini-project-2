import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PostForm } from "@/components/posts/PostForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "shortcut | Write a Story",
  description: "Share your commute experience with the community.",
};

export default async function WritePage() {
  const session = await auth();
  if (!session?.user) redirect("/");

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <PostForm />
    </div>
  );
}
