"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getDbUserId } from "./user.action";
import { sanitizeInput, isValidUrl } from "@/lib/sanitize";

export async function updateProfileImage(url: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  if (!isValidUrl(url)) {
    throw new Error("Invalid URL");
  }

  return await prisma.user.update({
    where: { clerkId: userId },
    data: { image: url },
  });
}

export async function getProfileByUsername(username: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        image: true,
        location: true,
        website: true,
        createdAt: true,
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          },
        },
        followers: {
          select: {
            follower: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
          },
        },
        following: {
          select: {
            following: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!user) return null;

    const followers = user.followers.map((f) => f.follower);
    const following = user.following.map((f) => f.following);

    return {
      ...user,
      followers,
      following,
    };
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw new Error("Failed to fetch profile");
  }
}

export async function getUserPosts(userId: string, take: number = 10, cursor?: string) {
  try {
    const posts = await prisma.post.findMany({
      take: take + 1,
      cursor: cursor ? { id: cursor } : undefined,
      where: {
        authorId: userId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    let nextCursor: string | undefined = undefined;
    
    if (posts.length > take) {
      const nextItem = posts.pop();
      nextCursor = nextItem?.id;
    }

    return {
      posts,
      nextCursor,
    };
  } catch (error) {
    console.error("Error fetching user posts:", error);
    throw new Error("Failed to fetch user posts");
  }
}

export async function getUserLikedPosts(userId: string, take: number = 10, cursor?: string) {
  try {
    const likedPosts = await prisma.post.findMany({
      take: take + 1,
      cursor: cursor ? { id: cursor } : undefined,
      where: {
        likes: {
          some: {
            userId,
          },
        },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    let nextCursor: string | undefined = undefined;
    
    if (likedPosts.length > take) {
      const nextItem = likedPosts.pop();
      nextCursor = nextItem?.id;
    }

    return {
      posts: likedPosts,
      nextCursor,
    };
  } catch (error) {
    console.error("Error fetching liked posts:", error);
    throw new Error("Failed to fetch liked posts");
  }
}

export async function updateProfile(formData: FormData) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) throw new Error("Unauthorized");

    const rawName = formData.get("name") as string;
    const rawBio = formData.get("bio") as string;
    const rawLocation = formData.get("location") as string;
    const rawWebsite = formData.get("website") as string;

    const name = sanitizeInput(rawName);
    const bio = sanitizeInput(rawBio);
    const location = sanitizeInput(rawLocation);
    let website = sanitizeInput(rawWebsite);

    if (website && !isValidUrl(website)) {
      return { success: false, error: "Invalid URL format" };
    }

    if (!name) {
      return { success: false, error: "Name is required" };
    }

    const user = await prisma.user.update({
      where: { clerkId },
      data: {
        name,
        bio,
        location,
        website: website || null,
      },
    });

    revalidatePath("/profile");
    return { success: true, user };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

export async function isFollowing(userId: string) {
  try {
    const currentUserId = await getDbUserId();
    if (!currentUserId) return false;

    const follow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: userId,
        },
      },
    });

    return !!follow;
  } catch (error) {
    console.error("Error checking follow status:", error);
    return false;
  }
}

export async function getFollowers(userId: string) {
  const followers = await prisma.follows.findMany({
    where: {
      followingId: userId,
    },
    include: {
      follower: {
        select: {
          id: true,
          username: true,
          name: true,
          image: true,
        },
      },
    },
  });

  return followers.map((f) => f.follower);
}

export async function getFollowing(userId: string) {
  const following = await prisma.follows.findMany({
    where: {
      followerId: userId,
    },
    include: {
      following: {
        select: {
          id: true,
          username: true,
          name: true,
          image: true,
        },
      },
    },
  });

  return following.map((f) => f.following);
}
