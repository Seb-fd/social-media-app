import { getPosts } from "@/actions/post.action";
import { getDbUserId } from "@/actions/user.action";
import CreatePost from "@/components/CreatePost";
import { PostsFeed } from "@/components/PostsFeed";
import SugestedUsers from "@/components/SugestedUsers";
import { currentUser } from "@clerk/nextjs/server";

export default async function Home() {
  const user = await currentUser();
  const result = await getPosts(10);
  const dbUserId = await getDbUserId().catch(() => null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
      <div className="lg:col-span-6">
        {user ? <CreatePost /> : null}

        <PostsFeed initialPosts={result.posts} dbUserId={dbUserId} />
      </div>

      <div className="hidden lg:block lg:col-span-4">
        <div className="sticky top-20">
          <SugestedUsers />
        </div>
      </div>
    </div>
  );
}
