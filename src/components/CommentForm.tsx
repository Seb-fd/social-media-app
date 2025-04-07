"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createComment } from "@/actions/comment.action";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

export function CommentForm({ postId }: { postId: string }) {
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await createComment(postId, content);
      setContent("");
      toast.success("Comment posted"); // ✅ Mostrar toast

      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      toast.error("Failed to post comment");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <textarea
        className="border border-border bg-background text-foreground p-2 rounded resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a comment..."
        disabled={isPending}
      />
      <Button type="submit" disabled={isPending}>
        {isPending ? "Posting..." : "Comment"}
      </Button>
    </form>
  );
}
