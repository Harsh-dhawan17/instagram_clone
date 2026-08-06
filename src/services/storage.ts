import { supabase } from '@/lib/supabase';

export async function uploadFile(file: File, bucket: string, folder: string): Promise<string> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Not authenticated');

  const ext = file.name.split('.').pop() || 'jpg';
  const fileName = `${folder}/${userData.user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(fileName, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return data.publicUrl;
}

export async function uploadImage(file: File): Promise<string> {
  return uploadFile(file, 'media', 'images');
}

export async function uploadVideo(file: File): Promise<string> {
  return uploadFile(file, 'media', 'videos');
}

export async function uploadAvatar(file: File): Promise<string> {
  return uploadFile(file, 'avatars', 'avatars');
}

export async function uploadStoryMedia(file: File): Promise<string> {
  const isVideo = file.type.startsWith('video/');
  return uploadFile(file, 'media', isVideo ? 'stories/videos' : 'stories/images');
}
