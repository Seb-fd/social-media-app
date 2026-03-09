"use server";

import { prisma } from "@/lib/prisma";
import { getDbUserId, getUsersByUsernames } from "./user.action";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUniqueMentions } from "@/lib/mentions";

export async function createPost(content: string, image: string) {
  try {
    const userId = await getDbUserId();

    if (!userId) return;

    const post = await prisma.post.create({
      data: {
        content,
        image,
        authorId: userId,
      },
    });

    const mentions = getUniqueMentions(content);
    if (mentions.length > 0) {
      const mentionedUsers = await getUsersByUsernames(mentions);
      
      const notifications = mentionedUsers
        .filter((user) => user.id !== userId)
        .map((user) => ({
          type: "MENTION" as const,
          userId: user.id,
          creatorId: userId,
          postId: post.id,
        }));

      if (notifications.length > 0) {
        await prisma.notification.createMany({
          data: notifications as any,
        });
      }
    }

    revalidatePath("/"); // purge the cache for the home page
    return { success: true, post };
  } catch (error) {
    console.error("Failed to create post:", error);
    return { success: false, error: "Failed to create post" };
  }
}

export async function getPosts(take: number = 10, cursor?: string) {
  try {
    const posts = await prisma.post.findMany({
      take: take + 1, // Fetch one extra to determine if there are more
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        content: true,
        image: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                image: true,
                name: true,
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
  } catch (error: any) {
    console.error("Error in getPosts:");
    if (error instanceof Error) {
      console.error("Message:", error.message);
      console.error("Stack:", error.stack);
    } else {
      console.error("Error in getPosts:", JSON.stringify(error, null, 2));
    }
    throw new Error("Failed to fetch posts");
  }
}

export async function toggleLike(postId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return;

    // check if like exists
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) throw new Error("Post not found");

    if (existingLike) {
      // unlike and delete notification
      await prisma.$transaction([
        prisma.like.delete({
          where: {
            userId_postId: {
              userId,
              postId,
            },
          },
        }),
        prisma.notification.deleteMany({
          where: {
            type: "LIKE",
            postId,
            creatorId: userId,
          },
        }),
      ]);
    } else {
      // like and create notification (only if liking someone else's post)
      await prisma.$transaction([
        prisma.like.create({
          data: {
            userId,
            postId,
          },
        }),
        ...(post.authorId !== userId
          ? [
              prisma.notification.create({
                data: {
                  type: "LIKE",
                  userId: post.authorId, // recipient (post author)
                  creatorId: userId, // person who liked
                  postId,
                },
              }),
            ]
          : []),
      ]);
    }

    revalidatePath(`/post/${postId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle like:", error);
    return { success: false, error: "Failed to toggle like" };
  }
}

export async function createComment(postId: string, content: string) {
  try {
    const userId = await getDbUserId();

    if (!userId) return;
    if (!content) throw new Error("Content is required");

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) throw new Error("Post not found");

    // Create comment and notification in a transaction
    const [comment] = await prisma.$transaction(async (tx) => {
      // Create comment first
      const newComment = await tx.comment.create({
        data: {
          content,
          authorId: userId,
          postId,
        },
      });

      // Create notification if commenting on someone else's post
      if (post.authorId !== userId) {
        await tx.notification.create({
          data: {
            type: "COMMENT",
            userId: post.authorId,
            creatorId: userId,
            postId,
            commentId: newComment.id,
          },
        });
      }

      // Handle mentions
      const mentions = getUniqueMentions(content);
      if (mentions.length > 0) {
        const mentionedUsers = await getUsersByUsernames(mentions);
        
        const mentionNotifications = mentionedUsers
          .filter((user) => user.id !== userId && user.id !== post.authorId)
          .map((user) => ({
            type: "MENTION" as const,
            userId: user.id,
            creatorId: userId,
            postId,
            commentId: newComment.id,
          }));

        if (mentionNotifications.length > 0) {
          await tx.notification.createMany({
            data: mentionNotifications as any,
          });
        }
      }

      return [newComment];
    });

    revalidatePath(`/post/${postId}`);
    return { success: true, comment };
  } catch (error) {
    console.error("Failed to create comment:", error);
    return { success: false, error: "Failed to create comment" };
  }
}

export async function deletePost(postId: string) {
  try {
    const userId = await getDbUserId();

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) throw new Error("Post not found");
    if (post.authorId !== userId)
      throw new Error("Unauthorized - no delete permission");

    // Delete notifications related to this post
    await prisma.notification.deleteMany({
      where: { postId },
    });

    await prisma.post.delete({
      where: { id: postId },
    });

    revalidatePath("/"); // purge the cache
    return { success: true };
  } catch (error) {
    console.error("Failed to delete post:", error);
    return { success: false, error: "Failed to delete post" };
  }
}

export async function deletePostAndRedirect(postId: string) {
  // Delete notifications related to this post
  await prisma.notification.deleteMany({
    where: { postId },
  });

  await prisma.post.delete({
    where: { id: postId },
  });

  revalidatePath("/");
  redirect("/");
}
