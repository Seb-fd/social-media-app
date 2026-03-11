"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserAvatarLink } from "@/components/UserAvatar";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { format } from "date-fns";
import { CalendarIcon, EditIcon, MapPinIcon, LinkIcon } from "lucide-react";
import { ProfileStats } from "./ProfileStats";
import type { User } from "@/types";

interface ProfileHeaderProps {
  user: User;
  isOwnProfile: boolean;
  isFollowing: boolean;
  isUpdatingFollow: boolean;
  isLoggedIn: boolean;
  onFollow: () => void;
  onEdit: () => void;
  onTabChange?: (tab: string) => void;
}

export function ProfileHeader({
  user,
  isOwnProfile,
  isFollowing,
  isUpdatingFollow,
  isLoggedIn,
  onFollow,
  onEdit,
  onTabChange,
}: ProfileHeaderProps) {
  const formattedDate = format(new Date(user.createdAt), "MMMM yyyy");

  return (
    <div className="flex flex-col items-center text-center">
      <UserAvatarLink username={user.username} image={user.image} size="lg" />
      <h1 className="mt-4 text-2xl font-bold">{user.name ?? user.username}</h1>
      <p className="text-muted-foreground">@{user.username}</p>
      <p className="mt-2 text-sm">{user.bio}</p>

      <ProfileStats user={user} onTabChange={onTabChange} />

      <ProfileActions
        username={user.username}
        isOwnProfile={isOwnProfile}
        isFollowing={isFollowing}
        isUpdatingFollow={isUpdatingFollow}
        isLoggedIn={isLoggedIn}
        onFollow={onFollow}
        onEdit={onEdit}
      />

      <ProfileInfo user={user} formattedDate={formattedDate} />
    </div>
  );
}

interface ProfileActionsProps {
  isOwnProfile: boolean;
  isFollowing: boolean;
  isUpdatingFollow: boolean;
  isLoggedIn: boolean;
  username: string;
  onFollow: () => void;
  onEdit: () => void;
}

function ProfileActions({
  isOwnProfile,
  isFollowing,
  isUpdatingFollow,
  isLoggedIn,
  username,
  onFollow,
  onEdit,
}: ProfileActionsProps) {
  const [showLoginOptions, setShowLoginOptions] = useState(false);

  const handleFollowClick = () => {
    if (isLoggedIn) {
      onFollow();
    } else {
      setShowLoginOptions(true);
    }
  };

  if (isOwnProfile) {
    return (
      <Button className="w-full mt-4" onClick={onEdit}>
        <EditIcon className="size-4 mr-2" />
        Edit Profile
      </Button>
    );
  }

  if (showLoginOptions) {
    return (
      <div className="w-full mt-4 space-y-2">
        <p className="text-sm text-muted-foreground">
          Log in to follow @{username}
        </p>
        <div className="flex gap-2">
          <SignInButton mode="modal">
            <Button variant="outline" className="flex-1">
              Log In
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button className="flex-1">
              Sign Up
            </Button>
          </SignUpButton>
        </div>
      </div>
    );
  }

  return (
    <Button
      className="w-full mt-4"
      onClick={handleFollowClick}
      disabled={isUpdatingFollow}
      variant={isFollowing ? "outline" : "default"}
    >
      {isFollowing ? "Unfollow" : "Follow"}
    </Button>
  );
}

function ProfileInfo({
  user,
  formattedDate,
}: {
  user: User;
  formattedDate: string;
}) {
  return (
    <div className="w-full mt-6 space-y-2 text-sm">
      {user.location && (
        <div className="flex items-center text-muted-foreground">
          <MapPinIcon className="size-4 mr-2" />
          {user.location}
        </div>
      )}
      {user.website && (
        <div className="flex items-center text-muted-foreground">
          <LinkIcon className="size-4 mr-2" />
          <a
            href={
              user.website.startsWith("http")
                ? user.website
                : `https://${user.website}`
            }
            className="hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {user.website}
          </a>
        </div>
      )}
      <div className="flex items-center text-muted-foreground">
        <CalendarIcon className="size-4 mr-2" />
        Joined {formattedDate}
      </div>
    </div>
  );
}
