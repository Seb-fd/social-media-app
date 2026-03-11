"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import toast from "react-hot-toast";
import { getDbUserId, toggleFollow } from "@/actions/user.action";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { EditProfileDialog } from "@/components/profile/EditProfileDialog";
import type { User, Post } from "@/types";

interface ProfilePageClientProps {
  user: User;
  initialPosts: Post[];
  initialLikedPosts: Post[];
  isFollowing: boolean;
  currentUserFollowingIds: string[];
}

export default function ProfilePageClient({
  isFollowing: initialIsFollowing,
  initialLikedPosts,
  initialPosts,
  user,
  currentUserFollowingIds = [],
}: ProfilePageClientProps) {
  const { user: currentUser } = useUser();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);
  const [dbUserId, setDbUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("posts");

  useEffect(() => {
    const fetchDbUserId = async () => {
      if (currentUser) {
        const id = await getDbUserId();
        setDbUserId(id);
      }
    };

    fetchDbUserId();
  }, [currentUser]);

  const isOwnProfile =
    currentUser?.username === user.username ||
    currentUser?.emailAddresses[0].emailAddress.split("@")[0] === user.username;

  const handleFollow = async () => {
    if (!currentUser) return;

    try {
      setIsUpdatingFollow(true);
      await toggleFollow(user.id);
      const newState = !isFollowing;
      setIsFollowing(newState);
      toast.success(
        newState
          ? `You are now following @${user.username}`
          : `You unfollowed @${user.username}`,
      );
    } catch (error) {
      toast.error("Failed to update follow status");
    } finally {
      setIsUpdatingFollow(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="grid grid-cols-1 gap-6">
        <div className="w-full max-w-lg mx-auto">
          <Card className="bg-card">
            <CardContent className="pt-6">
              <ProfileHeader
                user={user}
                isOwnProfile={!!isOwnProfile}
                isFollowing={isFollowing}
                isUpdatingFollow={isUpdatingFollow}
                isLoggedIn={!!dbUserId}
                onFollow={handleFollow}
                onEdit={() => setShowEditDialog(true)}
                onTabChange={dbUserId ? setActiveTab : undefined}
              />
            </CardContent>
          </Card>
        </div>

        {dbUserId === null ? (
          <Card className="bg-card">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Log in to follow @{user.username} and see their posts.
                </p>
                <div className="flex justify-center gap-4">
                  <SignInButton mode="modal">
                    <Button variant="outline">Log In</Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button>Sign Up</Button>
                  </SignUpButton>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <ProfileTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            user={user}
            dbUserId={dbUserId}
            currentUserFollowingIds={currentUserFollowingIds}
            isOwnProfile={!!isOwnProfile}
            initialPosts={initialPosts}
            initialLikedPosts={initialLikedPosts}
          />
        )}

        <EditProfileDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          user={user}
        />
      </div>
    </div>
  );
}
