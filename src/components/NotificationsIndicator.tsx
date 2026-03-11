"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { BellIcon } from "lucide-react";
import Link from "next/link";
import { getUnreadNotificationCount } from "@/actions/notifications.action";
import { Button } from "@/components/ui/button";

interface Props {
  onClick?: () => void;
}

const NOTIF_STORAGE_KEY = 'notifications_opened';

export default function NotificationIndicator({ onClick }: Props) {
  const [count, setCount] = useState(0);
  const [hasOpened, setHasOpened] = useState(false);
  const mountedRef = useRef(false);

  const fetchCount = useCallback(async () => {
    try {
      const result = await getUnreadNotificationCount();
      const numCount = typeof result === 'number' ? result : 0;
      if (mountedRef.current) {
        setCount(numCount);
      }
    } catch (error) {
      console.error("Failed to fetch notification count:", error);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchCount();
    
    const interval = setInterval(fetchCount, 10000);
    
    const handleStorage = () => fetchCount();
    window.addEventListener('storage', handleStorage);
    
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
    };
  }, [fetchCount]);

  const handleClick = () => {
    setHasOpened(true);
    localStorage.setItem(NOTIF_STORAGE_KEY, Date.now().toString());
    window.dispatchEvent(new Event('notifications_opened'));
    onClick?.();
  };

  return (
    <Button
      variant="ghost"
      className="flex items-center gap-3 justify-start relative"
      asChild
    >
      <Link href="/notifications" onClick={handleClick}>
        <BellIcon className="w-4 h-4" />
        <span>Notifications</span>

        {count > 0 && !hasOpened && (
          <span className="absolute right-0 top-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
          </span>
        )}
      </Link>
    </Button>
  );
}
