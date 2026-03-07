import Link from "next/link";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

interface UserAvatarProps {
  username: string;
  image: string | null | undefined;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-20 h-20",
};

/* Avatar SOLO visual */

export function UserAvatar({
  image,
  size = "md",
  className = "",
}: Omit<UserAvatarProps, "username">) {
  return (
    <Avatar
      className={`${sizeClasses[size]} hover:opacity-80 transition ${className}`}
    >
      <AvatarImage src={image ?? "/avatar.png"} />
    </Avatar>
  );
}

export function UserAvatarLink({
  username,
  image,
  size = "md",
  className = "",
}: UserAvatarProps) {
  return (
    <Link href={`/profile/${username}`}>
      <UserAvatar image={image} size={size} className={className} />
    </Link>
  );
}
