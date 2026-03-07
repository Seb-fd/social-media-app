"use client";

import { formatDistanceToNow } from "date-fns";

interface TimeAgoProps {
  date: Date | string;
  className?: string;
  addSuffix?: boolean;
}

export function TimeAgo({ date, className = "", addSuffix = false }: TimeAgoProps) {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return (
    <span className={className}>
      {formatDistanceToNow(dateObj, { addSuffix })}
    </span>
  );
}
