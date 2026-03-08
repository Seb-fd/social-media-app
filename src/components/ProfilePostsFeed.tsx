"use client";

import { getUserPosts, getUserLikedPosts } from "@/actions/profile.action";
import PostCard from "@/components/PostCard";
import { useEffect, useState, useRef, useCallback } from "react";
import { Loader2Icon } from "lucide-react";

type Post = Awaited<ReturnType<typeof getUserPosts>>["posts"][number];

interface ProfilePostsFeedProps {
  userId: string;
  dbUserId: string | null;
  initialPosts: Post[];
  initialLikedPosts: Post[];
  type: "posts" | "likes";
}

export function ProfilePostsFeed({
  userId,
  dbUserId,
  initialPosts,
  initialLikedPosts,
  type,
}: ProfilePostsFeedProps) {
  const [posts, setPosts] = useState<Post[]>(type === "posts" ? initialPosts : initialLikedPosts);
  const [cursor, setCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentType, setCurrentType] = useState(type);
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPosts(type === "posts" ? initialPosts : initialLikedPosts);
    setCursor(null);
    setHasMore(true);
    setCurrentType(type);
  }, [type, initialPosts, initialLikedPosts]);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const result = currentType === "posts"
        ? await getUserPosts(userId, 10, cursor ?? undefined)
        : await getUserLikedPosts(userId, 10, cursor ?? undefined);
      
      if (result.posts.length > 0) {
        const newPosts = result.posts.filter(
          (post) => !posts.some((existingPost) => existingPost.id === post.id)
        );
        
        if (newPosts.length > 0) {
          setPosts((prev) => [...prev, ...newPosts]);
        }
        
        setCursor(result.nextCursor ?? null);
        
        if (!result.nextCursor || newPosts.length === 0) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to load more posts:", error);
    } finally {
      setIsLoading(false);
    }
  }, [cursor, hasMore, isLoading, posts, userId, currentType]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          dbUserId={dbUserId}
          isLikedByCurrentUser={post.likes.some(
            (like) => like.userId === dbUserId
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
        <p className="text-center py-8 text-muted-foreground">
          {currentType === "posts" ? "No posts yet" : "No liked posts yet"}
        </p>
      )}
    </div>
  );
}
