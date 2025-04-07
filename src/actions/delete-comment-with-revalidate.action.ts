"use server";

import { deleteComment } from "@/actions/comment.action";
import { revalidatePath } from "next/cache";

export async function deleteCommentAndRevalidate(
  commentId: string,
  postId: string
) {
  const { success } = await deleteComment(commentId);
  if (success) {
    revalidatePath(`/post/${postId}`);
  }
  return { success };
}
