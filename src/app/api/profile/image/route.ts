import { updateProfileImage } from "@/actions/profile.action";
import { isValidUrl } from "@/lib/sanitize";

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json();
    
    if (!imageUrl || typeof imageUrl !== "string") {
      return new Response("Invalid image URL", { status: 400 });
    }

    if (!isValidUrl(imageUrl)) {
      return new Response("Invalid URL format", { status: 400 });
    }

    await updateProfileImage(imageUrl);
    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Error updating DB", { status: 500 });
  }
}
