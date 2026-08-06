import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ImagePlus, X } from 'lucide-react';
import { createPost } from '@/services/api';
import { uploadImage, uploadVideo } from '@/services/storage';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface MediaItem {
  url: string;
  type: string;
  preview: string;
}

export function CreatePostDialog({ open, onOpenChange }: CreatePostDialogProps) {
  const [step, setStep] = useState<'select' | 'caption'>('select');
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const reset = () => {
    setStep('select');
    setMedia([]);
    setCaption('');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setLoading(true);
    try {
      const items: MediaItem[] = [];
      for (const file of files) {
        const isVideo = file.type.startsWith('video/');
        const url = isVideo ? await uploadVideo(file) : await uploadImage(file);
        items.push({ url, type: isVideo ? 'video' : 'image', preview: URL.createObjectURL(file) });
      }
      setMedia(items);
      setStep('caption');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (media.length === 0) return;
    setLoading(true);
    try {
      await createPost(caption, media.map((m) => ({ url: m.url, type: m.type })));
      await queryClient.invalidateQueries({ queryKey: ['feed'] });
      await queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Post shared');
      reset();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const removeMedia = (index: number) => {
    setMedia(media.filter((_, i) => i !== index));
    if (media.length === 1) setStep('select');
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{step === 'select' ? 'Create new post' : 'Add caption'}</DialogTitle>
        </DialogHeader>

        {step === 'select' ? (
          <div className="space-y-4">
            <div
              className="border-2 border-dashed border-border rounded-lg p-12 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              <ImagePlus className="w-12 h-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Upload photos or videos</p>
              <p className="text-xs text-muted-foreground">Select multiple files for a carousel</p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {media.map((m, i) => (
                <div key={i} className="relative aspect-square rounded-md overflow-hidden bg-muted">
                  {m.type === 'video' ? (
                    <video src={m.preview} className="w-full h-full object-cover" />
                  ) : (
                    <img src={m.preview} alt="" className="w-full h-full object-cover" />
                  )}
                  <button
                    onClick={() => removeMedia(i)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Label htmlFor="caption">Caption</Label>
              <Input
                id="caption"
                placeholder="Write a caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                maxLength={2200}
              />
            </div>
            <Button onClick={handleSubmit} disabled={loading} className="w-full">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Share post
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
