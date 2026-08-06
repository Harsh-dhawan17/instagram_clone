# Instagram Clone

A production-ready, full-stack Instagram clone built with React 19, Vite, TypeScript, Tailwind CSS, shadcn/ui, and Supabase (PostgreSQL + Auth + Realtime + Storage).

## Features

- **Authentication**: Email/password sign up, login, logout, protected routes
- **Posts**: Create posts with multiple images/videos, captions, hashtags, mentions, like, comment, delete
- **Stories**: Image/video/text stories with 24-hour expiry, story viewer with progress bars
- **Feed**: Algorithmic home feed with infinite scroll, skeleton loading
- **Explore**: Pinterest-style grid of all posts
- **Search**: Search users and hashtags
- **Profile**: View/edit profile, avatar, bio, website, private/public account, post grid
- **Follow System**: Follow/unfollow, follow requests for private accounts
- **Notifications**: Real-time notifications for likes, comments, follows
- **Saved Posts**: Bookmark posts for later
- **Dark/Light Mode**: Theme toggle with system preference detection
- **Responsive**: Desktop sidebar, mobile bottom navigation

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| State | TanStack Query + Context API |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

### Environment Variables

Create a `.env` file (or use the provided one):

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Build

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/     # Reusable UI components (PostCard, StoriesBar, dialogs)
├── pages/          # Route pages (Home, Explore, Profile, Login, etc.)
├── layouts/        # App layout with sidebar + mobile nav
├── hooks/          # Custom hooks
├── services/       # API + storage service layer
├── store/          # Auth + theme context providers
├── lib/            # Supabase client, query client, utils
├── types/          # TypeScript types
├── utils/          # Formatting utilities
└── App.tsx         # Router + providers
```

## Database Schema

The app uses Supabase PostgreSQL with the following tables:

- `profiles` — user profiles (1:1 with auth.users)
- `posts` — user posts with captions
- `media` — ordered media items per post
- `likes` — post likes
- `comments` — comments with nested replies
- `follows` — follow relationships
- `stories` — 24h stories
- `story_views` — story view tracking
- `notifications` — like/comment/follow notifications
- `saved_posts` — bookmarks
- `hashtags` / `post_hashtags` — hashtag indexing
- `locations` — named locations

All tables have Row Level Security (RLS) enabled with owner-scoped policies.

## Deployment

### Frontend (Vercel)

1. Push to GitHub
2. Import to Vercel
3. Set environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
4. Deploy

### Database (Supabase)

The Supabase project includes PostgreSQL, Auth, Storage, and Realtime. Migrations are applied via the Supabase MCP tools.

## Scripts

| Command | Description |
|---------|------------|
| `npm run dev` | Start dev server |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checker |
