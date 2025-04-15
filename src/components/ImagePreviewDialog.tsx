"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import Image from "next/image";
import { X } from "lucide-react";
import { useTheme } from "next-themes";

type Props = {
  src: string;
  alt?: string;
  children: React.ReactNode;
};

export function ImagePreviewDialog({ src, alt, children }: Props) {
  const [open, setOpen] = useState(false);
  const { theme } = useTheme();

  const handleDialogClose = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div
          onClick={() => setOpen(true)}
          className="cursor-pointer hover:opacity-90 transition"
        >
          {children}
        </div>
      </DialogTrigger>

      <DialogContent
        className="bg-transparent p-0 border-none max-w-full w-full h-full flex items-center justify-center"
        onClick={handleDialogClose}
      >
        <DialogClose asChild>
          <button
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/50 dark:bg-zinc-900/50 text-black dark:text-white backdrop-blur hover:bg-white dark:hover:bg-zinc-800 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </DialogClose>

        <div className="relative">
          <Image
            src={src}
            alt={alt ?? "Post image"}
            width={1000}
            height={800}
            className="rounded-lg object-contain max-h-[90vh] w-auto h-auto border-2 p-4"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
