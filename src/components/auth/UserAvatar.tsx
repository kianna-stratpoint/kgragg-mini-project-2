import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  user: {
    name?: string | null;
    image?: string | null;
  };
  className?: string;
}

export function UserAvatar({ user, className }: UserAvatarProps) {
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  const safeImage = user.image?.trim() ? user.image : null;

  return (
    <Avatar className={cn("h-10 w-10", className)}>
      {safeImage ? (
        <AvatarImage
          src={safeImage}
          alt={user.name || "User"}
          className="object-cover h-full w-full"
        />
      ) : (
        <AvatarFallback className="bg-black text-white">
          {initials}
        </AvatarFallback>
      )}
    </Avatar>
  );
}
