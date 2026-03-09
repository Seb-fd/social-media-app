"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useUser, SignInButton } from "@clerk/nextjs";
import { createComment } from "@/actions/comment.action";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { SendIcon, LogInIcon } from "lucide-react";
import { UserAvatar, UserAvatarLink } from "./UserAvatar";
import { MentionInput } from "./MentionInput";

export function CommentForm({ postId }: { postId: string }) {
  const { user } = useUser();
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await createComment(postId, content);
      setContent("");
      toast.success("Comment posted");

      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      toast.error("Failed to post comment");
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center p-4 border rounded-lg bg-muted/50">
        <SignInButton mode="modal">
          <Button variant="outline" className="gap-2">
            <LogInIcon className="size-4" />
            Sign in to comment
          </Button>
        </SignInButton>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex space-x-3">
      {user && (
        <UserAvatarLink
          username={user.username || ""}
          image={user.imageUrl}
          size="sm"
        />
      )}
      <div className="flex-1">
        <MentionInput
          value={content}
          onChange={setContent}
          placeholder="Write a comment..."
          disabled={isPending}
        />
        <div className="flex justify-end mt-2">
          <Button
            type="submit"
            size="sm"
            className="flex items-center gap-2"
            disabled={!content.trim() || isPending}
          >
            {isPending ? (
              "Posting..."
            ) : (
              <>
                <SendIcon className="size-4" />
                Comment
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
