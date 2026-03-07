"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { format } from "date-fns";
import {
  CalendarIcon,
  EditIcon,
  FileTextIcon,
  HeartIcon,
  LinkIcon,
  MapPinIcon,
  UserCheckIcon,
  UsersIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { UploadButton } from "@/lib/uploadthing";
import {
  getProfileByUsername,
  getUserPosts,
  updateProfile,
} from "@/actions/profile.action";
import { getDbUserId, toggleFollow } from "@/actions/user.action";
import PostCard from "@/components/PostCard";
import { UserAvatar, UserAvatarLink } from "@/components/UserAvatar";

type User = NonNullable<Awaited<ReturnType<typeof getProfileByUsername>>>;
type Posts = Awaited<ReturnType<typeof getUserPosts>>;

interface ProfilePageClientProps {
  user: NonNullable<User> & {
    followers: {
      id: string;
      name: string | null;
      username: string;
      image: string | null;
    }[];
    following: {
      id: string;
      name: string | null;
      username: string;
      image: string | null;
    }[];
  };
  posts: Posts;
  likedPosts: Posts;
  isFollowing: boolean;
  currentUserFollowingIds: string[];
}

export default function ProfilePageClient({
  isFollowing: initialIsFollowing,
  likedPosts,
  posts,
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

  if (dbUserId === null) {
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
                  onFollow={handleFollow}
                  onEdit={() => setShowEditDialog(true)}
                  dbUserId={dbUserId}
                  currentUser={currentUser}
                  onTabChange={setActiveTab}
                />
              </CardContent>
            </Card>
          </div>
          <Card className="bg-card">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Log in to follow {user.name ?? user.username} and see their
                  posts.
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
        </div>
      </div>
    );
  }

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
                onFollow={handleFollow}
                onEdit={() => setShowEditDialog(true)}
                dbUserId={dbUserId}
                currentUser={currentUser}
                onTabChange={setActiveTab}
              />
            </CardContent>
          </Card>
        </div>

        <ProfileTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          posts={posts}
          likedPosts={likedPosts}
          user={user}
          dbUserId={dbUserId}
          currentUserFollowingIds={currentUserFollowingIds}
          isOwnProfile={!!isOwnProfile}
        />

        <EditProfileDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          user={user}
        />
      </div>
    </div>
  );
}

function ProfileHeader({
  user,
  isOwnProfile,
  isFollowing,
  isUpdatingFollow,
  onFollow,
  onEdit,
  dbUserId,
  currentUser,
  onTabChange,
}: {
  user: ProfilePageClientProps["user"];
  isOwnProfile: boolean;
  isFollowing: boolean;
  isUpdatingFollow: boolean;
  onFollow: () => void;
  onEdit: () => void;
  dbUserId: string | null;
  currentUser: any;
  onTabChange: (tab: string) => void;
}) {
  const formattedDate = format(new Date(user.createdAt), "MMMM yyyy");

  return (
    <div className="flex flex-col items-center text-center">
      <UserAvatarLink username={user.username} image={user.image} size="lg" />
      <h1 className="mt-4 text-2xl font-bold">{user.name ?? user.username}</h1>
      <p className="text-muted-foreground">@{user.username}</p>
      <p className="mt-2 text-sm">{user.bio}</p>

      <ProfileStats user={user} onTabChange={onTabChange} />

      {!currentUser ? (
        <SignInButton mode="modal">
          <Button className="w-full mt-4">Follow</Button>
        </SignInButton>
      ) : isOwnProfile ? (
        <Button className="w-full mt-4" onClick={onEdit}>
          <EditIcon className="size-4 mr-2" />
          Edit Profile
        </Button>
      ) : (
        <Button
          className="w-full mt-4"
          onClick={onFollow}
          disabled={isUpdatingFollow}
          variant={isFollowing ? "outline" : "default"}
        >
          {isFollowing ? "Unfollow" : "Follow"}
        </Button>
      )}

      <ProfileInfo user={user} formattedDate={formattedDate} />
    </div>
  );
}

function ProfileStats({
  user,
  onTabChange,
}: {
  user: ProfilePageClientProps["user"];
  onTabChange: (tab: string) => void;
}) {
  return (
    <div className="flex justify-center items-center space-x-8 mb-4">
      <button
        onClick={() => onTabChange("following")}
        className="flex flex-col items-center text-center hover:underline focus:outline-none"
      >
        <div className="font-semibold">
          {user._count.following.toLocaleString()}
        </div>
        <div className="text-sm text-muted-foreground">Following</div>
      </button>

      <div className="h-6 w-px bg-muted" />

      <button
        onClick={() => onTabChange("followers")}
        className="flex flex-col items-center text-center hover:underline focus:outline-none"
      >
        <div className="font-semibold">
          {user._count.followers.toLocaleString()}
        </div>
        <div className="text-sm text-muted-foreground">Followers</div>
      </button>

      <div className="h-6 w-px bg-muted" />

      <button
        onClick={() => onTabChange("posts")}
        className="flex flex-col items-center text-center hover:underline focus:outline-none"
      >
        <div className="font-semibold">
          {user._count.posts.toLocaleString()}
        </div>
        <div className="text-sm text-muted-foreground">Posts</div>
      </button>
    </div>
  );
}

