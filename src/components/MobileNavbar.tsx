"use client";

import {
  BellIcon,
  HomeIcon,
  LogOutIcon,
  MenuIcon,
  MoonIcon,
  SunIcon,
  UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import {
  useAuth,
  SignInButton,
  SignUpButton,
  SignOutButton,
  useUser,
} from "@clerk/nextjs";
import { useTheme } from "next-themes";
import Link from "next/link";
import NotificationIndicator from "./NotificationsIndicator";
import { usePathname } from "next/navigation";

function MobileNavbar() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { isSignedIn } = useAuth();
  const { theme, setTheme } = useTheme();
  const { user } = useUser();
  const pathname = usePathname();
  const [username, setUsername] = useState<string | null>(null);

  const handleHomeClick = (e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault();
      window.location.href = "/";
    } else {
      setShowMobileMenu(false);
    }
  };

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

  return (
    <div className="flex md:hidden items-center space-x-2">
      <ThemeToggleButton theme={theme} setTheme={setTheme} />

      <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <MenuIcon className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px]">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <MobileMenuContent
            isSignedIn={isSignedIn}
            username={username}
            onHomeClick={handleHomeClick}
            onClose={() => setShowMobileMenu(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}

function ThemeToggleButton({
  theme,
  setTheme,
}: {
  theme: string | undefined;
  setTheme: (theme: string) => void;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="mr-2"
    >
      <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

function MobileMenuContent({
  isSignedIn,
  username,
  onHomeClick,
  onClose,
}: {
  isSignedIn: boolean | undefined;
  username: string | null;
  onHomeClick: (e: React.MouseEvent) => void;
  onClose: () => void;
}) {
  return (
    <nav className="flex flex-col space-y-4 mt-6">
      <MobileNavLink href="/" onClick={onHomeClick}>
        <HomeIcon className="w-4 h-4" />
        Home
      </MobileNavLink>

      {isSignedIn ? (
        <>
          <NotificationIndicator onClick={onClose} />

          {username && (
            <MobileNavLink href={`/profile/${encodeURIComponent(username)}`} onClick={onClose}>
              <UserIcon className="w-4 h-4" />
              Profile
            </MobileNavLink>
          )}

          <SignOutButton>
            <Button
              variant="ghost"
              className="flex items-center gap-3 justify-start w-full"
              onClick={onClose}
            >
              <LogOutIcon className="w-4 h-4" />
              Logout
            </Button>
          </SignOutButton>
        </>
      ) : (
        <div className="space-y-4">
          <SignInButton mode="modal">
            <Button variant="default" className="w-full" onClick={onClose}>
              Login
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button variant="default" className="w-full" onClick={onClose}>
              Sign Up
            </Button>
          </SignUpButton>
        </div>
      )}
    </nav>
  );
}

function MobileNavLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      variant="ghost"
      className="flex items-center gap-3 justify-start"
      asChild
    >
      <Link href={href} onClick={onClick}>
        {children}
      </Link>
    </Button>
  );
}

export default MobileNavbar;
