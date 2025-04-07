"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ScrollToComment() {
  const path = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash) {
        const el = document.getElementById(hash.substring(1));
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    }
  }, [path]);

  return null;
}