function ProfileInfo({
  user,
  formattedDate,
}: {
  user: ProfilePageClientProps["user"];
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

function ProfileTabs({
  activeTab,
  onTabChange,
  posts,
  likedPosts,
  user,
  dbUserId,
  currentUserFollowingIds,
  isOwnProfile,
}: {
  activeTab: string;
  onTabChange: (value: string) => void;
  posts: Posts;
  likedPosts: Posts;
  user: ProfilePageClientProps["user"];
  dbUserId: string;
  currentUserFollowingIds: string[];
  isOwnProfile: boolean;
}) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="w-full flex justify-center border-b rounded-none h-auto p-0 bg-transparent overflow-x-auto whitespace-nowrap max-w-fit mx-auto scroll-smooth">
        <TabsTrigger
          value="posts"
          className="flex items-center gap-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 sm:px-4 py-2 text-sm sm:text-base font-medium shrink-0"
        >
          <FileTextIcon className="size-4" />
          Posts
        </TabsTrigger>
        <TabsTrigger
          value="likes"
          className="flex items-center gap-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 sm:px-4 py-2 text-sm sm:text-base font-medium shrink-0"
        >
          <HeartIcon className="size-4" />
          Likes
        </TabsTrigger>
        <TabsTrigger
          value="followers"
          className="flex items-center gap-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 sm:px-4 py-2 text-sm sm:text-base font-medium shrink-0"
        >
          <UsersIcon className="size-4" />
          Followers
        </TabsTrigger>
        <TabsTrigger
          value="following"
          className="flex items-center gap-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 sm:px-4 py-2 text-sm sm:text-base font-medium shrink-0"
        >
          <UserCheckIcon className="size-4" />
          Following
        </TabsTrigger>
      </TabsList>

      <TabsContent value="posts" className="mt-6">
        <ProfilePosts posts={posts} dbUserId={dbUserId} />
      </TabsContent>

      <TabsContent value="likes" className="mt-6">
        <ProfileLikes likedPosts={likedPosts} dbUserId={dbUserId} />
      </TabsContent>

      <TabsContent value="followers" className="mt-6">
        <FollowersList
          user={user}
          dbUserId={dbUserId}
          currentUserFollowingIds={currentUserFollowingIds}
          isOwnProfile={!!isOwnProfile}
        />
      </TabsContent>

      <TabsContent value="following" className="mt-6">
        <FollowingList
          user={user}
          dbUserId={dbUserId}
          isOwnProfile={!!isOwnProfile}
        />
      </TabsContent>
    </Tabs>
  );
}

function ProfilePosts({ posts, dbUserId }: { posts: Posts; dbUserId: string }) {
  return (
    <div className="space-y-6">
      {posts.length > 0 ? (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            dbUserId={dbUserId}
            isLikedByCurrentUser={post.likes.some(
              (like) => like.userId === dbUserId,
            )}
          />
        ))
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No posts yet
        </div>
      )}
    </div>
  );
}

function ProfileLikes({
  likedPosts,
  dbUserId,
}: {
  likedPosts: Posts;
  dbUserId: string;
}) {
  return (
    <div className="space-y-6">
      {likedPosts.length > 0 ? (
        likedPosts.map((post) => {
          const isLikedByCurrentUser = post.likes.some(
            (like) => like.userId === dbUserId,
          );

          return (
            <PostCard
              key={post.id}
              post={post}
              dbUserId={dbUserId}
              isLikedByCurrentUser={isLikedByCurrentUser}
            />
          );
        })
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No liked posts to show
        </div>
      )}
    </div>
  );
}

function FollowersList({
  user,
  dbUserId,
  currentUserFollowingIds,
  isOwnProfile,
}: {
  user: ProfilePageClientProps["user"];
  dbUserId: string;
  currentUserFollowingIds: string[];
  isOwnProfile: boolean;
}) {
  const handleFollow = async (followedId: string, followedUsername: string) => {
    try {
      await toggleFollow(followedId);
      toast.success(`You are now following @${followedUsername}`);
    } catch {
      toast.error("Failed to follow");
    }
  };

  const handleUnfollow = async (
    followedId: string,
    followedUsername: string,
  ) => {
    try {
      await toggleFollow(followedId);
      toast.success(`Unfollowed @${followedUsername}`);
    } catch {
      toast.error("Failed to unfollow");
    }
  };

  return (
    <div className="space-y-4">
      {user.followers.map((follower) => {
        const isFollowing = currentUserFollowingIds.includes(follower.id);
        const isSelf = dbUserId !== null && follower.id === dbUserId;

        return (
          <div
            key={follower.id}
            className="flex items-center justify-between gap-4 p-4 border rounded-xl bg-white dark:bg-[#0a0a0a] border-neutral-200 dark:border-neutral-800"
          >
            <Link
              href={`/profile/${follower.username}`}
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
            {dbUserId &&
              !isSelf &&
              (isFollowing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUnfollow(follower.id, follower.username)}
                >
                  Unfollow
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => handleFollow(follower.id, follower.username)}
                >
                  Follow
                </Button>
              ))}
          </div>
        );
      })}
    </div>
  );
}

