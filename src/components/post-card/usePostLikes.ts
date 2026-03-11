"use client";

import { useState } from "react";
import { toggleLike } from "@/actions/post.action";
import toast from "react-hot-toast";

interface UsePostLikesProps {
  postId: string;
  dbUserId: string | null;
  initialIsLiked: boolean;
  initialLikeCount: number;
}

export function usePostLikes({
  postId,
  dbUserId,
  initialIsLiked,
  initialLikeCount,
}: UsePostLikesProps) {
  const [isLiking, setIsLiking] = useState(false);
  const [hasLiked, setHasLiked] = useState(initialIsLiked);
  const [optimisticLikes, setOptimisticLikes] = useState(initialLikeCount);

  const handleLike = async () => {
    if (isLiking || !dbUserId) return;
    
    try {
      setIsLiking(true);
      setHasLiked((prev) => !prev);
      setOptimisticLikes((prev) => prev + (hasLiked ? -1 : 1));
      await toggleLike(postId);
    } catch (error) {
      setOptimisticLikes(initialLikeCount);
      setHasLiked(initialIsLiked);
      toast.error("Failed to like post");
    } finally {
      setIsLiking(false);
    }
  };

  return {
    isLiking,
    hasLiked,
    optimisticLikes,
    handleLike,
  };
}
