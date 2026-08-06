/*
# Storage bucket policies

1. Purpose
- Allow authenticated users to upload to the media and avatars buckets.
- Allow public read of media and avatars (public URLs used in img tags).

2. Changes
- Policies on storage.objects for media and avatars buckets.
*/

CREATE POLICY "media_read_public" ON storage.objects
  FOR SELECT TO public USING (bucket_id IN ('media', 'avatars'));

CREATE POLICY "media_insert_auth" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id IN ('media', 'avatars'));

CREATE POLICY "media_update_owner" ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id IN ('media', 'avatars') AND owner = auth.uid()
  );

CREATE POLICY "media_delete_owner" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id IN ('media', 'avatars') AND owner = auth.uid()
  );