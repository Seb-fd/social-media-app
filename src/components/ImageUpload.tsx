"use client";

import { useState, useRef } from "react";
import { useUploadThing } from "@/lib/uploadthing";
import { ImageIcon, XIcon, Loader2Icon } from "lucide-react";

interface ImageUploadProps {
  onChange: (url: string) => void;
  value: string;
  endpoint: "postImage" | "profileImage";
}

function ImageUpload({ endpoint, onChange, value }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { startUpload } = useUploadThing(endpoint, {
    onClientUploadComplete: (res) => {
      if (res?.[0]?.url) {
        onChange(res[0].url);
      }
      setIsUploading(false);
    },
    onUploadError: () => {
      setIsUploading(false);
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    await startUpload([file]);
  };

  if (value) {
    return (
      <div className="space-y-3">
        <div className="relative w-full max-w-md">
          <img
            src={value}
            alt="Upload"
            className="rounded-lg w-full h-auto object-cover max-h-80"
          />
          <button
            onClick={() => onChange("")}
            className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-black/80 rounded-full transition-colors"
            type="button"
          >
            <XIcon className="h-4 w-4 text-white" />
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id={`${endpoint}-upload-change`}
        />
        <label
          htmlFor={`${endpoint}-upload-change`}
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

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id={`${endpoint}-upload`}
      />
      <label
        htmlFor={`${endpoint}-upload`}
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
            <span className="text-muted-foreground">Add photo</span>
          </>
        )}
      </label>
    </div>
  );
}

export default ImageUpload;
