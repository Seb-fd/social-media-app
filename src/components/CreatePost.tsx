"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { ImageIcon, Loader2Icon, SendIcon } from "lucide-react";
import { Button } from "./ui/button";
import { createPost } from "@/actions/post.action";
import toast from "react-hot-toast";
import ImageUpload from "./ImageUpload";
import { getUserByClerkId } from "@/actions/user.action";
import { UserAvatar, UserAvatarLink } from "./UserAvatar";

function CreatePost() {
  const { user } = useUser();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const fetchUsername = async () => {
      if (user?.id) {
        try {
          const dbUser = await getUserByClerkId(user.id);
          if (dbUser?.username) {
            setUsername(dbUser.username);
          }
        } catch (err) {
          console.error("Error fetching user:", err);
        }
      }
    };

    fetchUsername();
  }, [user?.id]);

  const handleSubmit = async () => {
    if (!content.trim() && !imageUrl) return;

    setIsPosting(true);
    try {
      const result = await createPost(content, imageUrl);
      if (result?.success) {
        setContent("");
        setImageUrl("");
        setShowImageUpload(false);
        toast.success("Post created successfully");
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to create post:", error);
      toast.error("Failed to create post");
    } finally {
      setIsPosting(false);
    }
  };

  const canPost = !!(content.trim() || imageUrl);

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <PostInputArea
            username={username}
            userImage={user?.imageUrl}
            content={content}
            onContentChange={setContent}
            isPosting={isPosting}
          />

          {(showImageUpload || imageUrl) && (
            <ImageUploadSection
              imageUrl={imageUrl}
              onImageChange={(url) => {
                setImageUrl(url);
                if (!url) setShowImageUpload(false);
              }}
            />
          )}

          <PostActionsBar
            isPosting={isPosting}
            canPost={canPost}
            onToggleImageUpload={() => setShowImageUpload(!showImageUpload)}
            onSubmit={handleSubmit}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function PostInputArea({
  username,
  userImage,
  content,
  onContentChange,
  isPosting,
}: {
  username: string;
  userImage: string | undefined;
  content: string;
  onContentChange: (value: string) => void;
  isPosting: boolean;
}) {
  return (
    <div className="flex space-x-4">
      <UserAvatarLink username={username} image={userImage} size="md" />
      <Textarea
        placeholder="What's on your mind?"
        className="min-h-[100px] resize-none border-none focus-visible:ring-0 p-0 text-base"
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        disabled={isPosting}
      />
    </div>
  );
}

function ImageUploadSection({
  imageUrl,
  onImageChange,
}: {
  imageUrl: string;
  onImageChange: (url: string) => void;
}) {
  return (
    <div className="border rounded-lg p-4">
      <ImageUpload
        endpoint="postImage"
        value={imageUrl}
        onChange={onImageChange}
      />
    </div>
  );
}

function PostActionsBar({
  isPosting,
  canPost,
  onToggleImageUpload,
  onSubmit,
}: {
  isPosting: boolean;
  canPost: boolean;
  onToggleImageUpload: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-t pt-4">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-muted-foreground hover:text-primary"
        onClick={onToggleImageUpload}
        disabled={isPosting}
      >
        <ImageIcon className="size-4 mr-2" />
        Photo
      </Button>
      <Button
        className="flex items-center"
        onClick={onSubmit}
        disabled={!canPost || isPosting}
      >
        {isPosting ? (
          <>
            <Loader2Icon className="size-4 mr-2 animate-spin" />
            Posting...
          </>
        ) : (
          <>
            <SendIcon className="size-4 mr-2" />
            Post
          </>
        )}
      </Button>
    </div>
  );
}

export default CreatePost;
