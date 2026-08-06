import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/store/auth-context';
import { useQuery } from '@tanstack/react-query';
import { getStories } from '@/services/api';
import { StoryViewer } from '@/components/story-viewer';
import type { Story } from '@/types';

export function StoriesBar() {
  const { profile } = useAuth();
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const { data: stories = [] } = useQuery({
    queryKey: ['stories'],
    queryFn: getStories,
  });

  // Group stories by user
  const grouped = stories.reduce<Record<string, Story[]>>((acc, s) => {
    if (!acc[s.user_id]) acc[s.user_id] = [];
    acc[s.user_id].push(s);
    return acc;
  }, {});

  const userStories = Object.values(grouped);

  const openViewer = (index: number) => {
    setViewerIndex(index);
    setViewerOpen(true);
  };

  return (
    <>
      <div className="flex gap-3 overflow-x-auto p-3 border-b md:border md:rounded-lg bg-background scrollbar-hide">
        {/* Your story */}
        <button className="flex flex-col items-center gap-1 shrink-0">
          <div className="relative">
            <Avatar className="w-16 h-16 border-2 border-muted">
              {profile?.avatar_url ? <AvatarImage src={profile.avatar_url} /> : null}
              <AvatarFallback>{profile?.username?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center border-2 border-background">
              <Plus className="w-3 h-3 text-white" />
            </div>
          </div>
          <span className="text-xs text-muted-foreground">Your story</span>
        </button>

        {userStories.map((userStory, i) => (
          <button
            key={userStory[0].user_id}
            onClick={() => openViewer(i)}
            className="flex flex-col items-center gap-1 shrink-0"
          >
            <div className="p-[2px] rounded-full bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600">
              <div className="p-[2px] rounded-full bg-background">
                <Avatar className="w-16 h-16">
                  {userStory[0].profile?.avatar_url ? <AvatarImage src={userStory[0].profile.avatar_url} /> : null}
                  <AvatarFallback>{userStory[0].profile?.username?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
              </div>
            </div>
            <span className="text-xs text-muted-foreground max-w-[64px] truncate">
              {userStory[0].profile?.username}
            </span>
          </button>
        ))}
      </div>

      {viewerOpen && userStories.length > 0 && (
        <StoryViewer
          stories={userStories[viewerIndex]}
          allGroups={userStories}
          initialIndex={0}
          groupIndex={viewerIndex}
          onClose={() => setViewerOpen(false)}
          onGroupChange={(i) => setViewerIndex(i)}
        />
      )}
    </>
  );
}
