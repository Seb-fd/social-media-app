"use client";

import React from "react";
import Link from "next/link";
import { DeleteCommentButton } from "@/components/DeleteCommentButton";

interface CommentWithAuthor {
  id: string;
  content: string;
  createdAt: Date;
  postId: string;
  author: {
    id: string;
    username: string;
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
    <div className="space-y-4">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="bg-white border border-zinc-300 text-black 
            p-4 rounded-xl shadow-sm transition-all
            hover:bg-zinc-100
            dark:bg-zinc-900 dark:border-zinc-800 dark:text-white dark:hover:bg-zinc-800"
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              {comment.author.image && (
                <Link href={`/profile/${comment.author.username}`}>
                  <img
                    src={comment.author.image}
                    alt={comment.author.username}
                    className="w-8 h-8 rounded-full hover:opacity-80 transition"
                  />
                </Link>
              )}
              <div className="flex flex-col">
                <Link
                  href={`/profile/${comment.author.username}`}
                  className="font-medium text-sm text-black dark:text-white hover:underline"
                >
                  {comment.author.username}
                </Link>
              </div>
            </div>

            {(dbUserId === comment.author.id || dbUserId === postAuthorId) && (
              <div className="ml-4">
                <DeleteCommentButton
                  commentId={comment.id}
                  postId={comment.postId}
                  onDelete={() => onDeleteComment(comment.id)}
                />
              </div>
            )}
          </div>

          <p className="mt-2 text-zinc-700 dark:text-zinc-300 whitespace-pre-line">
            {comment.content}
          </p>
        </div>
      ))}
    </div>
  );
};

export default CommentsList;
