"use client";

import { useEffect, useState } from "react";
import { BellIcon, HomeIcon, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import ModeToggle from "./ModeToggle";
import NotificationIndicator from "./NotificationsIndicator";
import { usePathname } from "next/navigation";

function DesktopNavbar() {
  const { user } = useUser();
  const pathname = usePathname();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const res = await fetch("/api/get-username");
        const data = await res.json();
        setUsername(data.username);
      } catch (err) {
        console.error("Failed to fetch username", err);
      }
    };

    if (user) {
      fetchUsername();
    }
  }, [user]);

  const handleHomeClick = (e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault(); // avoid next.js transition
      window.location.href = "/"; // force reload
    }
  };

  return (
    <div className="hidden md:flex items-center space-x-4">
      <ModeToggle />

      <Button variant="ghost" className="flex items-center gap-2" asChild>
        <Link href="/" onClick={handleHomeClick}>
          <HomeIcon className="w-4 h-4" />
          <span className="hidden lg:inline">Home</span>
        </Link>
      </Button>

      {user && username ? (
        <>
          <NotificationIndicator />
          <Button variant="ghost" className="flex items-center gap-2" asChild>
            <Link href={`/profile/${username}`}>
              <UserIcon className="w-4 h-4" />
              <span className="hidden lg:inline">Profile</span>
            </Link>
          </Button>
          <UserButton />
        </>
      ) : !user ? (
        <SignInButton mode="modal">
          <Button variant="default">Sign In</Button>
        </SignInButton>
      ) : null}
    </div>
  );
}

export default DesktopNavbar;
