import { ImagePreviewDialog } from "../ImagePreviewDialog";

interface PostImageProps {
  src: string;
  alt: string;
}

export function PostImage({ src, alt }: PostImageProps) {
  return (
    <ImagePreviewDialog src={src} alt={alt}>
      <div className="rounded-lg overflow-hidden">
        <img src={src} alt={alt} className="w-full h-auto object-cover" />
      </div>
    </ImagePreviewDialog>
  );
}