function FollowingList({
  user,
  dbUserId,
  isOwnProfile,
}: {
  user: ProfilePageClientProps["user"];
  dbUserId: string;
  isOwnProfile: boolean;
}) {
  const handleUnfollow = async (
    followedId: string,
    followedUsername: string,
  ) => {
    try {
      await toggleFollow(followedId);
      toast.success(`Unfollowed @${followedUsername}`);
    } catch {
      toast.error("Failed to unfollow");
    }
  };

  return (
    <div className="space-y-4">
      {user.following.length > 0 ? (
        user.following.map((followed) => (
          <div
            key={followed.id}
            className="flex items-center justify-between gap-4 p-4 border rounded-xl bg-white dark:bg-[#0a0a0a] border-neutral-200 dark:border-neutral-800"
          >
            <div className="flex items-center gap-4">
              <UserAvatarLink
                username={followed.username}
                image={followed.image}
                size="md"
              />
              <div>
                <Link
                  href={`/profile/${followed.username}`}
                  className="font-semibold text-black dark:text-white hover:underline block"
                >
                  {followed.name ?? followed.username}
                </Link>
                <Link
                  href={`/profile/${followed.username}`}
                  className="text-sm text-muted-foreground hover:underline block"
                >
                  @{followed.username}
                </Link>
              </div>
            </div>
            {dbUserId === user.id && (
              <Button
                variant="ghost"
                size="sm"
                className="border border-neutral-300 dark:border-neutral-700 text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                onClick={async () => {
                  await handleUnfollow(followed.id, followed.username);
                }}
              >
                Unfollow
              </Button>
            )}
          </div>
        ))
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          Not following anyone yet
        </div>
      )}
    </div>
  );
}

function EditProfileDialog({
  open,
  onOpenChange,
  user,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: ProfilePageClientProps["user"];
}) {
  const { user: currentUser } = useUser();
  const [editForm, setEditForm] = useState({
    name: user.name || "",
    bio: user.bio || "",
    location: user.location || "",
    website: user.website || "",
  });

  const isValidURL = (url: string) => {
    const pattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[\w-]*)*\/?$/;
    return pattern.test(url);
  };

  const handleSubmit = async () => {
    const { name, bio, website } = editForm;

    if (name.length > 50) {
      toast.error("Name can not contain more than 50 characters.");
      return;
    }

    if (bio.length > 160) {
      toast.error("Bio can not contain more than 160 characters.");
      return;
    }

    if (website && !isValidURL(website)) {
      toast.error("The URL is not valid.");
      return;
    }

    const formData = new FormData();
    Object.entries(editForm).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const result = await updateProfile(formData);
    if (result.success) {
      onOpenChange(false);
      toast.success("Profile updated successfully.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Profile Image</Label>
            <UploadButton
              endpoint="profileImage"
              onClientUploadComplete={async (res) => {
                const imageUrl = res?.[0]?.url;
                if (!imageUrl) {
                  toast.error("Upload failed");
                  return;
                }

                try {
                  const blob = await fetch(imageUrl).then((r) => r.blob());
                  await currentUser?.setProfileImage({ file: blob });

                  await fetch("/api/profile/image", {
                    method: "POST",
                    body: JSON.stringify({ imageUrl }),
                  });

                  toast.success("Profile image updated");
                } catch (err) {
                  toast.error("Failed to update profile image");
                  console.error(err);
                }
              }}
              onUploadError={(err) => {
                toast.error("Upload error: " + err.message);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              name="name"
              value={editForm.name}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
              placeholder="Your name"
            />
          </div>
          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea
              name="bio"
              value={editForm.bio}
              onChange={(e) =>
                setEditForm({ ...editForm, bio: e.target.value })
              }
              className="min-h-[100px]"
              placeholder="Tell us about yourself"
            />
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            <Input
              name="location"
              value={editForm.location}
              onChange={(e) =>
                setEditForm({ ...editForm, location: e.target.value })
              }
              placeholder="Where are you based?"
            />
          </div>
          <div className="space-y-2">
            <Label>Website</Label>
            <Input
              name="website"
              value={editForm.website}
              onChange={(e) =>
                setEditForm({ ...editForm, website: e.target.value })
              }
              placeholder="Your personal website"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
