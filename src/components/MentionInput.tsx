"use client";

import { useState, useRef, useEffect } from "react";
import { searchUsers } from "@/actions/user.action";
import { UserAvatar } from "./UserAvatar";

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function MentionInput({
  value,
  onChange,
  placeholder = "What's on your mind?",
  disabled = false,
}: MentionInputProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Array<{
    id: string;
    username: string;
    name: string | null;
    image: string | null;
  }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart || 0;
    
    onChange(newValue);
    setCursorPosition(cursorPos);

    const textBeforeCursor = newValue.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
      const hasSpaceAfterAt = textAfterAt.includes(" ");
      
      if (!hasSpaceAfterAt && textAfterAt.length > 0) {
        setQuery(textAfterAt);
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length > 0) {
        const users = await searchUsers(query);
        setSuggestions(users);
      } else {
        setSuggestions([]);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const insertMention = (username: string) => {
    const textBeforeCursor = value.slice(0, cursorPosition);
    const textAfterCursor = value.slice(cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");
    
    const newValue = 
      textBeforeCursor.slice(0, lastAtIndex) + 
      "@" + username + " " + 
      textAfterCursor;
    
    onChange(newValue);
    setShowSuggestions(false);
    setQuery("");
    
    if (textareaRef.current) {
      const newCursorPos = lastAtIndex + username.length + 2;
      setTimeout(() => {
        textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
        textareaRef.current?.focus();
      }, 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
      }
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (suggestions.length > 0) {
          insertMention(suggestions[0].username);
        }
      }
    }
  };

  return (
    <div ref={containerRef} className="relative flex-1">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="min-h-[100px] resize-none border-none focus-visible:ring-0 p-2 text-base w-full bg-transparent"
      />
      
      {showSuggestions && suggestions.length > 0 && (
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
      )}
    </div>
  );
}
