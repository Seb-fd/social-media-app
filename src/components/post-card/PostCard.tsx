"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { deletePost } from "@/actions/post.action";
import { deleteComment } from "@/actions/comment.action";
import toast from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { MentionText } from "@/components/MentionText";
import { PostHeader } from "./PostHeader";
import { PostImage } from "./PostImage";
import { PostActions } from "./PostActions";
import { PostComments } from "./PostComments";
import { usePostLikes } from "./usePostLikes";
import type { Post } from "@/types";

interface PostCardProps {
  post: Post;
  dbUserId: string | null;
  isLikedByCurrentUser: boolean;
  onDeletePost?: (postId: string) => Promise<void>;
  onDeleteComment?: (commentId: string) => Promise<void>;
}

export default function PostCard({
  post,
  dbUserId,
  isLikedByCurrentUser,
  onDeletePost,
  onDeleteComment,
}: PostCardProps) {
  const { user } = useUser();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  const { isLiking, hasLiked, optimisticLikes, handleLike } = usePostLikes({
    postId: post.id,
    dbUserId,
    initialIsLiked: isLikedByCurrentUser,
    initialLikeCount: post._count.likes,
  });

  const handleDeletePost = async () => {
    if (onDeletePost) return onDeletePost(post.id);
    if (isDeleting) return;
    try {
      setIsDeleting(true);
      const result = await deletePost(post.id);
      if (result.success) toast.success("Post deleted successfully");
      else throw new Error(result.error);
    } catch (error) {
      toast.error("Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (onDeleteComment) return onDeleteComment(commentId);
    if (deletingCommentId) return;
    setDeletingCommentId(commentId);
    try {
      const res = await deleteComment(commentId);
      if (res.success) toast.success("Comment deleted");
      else throw new Error(res.error);
    } catch (error) {
      toast.error("Failed to delete comment");
    } finally {
      setDeletingCommentId(null);
    }
  };

  const isPostAuthor = !!dbUserId && dbUserId === post.author.id;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          <PostHeader
            author={post.author}
            createdAt={post.createdAt}
            isPostAuthor={isPostAuthor}
            isDeleting={isDeleting}
            onDelete={handleDeletePost}
          />

          {post.content && (
            <div className="mt-2 text-sm break-words text-foreground">
              <MentionText content={post.content} />
            </div>
          )}

          <Link
            href={`/post/${post.id}`}
            className="text-foreground hover:underline text-sm font-medium inline-block"
          >
            View full post
          </Link>

          {post.image && <PostImage src={post.image} alt="Post image" />}

          <PostActions
            user={user}
            hasLiked={hasLiked}
            optimisticLikes={optimisticLikes}
            isLiking={isLiking}
            commentCount={post.comments.length}
            showComments={showComments}
            onLike={handleLike}
            onToggleComments={() => setShowComments((prev) => !prev)}
          />

          {showComments && (
            <PostComments
              comments={post.comments}
              dbUserId={dbUserId}
              deletingCommentId={deletingCommentId}
              onDeleteComment={handleDeleteComment}
              postId={post.id}
              postAuthorId={post.author.id}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
