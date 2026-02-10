"use client";

import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { UserAvatar } from "../auth/UserAvatar";
import { CommentSidebar } from "../comments/CommentSidebar";
import { ReactionButton } from "../reaction/ReactionButton";

interface CommentWithAuthor {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    image?: string | null;
  };
}

interface PostCardProps {
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    imageUrl?: string | null;
    createdAt: Date;
    author: {
      firstName: string;
      lastName: string;
      image?: string | null;
    };
    comments?: CommentWithAuthor[];
    reactions: { userId: string }[];
  };
  currentUserId?: string;
}

export function PostCard({ post, currentUserId }: PostCardProps) {
  const reactions = post.reactions || [];
  const userHasLiked = currentUserId
    ? reactions.some((r) => r.userId === currentUserId)
    : false;

  return (
    <div className="group flex flex-col bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow h-full relative">
      {/* WRAPPER LINK: Wraps image and text only */}
      <Link href={`/blog/${post.slug}`} className="flex-col flex flex-1">
        {/* Image Section */}
        <div className="h-48 w-full bg-gray-100 relative overflow-hidden">
          {post.imageUrl ? (
            <Image
              src={post.imageUrl}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400">
              <span className="text-sm">No Image</span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-5 flex flex-col flex-1">
          <h3 className="text-2xl font-bold font-playfair-display mb-2 group-hover:line-clamp-2">
            {post.title}
          </h3>

          <p className="text-gray-600 text-base mb-4 line-clamp-3 flex-1">
            {post.excerpt}
          </p>
        </div>
      </Link>

      {/* Footer: Author & Date & ACTIONS */}
      <div className="px-5 pb-5 flex items-center justify-between text-xs text-gray-500 border-t pt-4 mt-auto">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
            <UserAvatar
              user={{
                name: `${post.author.firstName} ${post.author.lastName}`,
                image: post.author.image,
              }}
              className="h-6 w-6"
            />
          </div>
          <span className="font-medium">
            {post.author.firstName} {post.author.lastName}
          </span>
          <span>•</span>
          <time>
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </time>
        </div>

        {/* LIKE AND COMMENT */}
        <div className="z-20 relative flex items-center gap-1">
          <ReactionButton
            postId={post.id}
            slug={post.slug}
            initialCount={reactions.length}
            initialUserHasLiked={userHasLiked}
            isLoggedIn={!!currentUserId}
          />

          <CommentSidebar
            postId={post.id}
            slug={post.slug}
            comments={post.comments || []}
            currentUserId={currentUserId}
          />
        </div>
      </div>
    </div>
  );
}
