import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { useAuth } from '@/store/auth-context';
import { getComments, addComment, deleteComment } from '@/services/api';
import { timeAgo, renderCaption } from '@/utils/format';
import type { Post, Comment } from '@/types';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface CommentDialogProps {
  post: Post | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommentDialog({ post, open, onOpenChange }: CommentDialogProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const loadComments = async () => {
    if (!post) return;
    try {
      const data = await getComments(post.id);
      setComments(data);
    } catch {
      toast.error('Failed to load comments');
    }
  };

  const handleSubmit = async () => {
    if (!post || !content.trim()) return;
    setLoading(true);
    try {
      await addComment(post.id, content, replyTo);
      setContent('');
      setReplyTo(null);
      await loadComments();
    } catch {
      toast.error('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteComment(id);
      setComments(comments.filter((c) => c.id !== id && c.parent_id !== id));
    } catch {
      toast.error('Failed to delete comment');
    }
  };

  const topLevel = comments.filter((c) => !c.parent_id);
  const getReplies = (parentId: string) => comments.filter((c) => c.parent_id === parentId);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (v) loadComments();
      }}
    >
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Comments</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto space-y-3 px-1">
          {topLevel.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No comments yet. Start the conversation!</p>
          )}
          {topLevel.map((comment) => (
            <div key={comment.id} className="space-y-2">
              <div className="flex gap-2">
                <Avatar className="w-8 h-8 shrink-0">
                  {comment.profile?.avatar_url ? <AvatarImage src={comment.profile.avatar_url} /> : null}
                  <AvatarFallback>{comment.profile?.username?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm">
                    <Link to={`/u/${comment.profile?.username}`} className="font-semibold mr-2">
                      {comment.profile?.username}
                    </Link>
                    {renderCaption(comment.content).map((part, i) => {
                      if (part.type === 'hashtag') return <span key={i} className="text-blue-500">{part.value}</span>;
                      if (part.type === 'mention') return <Link key={i} to={`/u/${part.value.slice(1)}`} className="text-blue-500">{part.value}</Link>;
                      return <span key={i}>{part.value}</span>;
                    })}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground">{timeAgo(comment.created_at)} ago</span>
                    <button onClick={() => setReplyTo(comment.id)} className="text-xs text-muted-foreground hover:text-foreground">
                      Reply
                    </button>
                    {user?.id === comment.user_id && (
                      <button onClick={() => handleDelete(comment.id)} className="text-xs text-muted-foreground hover:text-destructive">
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
              {getReplies(comment.id).map((reply) => (
                <div key={reply.id} className="flex gap-2 pl-10">
                  <Avatar className="w-8 h-8 shrink-0">
                    {reply.profile?.avatar_url ? <AvatarImage src={reply.profile.avatar_url} /> : null}
                    <AvatarFallback>{reply.profile?.username?.[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm">
                      <Link to={`/u/${reply.profile?.username}`} className="font-semibold mr-2">
                        {reply.profile?.username}
                      </Link>
                      {reply.content}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted-foreground">{timeAgo(reply.created_at)} ago</span>
                      {user?.id === reply.user_id && (
                        <button onClick={() => handleDelete(reply.id)} className="text-xs text-muted-foreground hover:text-destructive">
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="flex gap-2 pt-3 border-t border-border">
          <Input
            placeholder={replyTo ? 'Write a reply...' : 'Write a comment...'}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <Button size="icon" onClick={handleSubmit} disabled={loading || !content.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
