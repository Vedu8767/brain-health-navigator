import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { eegReports } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { User, BrainCircuit, Flame, Zap, Settings, RotateCcw } from 'lucide-react';

export default function Profile() {
  const { patient, setHasOnboarded } = useApp();
  const navigate = useNavigate();
  const latestEEG = eegReports.find(r => r.patientId === patient.id);

  const radarData = [
    { domain: 'Memory', score: patient.cognitiveScores.memory },
    { domain: 'Attention', score: patient.cognitiveScores.attention },
    { domain: 'Executive', score: patient.cognitiveScores.executive },
  ];

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl md:text-3xl font-display font-bold">Profile</h1>

      {/* User Info */}
      <Card>
        <CardContent className="p-6 flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold">
            {patient.avatar}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-display font-bold">{patient.name}</h2>
            <p className="text-sm text-muted-foreground">{patient.email}</p>
            <div className="flex gap-3 mt-2">
              <Badge variant="secondary"><Flame className="h-3 w-3 mr-1" />{patient.streak} day streak</Badge>
              <Badge variant="secondary"><Zap className="h-3 w-3 mr-1" />Level {patient.level} • {patient.xp} XP</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cognitive Profile */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><BrainCircuit className="h-4 w-4" /> Cognitive Profile</CardTitle></CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="domain" tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                <Radar dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            {radarData.map(d => (
              <div key={d.domain} className="text-center">
                <p className="text-2xl font-display font-bold">{d.score}</p>
                <Progress value={d.score} className="h-1.5 mt-1" />
                <p className="text-xs text-muted-foreground mt-1">{d.domain}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Latest EEG */}
      {latestEEG && (
        <Card>
          <CardHeader><CardTitle className="text-base">Latest EEG Report</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{latestEEG.date}</p>
            <p className="text-sm">{latestEEG.findings}</p>
            <div className="flex flex-wrap gap-2">
              {latestEEG.anomalies.map((a, i) => (
                <Badge key={i} variant="outline" className="text-xs">{a}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => { setHasOnboarded(false); navigate('/onboarding'); }}>
          <RotateCcw className="h-4 w-4 mr-2" /> Redo Onboarding
        </Button>
        <Button variant="outline"><Settings className="h-4 w-4 mr-2" /> Settings</Button>
      </div>
    </div>
  );
}
