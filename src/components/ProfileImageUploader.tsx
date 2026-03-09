"use client";

import { useUser } from "@clerk/nextjs";
import { useUploadThing } from "@/lib/uploadthing";
import toast from "react-hot-toast";
import { ImageIcon, Loader2Icon } from "lucide-react";
import { useState, useRef } from "react";

export default function ProfileImageUploader() {
  const { user } = useUser();
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { startUpload } = useUploadThing("profileImage", {
    onClientUploadComplete: async (res) => {
      try {
        const imageUrl = res?.[0]?.url;
        if (!imageUrl) {
          toast.error("Upload failed");
          setIsUploading(false);
          return;
        }

        const imageBlob = await fetch(imageUrl).then((res) => res.blob());
        await user?.setProfileImage({ file: imageBlob });
        toast.success("Profile image updated!");
      } catch (err) {
        toast.error("Error updating profile image");
        console.error(err);
      } finally {
        setIsUploading(false);
      }
    },
    onUploadError: () => {
      setIsUploading(false);
      toast.error("Upload failed");
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    await startUpload([file]);
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id="profile-image-upload"
      />
      <label
        htmlFor="profile-image-upload"
        className={`flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-muted-foreground/60 hover:bg-muted/30 transition-all cursor-pointer ${
          isUploading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {isUploading ? (
          <>
            <Loader2Icon className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="text-muted-foreground">Uploading...</span>
          </>
        ) : (
          <>
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
            <span className="text-muted-foreground">Change photo</span>
          </>
        )}
      </label>
    </div>
  );
}
