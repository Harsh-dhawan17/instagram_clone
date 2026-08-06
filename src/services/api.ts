import { supabase } from '@/lib/supabase';
import type { Post, Profile, Comment, Story, Notification, Hashtag } from '@/types';

const PAGE_SIZE = 6;

export async function getFeedPosts(cursor?: string) {
  let query = supabase
    .from('posts')
    .select(`
      *,
      profile:profiles(*),
      media(*),
      likes(*),
      comments(*)
    `)
    .eq('is_archived', false)
    .order('created_at', { ascending: false })
    .limit(PAGE_SIZE);

  if (cursor) query = query.lt('created_at', cursor);

  const { data, error } = await query;
  if (error) throw error;
  return (data as unknown as Post[]) ?? [];
}

export async function getExplorePosts() {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      profile:profiles(*),
      media(*)
    `)
    .eq('is_archived', false)
    .order('created_at', { ascending: false })
    .limit(24);

  if (error) throw error;
  return (data as unknown as Post[]) ?? [];
}

export async function getPost(id: string) {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      profile:profiles(*),
      media(*),
      likes(*),
      comments(*)
    `)
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as Post | null;
}

export async function getPostsByUser(userId: string) {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      profile:profiles(*),
      media(*)
    `)
    .eq('user_id', userId)
    .eq('is_archived', false)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as unknown as Post[]) ?? [];
}

export async function createPost(caption: string, mediaUrls: { url: string; type: string }[], locationId?: string | null) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Not authenticated');

  const { data: post, error } = await supabase
    .from('posts')
    .insert({
      user_id: userData.user.id,
      caption,
      location_id: locationId ?? null,
    })
    .select()
    .single();
  if (error) throw error;

  if (mediaUrls.length > 0) {
    const mediaRows = mediaUrls.map((m, i) => ({
      post_id: post.id,
      url: m.url,
      type: m.type,
      position: i,
    }));
    const { error: mediaError } = await supabase.from('media').insert(mediaRows);
    if (mediaError) throw mediaError;
  }

  return post;
}

export async function deletePost(id: string) {
  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) throw error;
}

export async function toggleLike(postId: string, liked: boolean) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Not authenticated');

  if (liked) {
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userData.user.id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('likes')
      .insert({ post_id: postId, user_id: userData.user.id });
    if (error) throw error;

    const { data: post } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', postId)
      .maybeSingle();
    if (post && post.user_id !== userData.user.id) {
      await supabase.from('notifications').insert({
        user_id: post.user_id,
        actor_id: userData.user.id,
        type: 'like',
        post_id: postId,
      });
    }
  }
}

export async function toggleSave(postId: string, saved: boolean) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Not authenticated');

  if (saved) {
    const { error } = await supabase
      .from('saved_posts')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userData.user.id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('saved_posts')
      .insert({ post_id: postId, user_id: userData.user.id });
    if (error) throw error;
  }
}

export async function getComments(postId: string) {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      profile:profiles(*)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data as unknown as Comment[]) ?? [];
}

export async function addComment(postId: string, content: string, parentId?: string | null) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      user_id: userData.user.id,
      content,
      parent_id: parentId ?? null,
    })
    .select(`
      *,
      profile:profiles(*)
    `)
    .single();
  if (error) throw error;

  const { data: post } = await supabase
    .from('posts')
    .select('user_id')
    .eq('id', postId)
    .maybeSingle();
  if (post && post.user_id !== userData.user.id) {
    await supabase.from('notifications').insert({
      user_id: post.user_id,
      actor_id: userData.user.id,
      type: 'comment',
      post_id: postId,
      comment_id: data.id,
    });
  }
  return data as unknown as Comment;
}

export async function deleteComment(id: string) {
  const { error } = await supabase.from('comments').delete().eq('id', id);
  if (error) throw error;
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export async function getProfileByUsername(username: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export async function updateProfile(updates: Partial<Profile>) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userData.user.id)
    .select()
    .single();
  if (error) throw error;
  return data as Profile;
}

export async function getFollowersCount(userId: string) {
  const { count, error } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', userId)
    .eq('accepted', true);
  if (error) throw error;
  return count ?? 0;
}

export async function getFollowingCount(userId: string) {
  const { count, error } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', userId)
    .eq('accepted', true);
  if (error) throw error;
  return count ?? 0;
}

export async function isFollowing(followerId: string, followingId: string) {
  const { data, error } = await supabase
    .from('follows')
    .select('id, accepted')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return 'none';
  return data.accepted ? 'following' : 'requested';
}

export async function toggleFollow(followingId: string, status: 'none' | 'following' | 'requested') {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Not authenticated');

  if (status !== 'none') {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', userData.user.id)
      .eq('following_id', followingId);
    if (error) throw error;
    return 'none';
  }

  const { data: targetProfile } = await supabase
    .from('profiles')
    .select('is_private')
    .eq('id', followingId)
    .maybeSingle();

  const accepted = targetProfile?.is_private ? false : true;

  const { error } = await supabase.from('follows').insert({
    follower_id: userData.user.id,
    following_id: followingId,
    accepted,
  });
  if (error) throw error;

  if (accepted) {
    await supabase.from('notifications').insert({
      user_id: followingId,
      actor_id: userData.user.id,
      type: 'follow',
    });
  }

  return accepted ? 'following' : 'requested';
}

export async function getStories() {
  const { data, error } = await supabase
    .from('stories')
    .select(`
      *,
      profile:profiles(*)
    `)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as unknown as Story[]) ?? [];
}

export async function createStory(mediaUrl: string | null, type: string, textContent?: string, background?: string) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('stories')
    .insert({
      user_id: userData.user.id,
      media_url: mediaUrl,
      type,
      text_content: textContent,
      background,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function viewStory(storyId: string) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('story_views')
    .insert({ story_id: storyId, user_id: userData.user.id });
  if (error && error.code !== '23505') throw error;
}

export async function getNotifications() {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('notifications')
    .select(`
      *,
      actor:profiles!notifications_actor_id_fkey(*),
      post:posts(*)
    `)
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data as unknown as Notification[]) ?? [];
}

export async function markNotificationsRead() {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userData.user.id)
    .eq('read', false);
  if (error) throw error;
}

export async function getSavedPosts() {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('saved_posts')
    .select(`
      *,
      post:posts(
        *,
        profile:profiles(*),
        media(*)
      )
    `)
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function searchProfiles(query: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .ilike('username', `%${query}%`)
    .limit(20);
  if (error) throw error;
  return (data as Profile[]) ?? [];
}

export async function searchHashtags(query: string) {
  const { data, error } = await supabase
    .from('hashtags')
    .select('*')
    .ilike('tag', `%${query}%`)
    .limit(20);
  if (error) throw error;
  return (data as Hashtag[]) ?? [];
}

export async function getSuggestedUsers() {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .neq('id', userData.user.id)
    .limit(5);
  if (error) throw error;
  return (data as Profile[]) ?? [];
}
