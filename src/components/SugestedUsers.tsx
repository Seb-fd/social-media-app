import { getRandomUsers } from "@/actions/user.action";
import { Card, CardContent, CardHeader } from "./ui/card";
import Link from "next/link";
import { Avatar, AvatarImage } from "./ui/avatar";
import FollowButton from "./FollowButton";

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
            <div
              key={user.id}
              className="flex gap-2 items-center justify-between "
            >
              <div className="flex items-center gap-1">
                <Link href={`/profile/${user.username}`}>
                  <Avatar className="hover:opacity-80 transition">
                    <AvatarImage src={user.image ?? "/avatar.png"} />
                  </Avatar>
                </Link>
                <div className="text-xs">
                  <Link
                    href={`/profile/${user.username}`}
                    className="font-medium cursor-pointer hover:underline"
                  >
                    {user.name}
                  </Link>
                  <Link
                    href={`/profile/${user.username}`}
                    className="text-muted-foreground hover:underline"
                  >
                    @{user.username}
                  </Link>
                  <p className="text-muted-foreground">
                    {user._count.followers} followers
                  </p>
                </div>
              </div>
              <FollowButton userId={user.id} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default SugestedUsers;
