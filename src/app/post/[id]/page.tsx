import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
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
import Link from "next/link";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { ImagePreviewDialog } from "@/components/ImagePreviewDialog";

type Props = {
  params: { id: string };
};

export default async function PostPage({ params }: Props) {
  const dbUserId = await getDbUserId();

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

  const hasLiked = post.likes.some((like) => like.userId === dbUserId);
  const isPostAuthor = dbUserId === post.author.id;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div className="bg-background border border-border text-foreground p-6 rounded-2xl shadow-lg space-y-4 transition-colors">
        <div className="flex space-x-3 sm:space-x-4">
          <Link href={`/profile/${post.author.username}`}>
            <Avatar className="size-8 sm:w-10 sm:h-10 hover:opacity-80 transition">
              <AvatarImage src={post.author.image ?? "/avatar.png"} />
            </Avatar>
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 truncate">
                <Link
                  href={`/profile/${post.author.username}`}
                  className="font-semibold truncate hover:underline"
                >
                  {post.author.name ?? post.author.username}
                </Link>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Link
                    className="hover:underline"
                    href={`/profile/${post.author.username}`}
                  >
                    @{post.author.username}
                  </Link>
                  <span>•</span>
                  <span>
                    {formatDistanceToNow(new Date(post.createdAt))} ago
                  </span>
                </div>
              </div>

              {isPostAuthor && <DeletePostButton postId={post.id} />}
            </div>
          </div>
        </div>

        <p className="text-lg whitespace-pre-line">{post.content}</p>

        {post.image && (
          <ImagePreviewDialog src={post.image} alt="Post image">
            <div className="rounded-lg overflow-hidden">
              <img
                src={post.image}
                alt="Post image"
                className="w-full h-auto object-cover"
              />
            </div>
          </ImagePreviewDialog>
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
        <CommentsList
          comments={post.comments}
          dbUserId={dbUserId}
          postAuthorId={post.author.id}
          onDeleteComment={async (commentId) => {
            "use server";
            const { success } = await deleteComment(commentId);
            if (success) {
              revalidatePath(`/post/${post.id}`);
            }
          }}
        />
        <CommentForm postId={post.id} />
      </div>
    </div>
  );
}
