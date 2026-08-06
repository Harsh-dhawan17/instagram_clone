import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getSavedPosts } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Bookmark } from 'lucide-react';

export function SavedPage() {
  const { data: savedPosts = [], isLoading } = useQuery({
    queryKey: ['saved-posts'],
    queryFn: getSavedPosts,
  });

  if (isLoading) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-semibold mb-4">Saved</h1>
        <div className="grid grid-cols-3 gap-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      </div>
    );
  }

  if (savedPosts.length === 0) {
    return (
      <div className="text-center py-20">
        <Bookmark className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
        <p className="text-lg font-semibold mb-2">No saved posts</p>
        <p className="text-sm text-muted-foreground">Bookmark posts to find them here later.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Saved</h1>
      <div className="grid grid-cols-3 gap-1">
        {savedPosts.map((sp: any) => (
          <Link
            key={sp.id}
            to={`/p/${sp.post_id}`}
            className="relative aspect-square bg-muted overflow-hidden"
          >
            {sp.post?.media && sp.post.media[0] && (
              <img src={sp.post.media[0].url} alt="" className="w-full h-full object-cover" loading="lazy" />
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
