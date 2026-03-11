"use client";

import { Button } from "@/components/ui/button";
import { UserAvatarLink } from "@/components/UserAvatar";
import { toggleFollow } from "@/actions/user.action";
import toast from "react-hot-toast";
import Link from "next/link";

export interface FollowingUser {
  id: string;
  name: string | null;
  username: string;
  image: string | null;
}

interface FollowingListProps {
  following: FollowingUser[];
  isOwnProfile: boolean;
}

export function FollowingList({ following, isOwnProfile }: FollowingListProps) {
  const handleUnfollow = async (followedId: string, followedUsername: string) => {
    try {
      await toggleFollow(followedId);
      toast.success(`Unfollowed @${followedUsername}`);
    } catch {
      toast.error("Failed to unfollow");
    }
  };

  if (following.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Not following anyone yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {following.map((followed) => (
        <FollowingCard
          key={followed.id}
          followed={followed}
          isOwnProfile={isOwnProfile}
          onUnfollow={handleUnfollow}
        />
      ))}
    </div>
  );
}

interface FollowingCardProps {
  followed: FollowingUser;
  isOwnProfile: boolean;
  onUnfollow: (id: string, username: string) => void;
}

function FollowingCard({ followed, isOwnProfile, onUnfollow }: FollowingCardProps) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 border rounded-xl bg-white dark:bg-[#0a0a0a] border-neutral-200 dark:border-neutral-800">
      <div className="flex items-center gap-4">
        <UserAvatarLink
          username={followed.username}
          image={followed.image}
          size="md"
        />
        <div>
          <Link
            href={`/profile/${encodeURIComponent(followed.username)}`}
            className="font-semibold text-black dark:text-white hover:underline block"
          >
            {followed.name ?? followed.username}
          </Link>
          <Link
            href={`/profile/${encodeURIComponent(followed.username)}`}
            className="text-sm text-muted-foreground hover:underline block"
          >
            @{followed.username}
          </Link>
        </div>
      </div>
      {isOwnProfile && (
        <Button
          variant="ghost"
          size="sm"
          className="border border-neutral-300 dark:border-neutral-700 text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          onClick={() => onUnfollow(followed.id, followed.username)}
        >
          Unfollow
        </Button>
      )}
    </div>
  );
}
