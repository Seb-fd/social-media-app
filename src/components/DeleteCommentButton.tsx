"use client";

import { useTransition } from "react";
import { deleteComment } from "@/actions/comment.action";
import { DeleteAlertDialog } from "@/components/DeleteAlertDialog";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

type DeleteCommentButtonProps = {
  commentId: string;
  postId: string;
  onDelete?: () => void; // opcional
};

export function DeleteCommentButton({
  commentId,
  postId,
  onDelete,
}: DeleteCommentButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <DeleteAlertDialog
      title="Delete Comment"
      description="Are you sure you want to delete this comment?"
      isDeleting={isPending}
      onDelete={async () => {
        startTransition(async () => {
          const res = await deleteComment(commentId);
          if (res.success) {
            toast.success("Comment deleted successfully");
            if (onDelete) {
              onDelete(); // actualiza estado en CommentsList si se provee
            } else {
              router.refresh(); // fallback si no se pasa onDelete
            }
          } else {
            toast.error("Failed to delete comment");
          }
        });
      }}
    />
  );
}
