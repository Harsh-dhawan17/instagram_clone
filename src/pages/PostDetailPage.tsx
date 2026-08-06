import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPost } from '@/services/api';
import { PostCard } from '@/components/post-card';
import { CommentDialog } from '@/components/comment-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import type { Post } from '@/types';

export function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [commentOpen, setCommentOpen] = useState(false);

  const { data: post, isLoading } = useQuery({
    queryKey: ['post', id],
    queryFn: () => getPost(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="aspect-square w-full" />
        <Skeleton className="h-4 w-32" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Post not found</p>
        <Link to="/" className="text-blue-500 hover:underline">Back to home</Link>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>
      <PostCard post={post as Post} onComment={() => setCommentOpen(true)} />
      <CommentDialog post={post as Post} open={commentOpen} onOpenChange={setCommentOpen} />
    </div>
  );
}
