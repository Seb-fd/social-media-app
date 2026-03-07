import { currentUser } from "@clerk/nextjs/server";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { getUserByClerkId } from "@/actions/user.action";
import Link from "next/link";
import { Separator } from "./ui/separator";
import { LinkIcon, MapPinIcon } from "lucide-react";
import { UserAvatar } from "./UserAvatar";

async function Sidebar() {
  const authUser = await currentUser();
  if (!authUser) return <UnAuthenticatedSidebar />;

  const user = await getUserByClerkId(authUser.id);
  if (!user) return null;

  return (
    <div className="sticky top-20">
      <Card>
        <CardContent className="pt-6">
          <AuthenticatedSidebarContent user={user} />
        </CardContent>
      </Card>
    </div>
  );
}

function AuthenticatedSidebarContent({
  user,
}: {
  user: Awaited<ReturnType<typeof getUserByClerkId>>;
}) {
  if (!user) return null;

  return (
    <div className="flex flex-col items-center text-center">
      <SidebarProfileLink username={user.username}>
        <UserAvatar image={user.image} size="lg" className="border-2" />
        <div className="mt-4 space-y-1">
          <h3 className="font-semibold hover:underline">{user.name}</h3>
          <p className="text-sm text-muted-foreground hover:underline">
            {user.username}
          </p>
        </div>
      </SidebarProfileLink>

      {user.bio && (
        <p className="mt-3 text-sm text-muted-foreground">{user.bio}</p>
      )}

      <SidebarStats
        following={user._count.following}
        followers={user._count.followers}
      />

      <SidebarInfo location={user.location} website={user.website} />
    </div>
  );
}

function SidebarProfileLink({
  username,
  children,
}: {
  username: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={`/profile/${username}`}
      className="flex flex-col items-center justify-center"
    >
      {children}
    </Link>
  );
}

function SidebarStats({
  following,
  followers,
}: {
  following: number;
  followers: number;
}) {
  return (
    <div className="w-full">
      <Separator className="my-4" />
      <div className="flex justify-between">
        <div>
          <p className="font-medium">{following}</p>
          <p className="text-xs text-muted-foreground">Following</p>
        </div>
        <Separator orientation="vertical" />
        <div>
          <p className="font-medium">{followers}</p>
          <p className="text-xs text-muted-foreground">Followers</p>
        </div>
      </div>
      <Separator className="my-4" />
    </div>
  );
}

function SidebarInfo({
  location,
  website,
}: {
  location: string | null;
  website: string | null;
}) {
  return (
    <div className="w-full space-y-2 text-sm">
      <div className="flex items-center text-muted-foreground">
        <MapPinIcon className="w-4 h-4 mr-2" />
        {location || "No location"}
      </div>
      <div className="flex items-center text-muted-foreground">
        <LinkIcon className="w-4 h-4 mr-2 shrink-0" />
        {website ? (
          <a
            href={`${website}`}
            className="hover:underline truncate"
            target="_blank"
          >
            {website}
          </a>
        ) : (
          "No website"
        )}
      </div>
    </div>
  );
}

export default Sidebar;

function UnAuthenticatedSidebar() {
  return (
    <div className="sticky top-20">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-xl font-semibold">
            Welcome!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground mb-4">
            Login to access your profile and connect with others.
          </p>
          <SignInButton mode="modal">
            <Button className="w-full" variant="outline">
              Login
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button className="w-full mt-2" variant="default">
              Sign Up
            </Button>
          </SignUpButton>
        </CardContent>
      </Card>
    </div>
  );
}
