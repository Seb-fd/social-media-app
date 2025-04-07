"use client";

import { useTransition, useState } from "react";
import { likePost, unlikePost } from "@/actions/like.action";
import { deletePostAndRedirect } from "@/actions/post.action";
import { HeartIcon, TrashIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

type Props = {
  postId: string;
  hasLiked: boolean;
  canDelete?: boolean;
};

export default function LikeButton({ postId, hasLiked, canDelete }: Props) {
  const router = useRouter();
  const [liked, setLiked] = useState(hasLiked);
  const [isPending, startTransition] = useTransition();

  const handleLikeClick = () => {
    startTransition(async () => {
      try {
        if (liked) {
          await unlikePost(postId);
          setLiked(false);
        } else {
          await likePost(postId);
          setLiked(true);
        }

        router.refresh();
      } catch (err) {
        toast.error("Failed to update like");
      }
    });
  };

  const handleDeleteClick = () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this post?"
    );
    if (!confirmed) return;

    startTransition(async () => {
      try {
        await deletePostAndRedirect(postId);
      } catch (err) {
        toast.error("Failed to delete post");
      }
    });
  };

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={handleLikeClick}
        disabled={isPending}
        className="flex items-center gap-1 text-red-500 hover:opacity-80 transition"
      >
        <HeartIcon
          className={cn("w-5 h-5", liked ? "fill-red-500" : "stroke-red-500")}
        />
        <span className="sr-only">{liked ? "Unlike" : "Like"}</span>
      </button>

      {canDelete && (
        <button
          onClick={handleDeleteClick}
          disabled={isPending}
          className="flex items-center gap-1 text-destructive hover:opacity-80 transition text-sm"
        >
          <TrashIcon className="w-4 h-4" />
          Delete Post
        </button>
      )}
    </div>
  );
}
