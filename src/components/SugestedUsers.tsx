import { getRandomUsers } from "@/actions/user.action";
import { Card, CardContent, CardHeader } from "./ui/card";
import FollowButton from "./FollowButton";
import Link from "next/link";
import { UserAvatar, UserAvatarLink } from "./UserAvatar";

async function SugestedUsers() {
  const users = await getRandomUsers();

  if (users.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>Suggested Users</CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <SuggestedUserCard key={user.id} user={user} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SuggestedUserCard({
  user,
}: {
  user: Awaited<ReturnType<typeof getRandomUsers>>[number];
}) {
  return (
    <div className="flex gap-2 items-center justify-between">
      <SuggestedUserInfo user={user} />
      <FollowButton userId={user.id} />
    </div>
  );
}

function SuggestedUserInfo({
  user,
}: {
  user: Awaited<ReturnType<typeof getRandomUsers>>[number];
}) {
  return (
    <div className="flex items-center gap-1">
      <UserAvatarLink username={user.username} image={user.image} />
      <div className="text-xs">
        <Link
          href={`/profile/${encodeURIComponent(user.username)}`}
          className="font-medium cursor-pointer hover:underline"
        >
          {user.name}
        </Link>
        <Link
          href={`/profile/${encodeURIComponent(user.username)}`}
          className="text-muted-foreground hover:underline"
        >
          @{user.username}
        </Link>
        <p className="text-muted-foreground">
          {user._count.followers} followers
        </p>
      </div>
    </div>
  );
}

export default SugestedUsers;
