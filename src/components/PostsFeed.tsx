"use client";

import { getPosts } from "@/actions/post.action";
import PostCard from "@/components/PostCard";
import { useEffect, useState, useRef, useCallback } from "react";
import { Loader2Icon } from "lucide-react";

type Post = Awaited<ReturnType<typeof getPosts>>["posts"][number];

interface PostsFeedProps {
  initialPosts: Post[];
  dbUserId: string | null;
}

export function PostsFeed({ initialPosts, dbUserId }: PostsFeedProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [cursor, setCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loaderRef = useRef<HTMLDivElement>(null);

  // Sync posts when server refreshes (router.refresh)
  useEffect(() => {
    setPosts(initialPosts);
    setCursor(null);
    setHasMore(true);
  }, [initialPosts]);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);

    try {
      const result = await getPosts(10, cursor ?? undefined);

      if (result.posts.length === 0) {
        setHasMore(false);
        return;
      }

      setPosts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));

        const newPosts = result.posts.filter(
          (post) => !existingIds.has(post.id),
        );

        return [...prev, ...newPosts];
      });

      setCursor(result.nextCursor ?? null);

      if (!result.nextCursor) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to load more posts:", error);
    } finally {
      setIsLoading(false);
    }
  }, [cursor, hasMore, isLoading]);

  useEffect(() => {
    const currentLoader = loaderRef.current;

    if (!currentLoader) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(currentLoader);

    return () => {
      observer.unobserve(currentLoader);
    };
  }, [loadMore]);

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          dbUserId={dbUserId}
          isLikedByCurrentUser={post.likes.some(
            (like) => like.userId === dbUserId,
          )}
        />
      ))}

      {hasMore && (
        <div ref={loaderRef} className="flex justify-center py-4">
          {isLoading ? (
            <Loader2Icon className="animate-spin h-6 w-6" />
          ) : (
            <span className="text-sm text-muted-foreground">
              Scroll for more
            </span>
          )}
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <p className="text-center py-4 text-muted-foreground text-sm">
          No more posts
        </p>
      )}

      {posts.length === 0 && (
        <p className="text-center py-8 text-muted-foreground">No posts yet</p>
      )}
    </div>
  );
}
