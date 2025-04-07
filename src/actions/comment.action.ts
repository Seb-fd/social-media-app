"use server";

import { prisma } from "@/lib/prisma";
import { getDbUserId } from "./user.action";
import { revalidatePath } from "next/cache";

export async function createComment(postId: string, content: string) {
  const userId = await getDbUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    await prisma.comment.create({
      data: {
        content,
        postId,
        authorId: userId,
      },
    });
    revalidatePath(`/post/${postId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to create comment" };
  }
}

export async function deleteComment(commentId: string) {
  const userId = await getDbUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    // First verify user owns the comment
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { authorId: true, postId: true },
    });

    if (!comment) return { success: false, error: "Comment not found" };
    if (comment.authorId !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    revalidatePath(`/post/${comment.postId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete comment" };
  }
}
