import {
  getProfileByUsername,
  getUserLikedPosts,
  getUserPosts,
  isFollowing,
  getFollowing,
} from "@/actions/profile.action";
import { getDbUserId } from "@/actions/user.action";
import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import ProfilePageClient from "./ProfilePageClient";

export async function generateMetadata({
  params,
}: {
  params: { username: string };
}) {
  const user = await getProfileByUsername(params.username);
  if (!user) return;

  return {
    title: `${user.name ?? user.username}`,
    description: user.bio || `Check out ${user.username}'s profile.`,
  };
}

async function ProfilePageServer({ params }: { params: { username: string } }) {
  const user = await getProfileByUsername(params.username);
  if (!user) notFound();

  const currentClerkUser = await currentUser();
  const currentDbUserId = currentClerkUser ? await getDbUserId().catch(() => null) : null;

  const [posts, likedPosts, isCurrentUserFollowing] =
    await Promise.all([
      getUserPosts(user.id),
      getUserLikedPosts(user.id),
      isFollowing(user.id),
    ]);

  let currentUserFollowingIds: string[] = [];
  if (currentDbUserId) {
    const currentUserFollowing = await getFollowing(currentDbUserId);
    currentUserFollowingIds = currentUserFollowing.map((f) => f.id);
  }

  return (
    <ProfilePageClient
      user={user}
      posts={posts}
      likedPosts={likedPosts}
      isFollowing={isCurrentUserFollowing}
      currentUserFollowingIds={currentUserFollowingIds}
    />
  );
}

export default ProfilePageServer;
