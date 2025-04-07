import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { deleteComment } from "@/actions/comment.action";
import { revalidatePath } from "next/cache";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { CommentForm } from "@/components/CommentForm";
import CommentsList from "@/components/CommentsList";
import { ScrollToComment } from "@/components/ScrollToComment";
import LikeButton from "@/components/LikeButton";
import { getDbUserId } from "@/actions/user.action";
import { DeletePostButton } from "@/components/DeletePostButton";

type Props = {
  params: { id: string };
};

export default async function PostPage({ params }: Props) {
  const userId = await getDbUserId();

  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: {
      author: true,
      comments: {
        include: { author: true },
        orderBy: { createdAt: "asc" },
      },
      likes: {
        select: { userId: true },
      },
      _count: {
        select: { likes: true },
      },
    },
  });

  if (!post) return notFound();

  const hasLiked = post.likes.some((like) => like.userId === userId);
  const isPostAuthor = userId === post.author.id;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div className="bg-background border border-border text-foreground p-6 rounded-2xl shadow-lg space-y-4 transition-colors">
        <div className="flex justify-between items-start">
          <div className="text-sm text-muted-foreground">
            Posted by{" "}
            <span className="font-semibold text-foreground">
              {post.author.username}
            </span>{" "}
            ·{" "}
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </div>
          {post.author.id === userId && <DeletePostButton postId={post.id} />}
        </div>

        <p className="text-lg whitespace-pre-line">{post.content}</p>

        {post.image && (
          <Image
            src={post.image}
            alt="Post image"
            width={600}
            height={400}
            className="rounded-lg border border-border"
          />
        )}

        <div className="flex items-center gap-4">
          <LikeButton postId={post.id} hasLiked={hasLiked} />
          <span className="text-sm text-muted-foreground">
            {post._count.likes} {post._count.likes === 1 ? "like" : "likes"}
          </span>
        </div>
      </div>

      <ScrollToComment />

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Comments</h2>
        <CommentForm postId={post.id} />
        <CommentsList
          comments={post.comments}
          dbUserId={userId}
          onDeleteComment={async (commentId) => {
            "use server";
            const { success } = await deleteComment(commentId);
            if (success) {
              revalidatePath(`/post/${post.id}`);
            }
          }}
        />
      </div>
    </div>
  );
}
