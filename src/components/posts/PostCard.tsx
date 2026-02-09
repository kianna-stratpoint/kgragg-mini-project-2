import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns"; // Optional: for "2 hours ago"
import { UserAvatar } from "../auth/UserAvatar";
// If you don't have date-fns, you can just use new Date(date).toLocaleDateString()

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
  };
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow h-full"
    >
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
          /* Fallback Gradient if no image */
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

        {/* Footer: Author & Date */}
        <div className="flex items-center gap-2 mt-auto text-xs text-gray-500 border-t pt-4">
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
      </div>
    </Link>
  );
}
