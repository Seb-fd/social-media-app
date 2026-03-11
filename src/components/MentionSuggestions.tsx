// src/components/MentionSuggestions.tsx

import React from 'react';
import { UserAvatar } from './UserAvatar';

interface MentionSuggestionsProps {
  suggestions: Array<{
    id: string;
    username: string;
    name: string | null;
    image: string | null;
  }>{
  insertMention: (username: string) => void;
}

const MentionSuggestions = ({ suggestions, insertMention }: MentionSuggestionsProps) => {
  return (
    <div className="absolute z-50 top-full left-0 mt-1 w-64 bg-background border rounded-md shadow-lg max-h-48 overflow-y-auto">
      {suggestions.map((user, index) => (
        <button
          key={user.id}
          onClick={() => insertMention(user.username)}
          className="w-full flex items-center gap-3 p-2 hover:bg-accent text-left transition-colors"
        >
          <UserAvatar image={user.image} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name || user.username}</p>
            <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
          </div>
        </button>
      ))}
    </div>
  );
};

export default MentionSuggestions;

