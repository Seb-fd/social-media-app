type UserStats = {
  _count: {
    posts: number;
    followers: number;
    following: number;
  };
};

interface ProfileStatsProps {
  user: UserStats;
  onTabChange?: (tab: string) => void;
}

export function ProfileStats({ user, onTabChange }: ProfileStatsProps) {
  return (
    <div className="flex justify-center items-center space-x-8 mb-4">
      <StatsButton 
        count={user._count.following} 
        label="Following" 
        onClick={onTabChange ? () => onTabChange("following") : undefined}
      />
      <div className="h-6 w-px bg-muted" />
      <StatsButton 
        count={user._count.followers} 
        label="Followers" 
        onClick={onTabChange ? () => onTabChange("followers") : undefined}
      />
      <div className="h-6 w-px bg-muted" />
      <StatsButton 
        count={user._count.posts} 
        label="Posts" 
        onClick={onTabChange ? () => onTabChange("posts") : undefined}
      />
    </div>
  );
}

interface StatsButtonProps {
  count: number;
  label: string;
  onClick?: () => void;
}

function StatsButton({ count, label, onClick }: StatsButtonProps) {
  const content = (
    <>
      <div className="font-semibold">{count.toLocaleString()}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="flex flex-col items-center text-center hover:underline transition-all cursor-pointer"
      >
        {content}
      </button>
    );
  }

  return (
    <div className="flex flex-col items-center text-center">
      {content}
    </div>
  );
}
