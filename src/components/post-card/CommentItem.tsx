import Link from "next/link";
import { UserAvatarLink } from "../UserAvatar";
import { TimeAgo } from "../TimeAgo";
import { MentionText } from "../MentionText";
import { DeleteAlertDialog } from "../DeleteAlertDialog";

interface CommentItemProps {
  comment: {
    id: string;
    content: string;
    createdAt: Date | string;
    author: {
      id: string;
      username: string;
      name: string | null;
      image: string | null;
    };
  };
  dbUserId: string | null;
  postAuthorId: string;
  isDeleting: boolean;
  onDelete: () => Promise<void>;
}

export function CommentItem({
  comment,
  dbUserId,
  postAuthorId,
  isDeleting,
  onDelete,
}: CommentItemProps) {
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
