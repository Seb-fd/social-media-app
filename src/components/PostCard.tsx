"use client";

import { deletePost, getPosts, toggleLike } from "@/actions/post.action";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useState } from "react";
import toast from "react-hot-toast";
import { Card, CardContent } from "./ui/card";
import Link from "next/link";
import { DeleteAlertDialog } from "./DeleteAlertDialog";
import { Button } from "./ui/button";
import { HeartIcon, MessageCircleIcon } from "lucide-react";
import { deleteComment } from "@/actions/comment.action";
import { CommentForm } from "./CommentForm";
import { ImagePreviewDialog } from "./ImagePreviewDialog";
import { UserAvatar, UserAvatarLink } from "./UserAvatar";
import { TimeAgo } from "./TimeAgo";
import { MentionText } from "./MentionText";

type PostCardProps = {
  post: Post;
  dbUserId: string | null;
  isLikedByCurrentUser: boolean;
  onDeletePost?: (postId: string) => Promise<void>;
  onDeleteComment?: (commentId: string) => Promise<void>;
};

type PostsResult = Awaited<ReturnType<typeof getPosts>>;
type Posts = PostsResult["posts"];
type Post = Posts[number];

function PostCard({
  post,
  dbUserId,
  isLikedByCurrentUser,
  onDeletePost,
  onDeleteComment,
}: PostCardProps) {
  const { user } = useUser();
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasLiked, setHasLiked] = useState(isLikedByCurrentUser);
  const [optimisticLikes, setOptmisticLikes] = useState(post._count.likes);
  const [showComments, setShowComments] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(
    null,
  );

  const handleLike = async () => {
    if (isLiking) return;
    try {
      setIsLiking(true);
      setHasLiked((prev) => !prev);
      setOptmisticLikes((prev) => prev + (hasLiked ? -1 : 1));
      await toggleLike(post.id);
    } catch (error) {
      setOptmisticLikes(post._count.likes);
      setHasLiked(post.likes.some((like) => like.userId === dbUserId));
    } finally {
      setIsLiking(false);
    }
  };

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
            post={post}
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

function PostHeader({
  post,
  isPostAuthor,
  isDeleting,
  onDelete,
}: {
  post: Post;
  isPostAuthor: boolean;
  isDeleting: boolean;
  onDelete: () => Promise<void>;
}) {
  return (
    <div className="flex space-x-3 sm:space-x-4">
      <UserAvatarLink
        username={post.author.username}
        image={post.author.image}
        size="md"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 truncate">
            <Link
              href={`/profile/${encodeURIComponent(post.author.username)}`}
              className="font-semibold truncate hover:underline"
            >
              {post.author.name}
            </Link>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Link
                className="hover:underline"
                href={`/profile/${encodeURIComponent(post.author.username)}`}
              >
                @{post.author.username}
              </Link>
              <span>•</span>
              <TimeAgo date={post.createdAt} />
            </div>
          </div>
          {isPostAuthor && (
            <DeleteAlertDialog isDeleting={isDeleting} onDelete={onDelete} />
          )}
        </div>
      </div>
    </div>
  );
}

function PostImage({ src, alt }: { src: string; alt: string }) {
  return (
    <ImagePreviewDialog src={src} alt={alt}>
      <div className="rounded-lg overflow-hidden">
        <img src={src} alt={alt} className="w-full h-auto object-cover" />
      </div>
    </ImagePreviewDialog>
  );
}

function PostActions({
  user,
  hasLiked,
  optimisticLikes,
  isLiking,
  commentCount,
  showComments,
  onLike,
  onToggleComments,
}: {
  user: any;
  hasLiked: boolean;
  optimisticLikes: number;
  isLiking: boolean;
  commentCount: number;
  showComments: boolean;
  onLike: () => void;
  onToggleComments: () => void;
}) {
  return (
    <div className="flex items-center pt-2 space-x-4">
      {user ? (
        <Button
          variant="ghost"
          size="sm"
          className={`text-muted-foreground gap-2 ${
            hasLiked ? "text-red-500 hover:text-red-600" : "hover:text-red-500"
          }`}
          onClick={onLike}
        >
          {hasLiked ? (
            <HeartIcon className="size-5 fill-current" />
          ) : (
            <HeartIcon className="size-5" />
          )}
          <span>{optimisticLikes}</span>
        </Button>
      ) : (
        <SignInButton mode="modal">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground gap-2"
          >
            <HeartIcon className="size-5" />
            <span>{optimisticLikes}</span>
          </Button>
        </SignInButton>
      )}

      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground gap-2 hover:text-blue-500"
        onClick={onToggleComments}
      >
        <MessageCircleIcon
          className={`size-5 ${
            showComments ? "fill-blue-500 text-blue-500" : ""
          }`}
        />
        <span>{commentCount}</span>
      </Button>
    </div>
  );
}

function PostComments({
  comments,
  dbUserId,
  deletingCommentId,
  onDeleteComment,
  postId,
  postAuthorId,
}: {
  comments: Post["comments"];
  dbUserId: string | null;
  deletingCommentId: string | null;
  onDeleteComment: (commentId: string) => Promise<void>;
  postId: string;
  postAuthorId: string;
}) {
  return (
    <div className="space-y-4 pt-4 border-t">
      <div className="space-y-4">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            dbUserId={dbUserId}
            postAuthorId={postAuthorId}
            isDeleting={deletingCommentId === comment.id}
            onDelete={() => onDeleteComment(comment.id)}
          />
        ))}
      </div>

      <CommentForm postId={postId} />
    </div>
  );
}

function CommentItem({
  comment,
  dbUserId,
  postAuthorId,
  isDeleting,
  onDelete,
}: {
  comment: Post["comments"][number];
  dbUserId: string | null;
  postAuthorId: string;
  isDeleting: boolean;
  onDelete: () => Promise<void>;
}) {
  const isCommentAuthor = !!dbUserId && dbUserId === comment.author.id;
  const isPostAuthor = !!dbUserId && dbUserId === postAuthorId;
  const canDelete = isCommentAuthor || isPostAuthor;

  return (
    <div className="flex space-x-3">
      <UserAvatarLink
        username={comment.author.username}
        image={comment.author.image}
        size="sm"
      />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <Link
                href={`/profile/${encodeURIComponent(comment.author.username)}`}
                className="font-medium text-sm hover:underline"
              >
                {comment.author.name ?? comment.author.username}
              </Link>
              <Link
                href={`/profile/${encodeURIComponent(comment.author.username)}`}
                className="text-sm text-muted-foreground hover:underline"
              >
                @{comment.author.username}
              </Link>
              <span className="text-sm text-muted-foreground">·</span>
              <TimeAgo
                date={comment.createdAt}
                className="text-sm text-muted-foreground"
              />
            </div>
            <div className="text-sm break-words">
              <MentionText content={comment.content} />
            </div>
          </div>

          {canDelete && (
            <DeleteAlertDialog
              isDeleting={isDeleting}
              onDelete={onDelete}
              title="Delete Comment"
              description="Are you sure you want to delete this comment? This action cannot be undone."
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default PostCard;
