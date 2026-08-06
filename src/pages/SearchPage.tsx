import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchProfiles, searchHashtags } from '@/services/api';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search as SearchIcon, Hash } from 'lucide-react';

export function SearchPage() {
  const [query, setQuery] = useState('');

  const { data: profiles = [] } = useQuery({
    queryKey: ['search-profiles', query],
    queryFn: () => searchProfiles(query),
    enabled: query.length > 1,
  });

  const { data: hashtags = [] } = useQuery({
    queryKey: ['search-hashtags', query],
    queryFn: () => searchHashtags(query),
    enabled: query.length > 1,
  });

  return (
    <div className="space-y-4 p-3">
      <h1 className="text-xl font-semibold">Search</h1>
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search users or hashtags..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {query.length <= 1 && (
        <p className="text-sm text-muted-foreground text-center py-8">Type to search for people or hashtags</p>
      )}

      {query.length > 1 && profiles.length === 0 && hashtags.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">No results found</p>
      )}

      {hashtags.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground">Hashtags</h2>
          {hashtags.map((tag) => (
            <Link
              key={tag.id}
              to={`/explore?tag=${tag.tag}`}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Hash className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">#{tag.tag}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {profiles.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground">People</h2>
          {profiles.map((profile) => (
            <Link
              key={profile.id}
              to={`/u/${profile.username}`}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Avatar className="w-10 h-10">
                {profile.avatar_url ? <AvatarImage src={profile.avatar_url} /> : null}
                <AvatarFallback>{profile.username[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold">{profile.username}</p>
                {profile.full_name && <p className="text-xs text-muted-foreground">{profile.full_name}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
