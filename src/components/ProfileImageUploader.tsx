"use client";

import { useUser } from "@clerk/nextjs";
import { UploadButton } from "@/lib/uploadthing";
import toast from "react-hot-toast";

export default function ProfileImageUploader() {
  const { user } = useUser();

  const handleUploadComplete = async (res: any) => {
    try {
      const imageUrl = res?.[0]?.url;
      if (!imageUrl) {
        toast.error("Upload failed");
        return;
      }

      const imageBlob = await fetch(imageUrl).then((res) => res.blob());

      await user?.setProfileImage({ file: imageBlob });
      toast.success("Profile image updated!");
    } catch (err) {
      toast.error("Error updating profile image");
      console.error(err);
    }
  };

  return (
    <div>
      <UploadButton
        endpoint="profileImage"
        onClientUploadComplete={handleUploadComplete}
        onUploadError={(error) => {
          console.error("Upload error:", error);
          toast.error("Upload failed");
        }}
      />
    </div>
  );
}
