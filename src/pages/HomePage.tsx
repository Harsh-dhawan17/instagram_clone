import { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getFeedPosts } from '@/services/api';
import { PostCard } from '@/components/post-card';
import { StoriesBar } from '@/components/stories-bar';
import { CommentDialog } from '@/components/comment-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { Post } from '@/types';

export function HomePage() {
  const [commentPost, setCommentPost] = useState<Post | null>(null);
  const [commentOpen, setCommentOpen] = useState(false);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch } = useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: ({ pageParam }) => getFeedPosts(pageParam),
    getNextPageParam: (lastPage) => {
      if (lastPage.length < 6) return undefined;
      return lastPage[lastPage.length - 1].created_at;
    },
    initialPageParam: undefined as string | undefined,
  });

  const posts = data?.pages.flat() ?? [];

  const handleComment = (post: Post) => {
    setCommentPost(post);
    setCommentOpen(true);
  };

  const handleDeleted = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 md:rounded-lg" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="border-b md:border md:rounded-lg p-3 space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="aspect-square w-full" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="space-y-4">
        <StoriesBar />
        <div className="text-center py-20">
          <p className="text-lg font-semibold mb-2">Welcome to your feed</p>
          <p className="text-sm text-muted-foreground mb-4">Follow people to see their posts here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <StoriesBar />
      {posts.map((post) => (
        <PostCard key={post.id} post={post} onComment={handleComment} onDeleted={handleDeleted} />
      ))}
      {hasNextPage && (
        <div className="flex justify-center py-4">
          <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Load more
          </Button>
        </div>
      )}
      <CommentDialog post={commentPost} open={commentOpen} onOpenChange={setCommentOpen} />
    </div>
  );
}
