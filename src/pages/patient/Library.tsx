import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { exercises } from '@/data/mockData';
import { CognitiveDomain } from '@/types';
import { Search, Heart, Play, Star, Plus, Lock } from 'lucide-react';

const domainColors: Record<string, string> = {
  memory: 'bg-primary/10 text-primary border-primary/20',
  attention: 'bg-success/10 text-success border-success/20',
  executive: 'bg-warning/10 text-warning border-warning/20',
};

const difficultyStars: Record<string, number> = { easy: 1, medium: 2, hard: 3 };

export default function Library() {
  const [search, setSearch] = useState('');
  const [domain, setDomain] = useState<CognitiveDomain | 'all'>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const { favorites, toggleFavorite, weeklyPlan, setWeeklyPlan } = useApp();
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    return exercises.filter(e => {
      if (domain !== 'all' && e.domain !== domain) return false;
      if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (showFavoritesOnly && !favorites.has(e.id)) return false;
      return true;
    });
  }, [search, domain, showFavoritesOnly, favorites]);

  const addToPlan = (exerciseId: string) => {
    const updated = { ...weeklyPlan };
    if (!updated.Monday.includes(exerciseId)) {
      updated.Monday = [...updated.Monday, exerciseId];
      setWeeklyPlan(updated);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold">Exercise Library</h1>
        <p className="text-muted-foreground">{exercises.length} cognitive training exercises</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search exercises..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1.5">
          {(['all', 'memory', 'attention', 'executive'] as const).map(d => (
            <Button key={d} variant={domain === d ? 'default' : 'outline'} size="sm" onClick={() => setDomain(d)} className="capitalize text-xs">
              {d}
            </Button>
          ))}
        </div>
        <Button variant={showFavoritesOnly ? 'default' : 'outline'} size="sm" onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}>
          <Heart className={`h-3.5 w-3.5 mr-1 ${showFavoritesOnly ? 'fill-current' : ''}`} /> Favorites
        </Button>
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((ex, i) => (
          <motion.div key={ex.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <Card className="group hover:shadow-lg transition-all h-full flex flex-col">
              <CardContent className="p-5 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{ex.icon}</span>
                  <button onClick={() => toggleFavorite(ex.id)} className="p-1" aria-label="Toggle favorite">
                    <Heart className={`h-4 w-4 ${favorites.has(ex.id) ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} />
                  </button>
                </div>
                <h3 className="font-display font-semibold mb-1">{ex.name}</h3>
                <p className="text-xs text-muted-foreground mb-3 flex-1">{ex.description}</p>
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <Badge variant="outline" className={domainColors[ex.domain]}>{ex.domain}</Badge>
                  <div className="flex">
                    {Array.from({ length: 3 }, (_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < difficultyStars[ex.difficulty] ? 'fill-warning text-warning' : 'text-muted'}`} />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground ml-auto">{ex.duration} min</span>
                </div>
                <div className="text-xs text-muted-foreground mb-3">{ex.targetBand}</div>
                <div className="flex gap-2">
                  {ex.playable ? (
                    <Button size="sm" className="flex-1 gap-1" onClick={() => navigate(`/session?exercise=${ex.id}`)}>
                      <Play className="h-3.5 w-3.5" /> Play
                    </Button>
                  ) : (
                    <Button size="sm" variant="secondary" className="flex-1 gap-1" disabled>
                      <Lock className="h-3.5 w-3.5" /> Coming Soon
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => addToPlan(ex.id)}>
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
