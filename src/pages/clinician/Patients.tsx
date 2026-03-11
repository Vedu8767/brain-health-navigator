import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { patients } from '@/data/mockData';
import { Search, ChevronRight, AlertCircle, Activity } from 'lucide-react';

const statusColor: Record<string, string> = {
  'active': 'bg-success/10 text-success border-success/20',
  'needs-attention': 'bg-warning/10 text-warning border-warning/20',
  'new': 'bg-primary/10 text-primary border-primary/20',
};

export default function Patients() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    return patients.filter(p => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.condition.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      return true;
    });
  }, [search, statusFilter]);

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold">Patient Management</h1>
        <p className="text-muted-foreground">{patients.length} patients</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search patients..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1.5">
          {['all', 'active', 'needs-attention', 'new'].map(s => (
            <Button key={s} variant={statusFilter === s ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter(s)} className="capitalize text-xs">
              {s === 'needs-attention' ? 'Needs Attention' : s}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map(p => (
          <Card key={p.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/patient/${p.id}`)}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">{p.avatar}</div>
                  <div>
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-xs text-muted-foreground">Age {p.age} • {p.condition}</p>
                  </div>
                </div>
                <Badge variant="outline" className={statusColor[p.status]}>{p.status === 'needs-attention' ? 'Attention' : p.status}</Badge>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-3">
                {(['memory', 'attention', 'executive'] as const).map(d => (
                  <div key={d}>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="capitalize">{d}</span>
                      <span>{p.cognitiveScores[d]}</span>
                    </div>
                    <Progress value={p.cognitiveScores[d]} className="h-1.5" />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Adherence: {p.adherence}%</span>
                <span>Last session: {p.lastSession}</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
