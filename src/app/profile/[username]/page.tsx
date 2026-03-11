import { Metadata } from "next";
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
}): Promise<Metadata> {
  const user = await getProfileByUsername(params.username);
  if (!user) return {};

  return {
    title: `${user.name ?? user.username}`,
    description: user.bio || `Check out ${user.username}'s profile.`,
  };
}

async function ProfilePageServer({ params }: { params: { username: string } }) {
  try {
    const user = await getProfileByUsername(params.username);
    if (!user) notFound();

    const currentClerkUser = await currentUser();
    const currentDbUserId = currentClerkUser ? await getDbUserId().catch(() => null) : null;

    const [postsResult, likedPostsResult, isCurrentUserFollowing] =
      await Promise.all([
        getUserPosts(user.id, 10),
        getUserLikedPosts(user.id, 10),
        isFollowing(user.id),
      ]);

    let currentUserFollowingIds: string[] = [];
    if (currentDbUserId) {
      const currentUserFollowing = await getFollowing(currentDbUserId);
      currentUserFollowingIds = currentUserFollowing.map((f) => f.id);
    }

    const serializedUser = {
      ...user,
      createdAt: user.createdAt.toISOString(),
      followers: user.followers,
      following: user.following,
    };

    const serializedPosts = postsResult.posts.map((post) => ({
      ...post,
      createdAt: post.createdAt.toISOString(),
      comments: post.comments.map((comment) => ({
        ...comment,
        createdAt: comment.createdAt.toISOString(),
      })),
    }));

    const serializedLikedPosts = likedPostsResult.posts.map((post) => ({
      ...post,
      createdAt: post.createdAt.toISOString(),
      comments: post.comments.map((comment) => ({
        ...comment,
        createdAt: comment.createdAt.toISOString(),
      })),
    }));

    return (
      <ProfilePageClient
        user={serializedUser}
        initialPosts={serializedPosts}
        initialLikedPosts={serializedLikedPosts}
        isFollowing={isCurrentUserFollowing}
        currentUserFollowingIds={currentUserFollowingIds}
      />
    );
  } catch (error) {
    console.error("ProfilePageServer error:", error);
    throw error;
  }
}

export default ProfilePageServer;
