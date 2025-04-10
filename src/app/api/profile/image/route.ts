import { updateProfileImage } from "@/actions/profile.action";

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json();
    await updateProfileImage(imageUrl);
    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Error updating DB", { status: 500 });
  }
}
