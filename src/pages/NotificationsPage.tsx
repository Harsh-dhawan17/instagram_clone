import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getNotifications, markNotificationsRead } from '@/services/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, UserPlus, AtSign } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { timeAgo } from '@/utils/format';
import type { Notification } from '@/types';

const iconMap: Record<string, typeof Heart> = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
  mention: AtSign,
  story_reply: MessageCircle,
};

export function NotificationsPage() {
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
  });

  useEffect(() => {
    if (notifications.length > 0) {
      markNotificationsRead().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications.length > 0]);

  if (isLoading) {
    return (
      <div className="p-3 space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-lg font-semibold mb-2">No notifications</p>
        <p className="text-sm text-muted-foreground">Activity on your posts will appear here.</p>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-1">
      <h1 className="text-xl font-semibold mb-3">Notifications</h1>
      {notifications.map((notif: Notification) => {
        const Icon = iconMap[notif.type] || Heart;
        return (
          <Link
            key={notif.id}
            to={notif.post ? `/p/${notif.post.id}` : `/u/${notif.actor?.username}`}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Avatar className="w-10 h-10">
              {notif.actor?.avatar_url ? <AvatarImage src={notif.actor.avatar_url} /> : null}
              <AvatarFallback>{notif.actor?.username?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-sm">
              <span className="font-semibold">{notif.actor?.username}</span>{' '}
              {notif.type === 'like' && 'liked your post.'}
              {notif.type === 'comment' && 'commented on your post.'}
              {notif.type === 'follow' && 'started following you.'}
              {notif.type === 'mention' && 'mentioned you.'}
              {notif.type === 'story_reply' && 'replied to your story.'}
              <span className="text-muted-foreground ml-1">{timeAgo(notif.created_at)} ago</span>
            </div>
            <Icon className="w-4 h-4 text-muted-foreground" />
          </Link>
        );
      })}
    </div>
  );
}
