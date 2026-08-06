import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { viewStory } from '@/services/api';
import type { Story } from '@/types';

interface StoryViewerProps {
  stories: Story[];
  allGroups: Story[][];
  initialIndex: number;
  groupIndex: number;
  onClose: () => void;
  onGroupChange: (index: number) => void;
}

export function StoryViewer({ stories, allGroups, initialIndex, groupIndex, onClose, onGroupChange }: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<number | null>(null);
  const duration = 5000;

  useEffect(() => {
    const story = stories[currentIndex];
    if (story) viewStory(story.id).catch(() => {});
  }, [currentIndex, stories]);

  useEffect(() => {
    setProgress(0);
    const start = Date.now();
    timerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = (elapsed / duration) * 100;
      if (pct >= 100) {
        if (currentIndex < stories.length - 1) {
          setCurrentIndex((i) => i + 1);
        } else if (groupIndex < allGroups.length - 1) {
          onGroupChange(groupIndex + 1);
          setCurrentIndex(0);
        } else {
          onClose();
        }
      } else {
        setProgress(pct);
      }
    }, 50);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, stories.length, groupIndex, allGroups.length, onClose, onGroupChange]);

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
    else if (groupIndex > 0) {
      onGroupChange(groupIndex - 1);
      setCurrentIndex(0);
    }
  };

  const handleNext = () => {
    if (currentIndex < stories.length - 1) setCurrentIndex(currentIndex + 1);
    else if (groupIndex < allGroups.length - 1) {
      onGroupChange(groupIndex + 1);
      setCurrentIndex(0);
    } else onClose();
  };

  const story = stories[currentIndex];
  if (!story) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={onClose}>
      <div className="relative w-full max-w-md h-full md:h-[80vh] md:rounded-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Progress bars */}
        <div className="absolute top-2 left-2 right-2 z-10 flex gap-1">
          {stories.map((_, i) => (
            <Progress key={i} value={i < currentIndex ? 100 : i === currentIndex ? progress : 0} className="h-0.5" />
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-6 left-3 right-3 z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              {story.profile?.avatar_url ? <AvatarImage src={story.profile.avatar_url} /> : null}
              <AvatarFallback>{story.profile?.username?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="text-white text-sm font-semibold">{story.profile?.username}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        {story.type === 'text' ? (
          <div
            className="w-full h-full flex items-center justify-center p-8"
            style={{ background: story.background || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            <p className="text-white text-2xl font-bold text-center">{story.text_content}</p>
          </div>
        ) : story.type === 'video' ? (
          <video src={story.media_url || ''} className="w-full h-full object-cover" autoPlay muted loop />
        ) : (
          <img src={story.media_url || ''} alt="" className="w-full h-full object-cover" />
        )}

        {/* Nav zones */}
        <button className="absolute left-0 top-0 bottom-0 w-1/3" onClick={handlePrev} />
        <button className="absolute right-0 top-0 bottom-0 w-1/3" onClick={handleNext} />
      </div>
    </div>
  );
}
