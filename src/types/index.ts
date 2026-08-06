export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  bio: string | null;
  website: string | null;
  gender: string | null;
  avatar_url: string | null;
  is_private: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  caption: string | null;
  location_id: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  profile?: Profile;
  media?: Media[];
  likes?: Like[];
  comments?: Comment[];
  liked_by_me?: boolean;
  saved_by_me?: boolean;
  like_count?: number;
  comment_count?: number;
}

export interface Media {
  id: string;
  post_id: string;
  url: string;
  type: string;
  position: number;
  created_at: string;
}

export interface Like {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
  profile?: Profile;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  profile?: Profile;
  replies?: Comment[];
  liked_by_me?: boolean;
  like_count?: number;
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  accepted: boolean;
  created_at: string;
}

export interface Story {
  id: string;
  user_id: string;
  media_url: string | null;
  type: string;
  text_content: string | null;
  background: string | null;
  expires_at: string;
  created_at: string;
  profile?: Profile;
  viewed?: boolean;
}

export interface StoryView {
  id: string;
  story_id: string;
  user_id: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  actor_id: string;
  type: string;
  post_id: string | null;
  comment_id: string | null;
  read: boolean;
  created_at: string;
  actor?: Profile;
  post?: Post;
}

export interface SavedPost {
  id: string;
  user_id: string;
  post_id: string;
  collection_name: string;
  created_at: string;
  post?: Post;
}

export interface Hashtag {
  id: string;
  tag: string;
  created_at: string;
}

export interface Location {
  id: string;
  name: string;
  created_at: string;
}

export type NotificationType = 'like' | 'comment' | 'follow' | 'mention' | 'story_reply';
