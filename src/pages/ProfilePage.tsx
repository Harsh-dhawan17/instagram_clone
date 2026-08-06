import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getProfileByUsername, getPostsByUser, getFollowersCount, getFollowingCount, isFollowing, toggleFollow } from '@/services/api';
import { useAuth } from '@/store/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Settings, Grid3x3 } from 'lucide-react';
import { toast } from 'sonner';
import type { Post } from '@/types';

export function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [followStatus, setFollowStatus] = useState<'none' | 'following' | 'requested'>('none');

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => getProfileByUsername(username!),
    enabled: !!username,
  });

  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['posts', profile?.id],
    queryFn: () => getPostsByUser(profile!.id),
    enabled: !!profile?.id,
  });

  const { data: followersCount = 0 } = useQuery({
    queryKey: ['followers-count', profile?.id],
    queryFn: () => getFollowersCount(profile!.id),
    enabled: !!profile?.id,
  });

  const { data: followingCount = 0 } = useQuery({
    queryKey: ['following-count', profile?.id],
    queryFn: () => getFollowingCount(profile!.id),
    enabled: !!profile?.id,
  });

  useQuery({
    queryKey: ['is-following', profile?.id],
    queryFn: async () => {
      if (!user || !profile || user.id === profile.id) return 'none' as const;
      const status = await isFollowing(user.id, profile.id);
      setFollowStatus(status);
      return status;
    },
    enabled: !!user && !!profile && user.id !== profile.id,
  });

  const isOwnProfile = user?.id === profile?.id;

  const handleFollow = async () => {
    if (!profile) return;
    const oldStatus = followStatus;
    const newStatus = await toggleFollow(profile.id, oldStatus).catch(() => oldStatus);
    setFollowStatus(newStatus);
    queryClient.invalidateQueries({ queryKey: ['followers-count', profile.id] });
    if (newStatus === 'following') toast.success(`Following ${profile.username}`);
    else if (newStatus === 'requested') toast.success('Follow request sent');
  };

  if (profileLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex gap-6">
          <Skeleton className="w-20 h-20 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center py-20 text-muted-foreground">User not found</div>;
  }

  return (
    <div className="md:p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-6 p-4">
        <Avatar className="w-20 h-20 md:w-32 md:h-32 shrink-0">
          {profile.avatar_url ? <AvatarImage src={profile.avatar_url} /> : null}
          <AvatarFallback className="text-2xl">{profile.username[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <h1 className="text-xl font-semibold">{profile.username}</h1>
            {isOwnProfile ? (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate('/settings')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Edit profile
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                variant={followStatus === 'following' ? 'outline' : 'default'}
                onClick={handleFollow}
              >
                {followStatus === 'following' ? 'Following' : followStatus === 'requested' ? 'Requested' : 'Follow'}
              </Button>
            )}
          </div>

          <div className="flex gap-6 text-sm">
            <span><strong>{posts.length}</strong> posts</span>
            <span><strong>{followersCount}</strong> followers</span>
            <span><strong>{followingCount}</strong> following</span>
          </div>

          <div className="text-sm space-y-1">
            {profile.full_name && <p className="font-semibold">{profile.full_name}</p>}
            {profile.bio && <p className="whitespace-pre-wrap">{profile.bio}</p>}
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                {profile.website}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Posts grid */}
      <div className="border-t border-border">
        {postsLoading ? (
          <div className="grid grid-cols-3 gap-1 p-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <Grid3x3 className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              {isOwnProfile ? 'Share your first post!' : 'No posts yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {posts.map((post: Post) => (
              <Link
                key={post.id}
                to={`/p/${post.id}`}
                className="relative aspect-square bg-muted overflow-hidden group"
              >
                {post.media && post.media[0] && (
                  <img src={post.media[0].url} alt="" className="w-full h-full object-cover" loading="lazy" />
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
