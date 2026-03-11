import { CommentForm } from "../CommentForm";
import { CommentItem } from "./CommentItem";

interface Comment {
  id: string;
  content: string;
  createdAt: Date | string;
  author: {
    id: string;
    username: string;
    name: string | null;
    image: string | null;
  };
}

interface PostCommentsProps {
  comments: Comment[];
  dbUserId: string | null;
  deletingCommentId: string | null;
  onDeleteComment: (commentId: string) => Promise<void>;
  postId: string;
  postAuthorId: string;
}

export function PostComments({
  comments,
  dbUserId,
  deletingCommentId,
  onDeleteComment,
  postId,
  postAuthorId,
}: PostCommentsProps) {
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
