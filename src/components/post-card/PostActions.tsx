import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/nextjs";
import { HeartIcon, MessageCircleIcon } from "lucide-react";

interface PostActionsProps {
  user: any;
  hasLiked: boolean;
  optimisticLikes: number;
  isLiking: boolean;
  commentCount: number;
  showComments: boolean;
  onLike: () => void;
  onToggleComments: () => void;
}

export function PostActions({
  user,
  hasLiked,
  optimisticLikes,
  isLiking,
  commentCount,
  showComments,
  onLike,
  onToggleComments,
}: PostActionsProps) {
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
          disabled={isLiking}
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
