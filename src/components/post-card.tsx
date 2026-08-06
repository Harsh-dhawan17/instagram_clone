import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Bookmark, MoreHorizontal, Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/store/auth-context';
import { toggleLike, toggleSave, deletePost } from '@/services/api';
import { timeAgo, formatCount, renderCaption } from '@/utils/format';
import type { Post } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PostCardProps {
  post: Post;
  onComment?: (post: Post) => void;
  onDeleted?: (postId: string) => void;
}

export function PostCard({ post, onComment, onDeleted }: PostCardProps) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.liked_by_me ?? false);
  const [likeCount, setLikeCount] = useState(post.like_count ?? post.likes?.length ?? 0);
  const [saved, setSaved] = useState(post.saved_by_me ?? false);
  const [showHeart, setShowHeart] = useState(false);
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const isOwner = user?.id === post.user_id;

  const handleLike = async () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((c) => (newLiked ? c + 1 : c - 1));
    try {
      await toggleLike(post.id, !newLiked);
    } catch {
      setLiked(!newLiked);
      setLikeCount((c) => (newLiked ? c - 1 : c + 1));
    }
  };

  const handleDoubleTap = () => {
    if (!liked) {
      handleLike();
    }
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 800);
  };

  const handleSave = async () => {
    const newSaved = !saved;
    setSaved(newSaved);
    try {
      await toggleSave(post.id, !newSaved);
    } catch {
      setSaved(!newSaved);
    }
  };

  const handleDelete = async () => {
    try {
      await deletePost(post.id);
      toast.success('Post deleted');
      onDeleted?.(post.id);
    } catch {
      toast.error('Failed to delete post');
    }
  };

  const captionParts = post.caption ? renderCaption(post.caption) : [];

  return (
    <article className="border-b border-border md:border md:rounded-lg bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <Link to={`/u/${post.profile?.username}`} className="flex items-center gap-2">
          <Avatar className="w-8 h-8">
            {post.profile?.avatar_url ? <AvatarImage src={post.profile.avatar_url} /> : null}
            <AvatarFallback>{post.profile?.username?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{post.profile?.username}</span>
            {post.created_at && (
              <span className="text-xs text-muted-foreground">{timeAgo(post.created_at)} ago</span>
            )}
          </div>
        </Link>
        {isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                Delete post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Media */}
      <div className="relative" onDoubleClick={handleDoubleTap}>
        {post.media && post.media.length > 0 && (
          post.media.length === 1 ? (
            <div className="aspect-square bg-muted overflow-hidden">
              {post.media[0].type === 'video' ? (
                <video src={post.media[0].url} className="w-full h-full object-cover" controls />
              ) : (
                <img src={post.media[0].url} alt="" className="w-full h-full object-cover" loading="lazy" />
              )}
            </div>
          ) : (
            <Carousel className="w-full">
              <CarouselContent>
                {post.media.map((m) => (
                  <CarouselItem key={m.id}>
                    <div className="aspect-square bg-muted overflow-hidden">
                      {m.type === 'video' ? (
                        <video src={m.url} className="w-full h-full object-cover" controls />
                      ) : (
                        <img src={m.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                      )}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </Carousel>
          )
        )}
        {showHeart && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Heart className="w-20 h-20 text-white fill-white animate-ping" />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-4">
          <button onClick={handleLike} className="hover:scale-110 transition-transform">
            <Heart className={cn('w-6 h-6', liked && 'fill-red-500 text-red-500')} />
          </button>
          <button onClick={() => onComment?.(post)}>
            <MessageCircle className="w-6 h-6" />
          </button>
          <button>
            <Send className="w-6 h-6" />
          </button>
        </div>
        <button onClick={handleSave}>
          <Bookmark className={cn('w-6 h-6', saved && 'fill-foreground')} />
        </button>
      </div>

      {/* Likes count */}
      <div className="px-3 pb-2">
        <span className="text-sm font-semibold">{formatCount(likeCount)} likes</span>
      </div>

      {/* Caption */}
      {post.caption && (
        <div className="px-3 pb-3 text-sm">
          <Link to={`/u/${post.profile?.username}`} className="font-semibold mr-2">
            {post.profile?.username}
          </Link>
          <span className={captionExpanded ? '' : 'line-clamp-2'}>
            {captionParts.map((part, i) => {
              if (part.type === 'hashtag') return (
                <Link key={i} to={`/explore?tag=${part.value.slice(1)}`} className="text-blue-500 hover:underline">{part.value}</Link>
              );
              if (part.type === 'mention') return (
                <Link key={i} to={`/u/${part.value.slice(1)}`} className="text-blue-500 hover:underline">{part.value}</Link>
              );
              return <span key={i}>{part.value}</span>;
            })}
          </span>
          {post.caption.length > 100 && (
            <button onClick={() => setCaptionExpanded(!captionExpanded)} className="text-muted-foreground ml-1">
              {captionExpanded ? 'less' : 'more'}
            </button>
          )}
        </div>
      )}

      {/* Comments preview */}
      {post.comments && post.comments.length > 0 && (
        <div className="px-3 pb-3">
          <button onClick={() => onComment?.(post)} className="text-sm text-muted-foreground">
            View all {post.comments.length} comments
          </button>
        </div>
      )}
    </article>
  );
}
