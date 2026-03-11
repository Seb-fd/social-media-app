import Link from "next/link";
import { UserAvatarLink } from "../UserAvatar";
import { TimeAgo } from "../TimeAgo";
import { DeleteAlertDialog } from "../DeleteAlertDialog";

interface PostHeaderProps {
  author: {
    id: string;
    username: string;
    name: string | null;
    image: string | null;
  };
  createdAt: Date | string;
  isPostAuthor: boolean;
  isDeleting: boolean;
  onDelete: () => Promise<void>;
}

export function PostHeader({
  author,
  createdAt,
  isPostAuthor,
  isDeleting,
  onDelete,
}: PostHeaderProps) {
  return (
    <div className="flex space-x-3 sm:space-x-4">
      <UserAvatarLink
        username={author.username}
        image={author.image}
        size="md"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 truncate">
            <Link
              href={`/profile/${encodeURIComponent(author.username)}`}
              className="font-semibold truncate hover:underline"
            >
              {author.name}
            </Link>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Link
                className="hover:underline"
                href={`/profile/${encodeURIComponent(author.username)}`}
              >
                @{author.username}
              </Link>
              <span>•</span>
              <TimeAgo date={createdAt} />
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
