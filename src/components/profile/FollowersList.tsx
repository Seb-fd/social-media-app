"use client";

import { Button } from "@/components/ui/button";
import { UserAvatar, UserAvatarLink } from "@/components/UserAvatar";
import { toggleFollow } from "@/actions/user.action";
import toast from "react-hot-toast";
import Link from "next/link";

export interface FollowerUser {
  id: string;
  name: string | null;
  username: string;
  image: string | null;
}

interface FollowersListProps {
  followers: FollowerUser[];
  dbUserId: string | null;
  currentUserFollowingIds: string[];
}

export function FollowersList({
  followers,
  dbUserId,
  currentUserFollowingIds,
}: FollowersListProps) {
  const handleFollow = async (followedId: string, followedUsername: string) => {
    try {
      await toggleFollow(followedId);
      toast.success(`You are now following @${followedUsername}`);
    } catch {
      toast.error("Failed to follow");
    }
  };

  const handleUnfollow = async (followedId: string, followedUsername: string) => {
    try {
      await toggleFollow(followedId);
      toast.success(`Unfollowed @${followedUsername}`);
    } catch {
      toast.error("Failed to unfollow");
    }
  };

  if (followers.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No followers yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {followers.map((follower) => {
        const isFollowing = currentUserFollowingIds.includes(follower.id);
        const isSelf = dbUserId !== null && follower.id === dbUserId;

        return (
          <FollowerCard
            key={follower.id}
            follower={follower}
            dbUserId={dbUserId}
            isSelf={isSelf}
            isFollowing={isFollowing}
            onFollow={handleFollow}
            onUnfollow={handleUnfollow}
          />
        );
      })}
    </div>
  );
}

interface FollowerCardProps {
  follower: FollowerUser;
  dbUserId: string | null;
  isSelf: boolean;
  isFollowing: boolean;
  onFollow: (id: string, username: string) => void;
  onUnfollow: (id: string, username: string) => void;
}

function FollowerCard({
  follower,
  dbUserId,
  isSelf,
  isFollowing,
  onFollow,
  onUnfollow,
}: FollowerCardProps) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 border rounded-xl bg-white dark:bg-[#0a0a0a] border-neutral-200 dark:border-neutral-800">
      <Link
        href={`/profile/${encodeURIComponent(follower.username)}`}
        className="flex items-center gap-4"
      >
        <UserAvatar image={follower.image} size="md" />
        <div>
          <div className="font-semibold text-black dark:text-white hover:underline block">
            {follower.name ?? follower.username}
          </div>
          <div className="text-sm text-muted-foreground hover:underline block">
            @{follower.username}
          </div>
        </div>
      </Link>
      {dbUserId && !isSelf && (
        isFollowing ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUnfollow(follower.id, follower.username)}
          >
            Unfollow
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={() => onFollow(follower.id, follower.username)}
          >
            Follow
          </Button>
        )
      )}
    </div>
  );
}
