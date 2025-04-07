import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HomeIcon, LogInIcon, UserIcon } from "lucide-react";
import { SignInButton } from "@clerk/nextjs";

export default async function NotFound() {
  const { userId } = await auth();
  let username: string | null = null;

  if (userId) {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { username: true },
    });
    username = user?.username ?? null;
  }

  return (
    <div className="min-h-[80vh] grid place-items-center px-4 dark:bg-zinc-900">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            <p className="text-8xl font-bold text-primary font-mono">404</p>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">
                Page not found
              </h1>
              <p className="text-muted-foreground">
                The page you're looking for doesn't exist.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="default" asChild>
                <Link href="/">
                  <HomeIcon className="mr-2 size-4" />
                  Back to Home
                </Link>
              </Button>

              {username ? (
                <Button variant="outline" asChild>
                  <Link href={`/profile/${username}`}>
                    <UserIcon className="mr-2 size-4" />
                    Go to Profile
                  </Link>
                </Button>
              ) : (
                <SignInButton mode="modal">
                  <Button className="w-full" variant="outline">
                    Sign In
                  </Button>
                </SignInButton>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
