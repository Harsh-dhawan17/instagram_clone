import { useQuery } from '@tanstack/react-query';
import { getExplorePosts } from '@/services/api';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, MessageCircle, Play } from 'lucide-react';
import type { Post } from '@/types';

export function ExplorePage() {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['explore'],
    queryFn: getExplorePosts,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-1">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square" />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-lg font-semibold mb-2">Nothing to explore yet</p>
        <p className="text-sm text-muted-foreground">Be the first to share a post!</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-semibold px-3 py-4 hidden md:block">Explore</h1>
      <div className="grid grid-cols-3 gap-1">
        {posts.map((post: Post) => (
          <Link
            key={post.id}
            to={`/p/${post.id}`}
            className="relative aspect-square bg-muted overflow-hidden group"
          >
            {post.media && post.media[0] && (
              post.media[0].type === 'video' ? (
                <video src={post.media[0].url} className="w-full h-full object-cover" />
              ) : (
                <img src={post.media[0].url} alt="" className="w-full h-full object-cover" loading="lazy" />
              )
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100">
              <div className="flex items-center gap-1 text-white font-semibold">
                <Heart className="w-5 h-5 fill-white" />
                {post.likes?.length ?? 0}
              </div>
              <div className="flex items-center gap-1 text-white font-semibold">
                <MessageCircle className="w-5 h-5 fill-white" />
                {post.comments?.length ?? 0}
              </div>
            </div>
            {post.media && post.media[0]?.type === 'video' && (
              <Play className="absolute top-2 right-2 w-5 h-5 text-white fill-white" />
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
