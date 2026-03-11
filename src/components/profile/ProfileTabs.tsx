"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileTextIcon, HeartIcon, UserCheckIcon, UsersIcon } from "lucide-react";
import { ProfilePostsFeed } from "@/components/ProfilePostsFeed";
import { FollowersList } from "./FollowersList";
import { FollowingList } from "./FollowingList";
import type { User, Post } from "@/types";

interface ProfileTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  user: User;
  dbUserId: string;
  currentUserFollowingIds: string[];
  isOwnProfile: boolean;
  initialPosts: Post[];
  initialLikedPosts: Post[];
}

export function ProfileTabs({
  activeTab,
  onTabChange,
  user,
  dbUserId,
  currentUserFollowingIds,
  isOwnProfile,
  initialPosts,
  initialLikedPosts,
}: ProfileTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="w-full flex justify-center border-b rounded-none h-auto p-0 bg-transparent overflow-x-auto whitespace-nowrap max-w-fit mx-auto scroll-smooth">
        <TabTrigger value="posts" icon={FileTextIcon} label="Posts" />
        <TabTrigger value="likes" icon={HeartIcon} label="Likes" />
        <TabTrigger value="followers" icon={UsersIcon} label="Followers" />
        <TabTrigger value="following" icon={UserCheckIcon} label="Following" />
      </TabsList>

      <TabsContent value="posts" className="mt-6">
        <ProfilePostsFeed
          userId={user.id}
          dbUserId={dbUserId}
          initialPosts={initialPosts}
          initialLikedPosts={initialLikedPosts}
          type="posts"
        />
      </TabsContent>

      <TabsContent value="likes" className="mt-6">
        <ProfilePostsFeed
          userId={user.id}
          dbUserId={dbUserId}
          initialPosts={initialPosts}
          initialLikedPosts={initialLikedPosts}
          type="likes"
        />
      </TabsContent>

      <TabsContent value="followers" className="mt-6">
        <FollowersList
          followers={user.followers}
          dbUserId={dbUserId}
          currentUserFollowingIds={currentUserFollowingIds}
        />
      </TabsContent>

      <TabsContent value="following" className="mt-6">
        <FollowingList
          following={user.following}
          isOwnProfile={isOwnProfile}
        />
      </TabsContent>
    </Tabs>
  );
}

interface TabTriggerProps {
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

function TabTrigger({ value, icon: Icon, label }: TabTriggerProps) {
  return (
    <TabsTrigger
      value={value}
      className="flex items-center gap-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 sm:px-4 py-2 text-sm sm:text-base font-medium shrink-0"
    >
      <Icon className="size-4" />
      {label}
    </TabsTrigger>
  );
}
