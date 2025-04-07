"use client";

import { useEffect, useState } from "react";
import { BellIcon } from "lucide-react";
import Link from "next/link";
import { getUnreadNotificationCount } from "@/actions/notifications.action";
import { Button } from "@/components/ui/button";

interface Props {
  onClick?: () => void;
}

export default function NotificationIndicator({ onClick }: Props) {
  const [count, setCount] = useState(0);
  const [hasOpened, setHasOpened] = useState(false);

  useEffect(() => {
    const fetchCount = async () => {
      const result = await getUnreadNotificationCount();
      setCount(result);
    };
    fetchCount();
  }, []);

  const handleClick = () => {
    setHasOpened(true);
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
