"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { DeleteCommentButton } from "@/components/DeleteCommentButton";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

interface CommentWithAuthor {
  id: string;
  content: string;
  createdAt: Date;
  postId: string;
  author: {
    id: string;
    username: string;
    name?: string | null;
    image?: string | null;
  };
}

type CommentsListProps = {
  comments: CommentWithAuthor[];
  dbUserId: string | null;
  onDeleteComment: (commentId: string) => Promise<void>;
  postAuthorId: string;
};

const CommentsList: React.FC<CommentsListProps> = ({
  comments,
  dbUserId,
  onDeleteComment,
  postAuthorId,
}) => {
  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="flex space-x-3 border border-border p-4 rounded-xl"
        >
          <Link href={`/profile/${comment.author.username}`}>
            <Avatar className="size-8 flex-shrink-0 hover:opacity-80 transition">
              <AvatarImage src={comment.author.image ?? "/avatar.png"} />
            </Avatar>
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <Link
                    href={`/profile/${comment.author.username}`}
                    className="font-medium text-sm hover:underline"
                  >
                    {comment.author.name ?? comment.author.username}
                  </Link>
                  <Link
                    href={`/profile/${comment.author.username}`}
                    className="text-sm text-muted-foreground hover:underline"
                  >
                    @{comment.author.username}
                  </Link>
                  <span className="text-sm text-muted-foreground">·</span>
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.createdAt))} ago
                  </span>
                </div>
                <p className="text-sm break-words text-foreground mt-1">
                  {comment.content}
                </p>
              </div>

              {dbUserId === comment.author.id && (
                <DeleteCommentButton
                  commentId={comment.id}
                  postId={comment.postId}
                  onDelete={() => onDeleteComment(comment.id)}
                />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommentsList;
