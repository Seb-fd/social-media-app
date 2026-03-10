"use client";

import Link from "next/link";

interface MentionTextProps {
  content: string;
}

export function MentionText({ content }: MentionTextProps) {
  const parts = content.split(/(@[\w+]+)/g);

  return (
    <p>
      {parts.map((part, index) => {
        if (part.startsWith("@")) {
          const username = part.slice(1);
          return (
            <Link
              key={index}
              href={`/profile/${encodeURIComponent(username)}`}
              className="text-primary hover:underline font-medium"
            >
              {part}
            </Link>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </p>
  );
}
