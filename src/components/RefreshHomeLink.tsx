"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function RefreshHomeLink() {
  const pathname = usePathname();

  const handleClick = (e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault();
      window.location.href = "/";
    }
  };

  return (
    <Link
      href="/"
      onClick={handleClick}
      className="text-xl font-bold text-primary font-mono tracking-wider"
    >
      Social Media App
    </Link>
  );
}
