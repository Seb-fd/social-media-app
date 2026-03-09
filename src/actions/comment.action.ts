"use server";

import { prisma } from "@/lib/prisma";
import { getDbUserId, getUsersByUsernames } from "./user.action";
import { revalidatePath } from "next/cache";
import { getUniqueMentions } from "@/lib/mentions";

export async function createComment(postId: string, content: string) {
  const userId = await getDbUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) return { success: false, error: "Post not found" };

    const newComment = await prisma.comment.create({
      data: {
        content,
        postId,
        authorId: userId,
      },
    });

    // Create notification if commenting on someone else's post
    if (post.authorId !== userId) {
      await prisma.notification.create({
        data: {
          type: "COMMENT",
          userId: post.authorId,
          creatorId: userId,
          postId,
          commentId: newComment.id,
        },
      });
    }

    // Handle mentions in comments
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
        await prisma.notification.createMany({
          data: mentionNotifications as any,
        });
      }
    }

    revalidatePath(`/post/${postId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to create comment:", error);
    return { success: false, error: "Failed to create comment" };
  }
}

export async function deleteComment(commentId: string) {
  const userId = await getDbUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { authorId: true, postId: true },
    });

    if (!comment) return { success: false, error: "Comment not found" };

    const post = await prisma.post.findUnique({
      where: { id: comment.postId },
      select: { authorId: true },
    });

    const isCommentAuthor = comment.authorId === userId;
    const isPostAuthor = post?.authorId === userId;

    if (!isCommentAuthor && !isPostAuthor) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.notification.deleteMany({
      where: { commentId },
    });

    await prisma.comment.delete({
      where: { id: commentId },
    });

    revalidatePath(`/post/${comment.postId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete comment" };
  }
}
