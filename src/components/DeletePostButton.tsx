"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deletePost } from "@/actions/post.action";
import { DeleteAlertDialog } from "@/components/DeleteAlertDialog";
import toast from "react-hot-toast";

export function DeletePostButton({ postId }: { postId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <DeleteAlertDialog
      title="Delete Post"
      description="Are you sure you want to delete this post? This action cannot be undone."
      isDeleting={isPending}
      onDelete={async () => {
        startTransition(async () => {
          const res = await deletePost(postId);
          if (res.success) {
            toast.success("Post deleted successfully");
            router.push("/");
          } else {
            toast.error("Failed to delete post");
            console.error("Error deleting post", res.error);
          }
        });
      }}
    />
  );
}
