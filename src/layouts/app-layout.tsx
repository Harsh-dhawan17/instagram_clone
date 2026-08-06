import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Compass, PlusSquare, Bell, Search, Bookmark, Settings, LogOut, Moon, Sun, Instagram } from 'lucide-react';
import { useAuth } from '@/store/auth-context';
import { useTheme } from '@/store/theme-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { CreatePostDialog } from '@/components/create-post-dialog';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/explore', icon: Compass, label: 'Explore' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/saved', icon: Bookmark, label: 'Saved' },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 border-r border-border bg-background z-30 hidden md:flex flex-col p-4">
        <div className="px-2 py-6">
          <NavLink to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 flex items-center justify-center">
              <Instagram className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold tracking-tight">Instagram</span>
          </NavLink>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-4 px-3 py-3 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-4 px-3 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors w-full"
          >
            <PlusSquare className="w-5 h-5" />
            Create
          </button>
          <NavLink
            to={`/u/${profile?.username}`}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-4 px-3 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              )
            }
          >
            <Avatar className="w-5 h-5">
              {profile?.avatar_url ? <AvatarImage src={profile.avatar_url} /> : null}
              <AvatarFallback className="text-[10px]">{profile?.username?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            Profile
          </NavLink>
        </nav>

        <div className="space-y-1 pt-4 border-t border-border">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-4 px-3 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              )
            }
          >
            <Settings className="w-5 h-5" />
            Settings
          </NavLink>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-4 px-3 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors w-full"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-4 px-3 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 border-b border-border bg-background/80 backdrop-blur-lg z-30 flex items-center justify-between px-4">
        <NavLink to="/">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 flex items-center justify-center">
            <Instagram className="w-4 h-4 text-white" />
          </div>
        </NavLink>
        <span className="text-lg font-semibold">Instagram</span>
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
      </header>

      {/* Main content */}
      <main className="md:ml-64 pt-14 md:pt-0 pb-16 md:pb-0 min-h-screen">
        <div className="max-w-2xl mx-auto px-0 md:px-4 py-0 md:py-6">{children}</div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 border-t border-border bg-background/80 backdrop-blur-lg z-30 flex items-center justify-around px-2">
        {navItems.slice(0, 3).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => cn('p-2', isActive ? 'text-foreground' : 'text-muted-foreground')}
          >
            <item.icon className="w-6 h-6" />
          </NavLink>
        ))}
        <button onClick={() => setCreateOpen(true)} className="p-2 text-muted-foreground">
          <PlusSquare className="w-6 h-6" />
        </button>
        <NavLink
          to={`/u/${profile?.username}`}
          className={({ isActive }) => cn('p-2', isActive ? 'text-foreground' : 'text-muted-foreground')}
        >
          <Avatar className="w-6 h-6">
            {profile?.avatar_url ? <AvatarImage src={profile.avatar_url} /> : null}
            <AvatarFallback className="text-[10px]">{profile?.username?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
        </NavLink>
      </nav>

      <CreatePostDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
