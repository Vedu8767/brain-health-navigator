import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { patients, eegReports, sessionHistory, progressData } from '@/data/mockData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, Activity, Calendar, TrendingUp, Brain } from 'lucide-react';

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const patient = patients.find(p => p.id === id) || patients[0];
  const eeg = eegReports.find(r => r.patientId === patient.id);

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/patients')}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-lg font-bold">{patient.avatar}</div>
        <div>
          <h1 className="text-2xl font-display font-bold">{patient.name}</h1>
          <p className="text-muted-foreground">Age {patient.age} • {patient.condition}</p>
        </div>
        <Badge className="ml-auto" variant="outline">{patient.status}</Badge>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Adherence', value: `${patient.adherence}%`, icon: <Activity className="h-4 w-4" /> },
          { label: 'Streak', value: `${patient.streak} days`, icon: <Calendar className="h-4 w-4" /> },
          { label: 'Level', value: `${patient.level}`, icon: <TrendingUp className="h-4 w-4" /> },
          { label: 'XP', value: `${patient.xp}`, icon: <Brain className="h-4 w-4" /> },
        ].map((m, i) => (
          <Card key={i}><CardContent className="p-3 flex items-center gap-2">{m.icon}<div><p className="font-display font-bold">{m.value}</p><p className="text-xs text-muted-foreground">{m.label}</p></div></CardContent></Card>
        ))}
      </div>

      {/* Cognitive Scores */}
      <Card>
        <CardHeader><CardTitle className="text-base">Cognitive Scores</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            {(['memory', 'attention', 'executive'] as const).map(d => (
              <div key={d} className="text-center">
                <p className="text-3xl font-display font-bold">{patient.cognitiveScores[d]}</p>
                <Progress value={patient.cognitiveScores[d]} className="h-2 mt-2" />
                <p className="text-xs text-muted-foreground mt-1 capitalize">{d}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trend Chart */}
      <Card>
        <CardHeader><CardTitle className="text-base">Performance Trends</CardTitle></CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={d => d.slice(5)} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="memory" stroke="hsl(var(--primary))" strokeWidth={2} name="Memory" />
                <Line type="monotone" dataKey="attention" stroke="hsl(var(--success))" strokeWidth={2} name="Attention" />
                <Line type="monotone" dataKey="executive" stroke="hsl(var(--warning))" strokeWidth={2} name="Executive" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* EEG Report */}
      {eeg && (
        <Card>
          <CardHeader><CardTitle className="text-base">Latest EEG Report — {eeg.date}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">{eeg.findings}</p>
            <div className="flex flex-wrap gap-2">
              {eeg.anomalies.map((a, i) => <Badge key={i} variant="outline">{a}</Badge>)}
            </div>
            <div className="space-y-2 mt-4">
              <p className="text-sm font-medium">Suggested Diagnoses</p>
              {eeg.suggestedDiagnoses.map((d, i) => (
                <div key={i} className="flex items-center justify-between bg-muted p-2 rounded-lg">
                  <span className="text-sm">{d.name}</span>
                  <Badge variant={i === 0 ? 'default' : 'secondary'}>{d.confidence}%</Badge>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate(`/eeg/${eeg.id}`)}>View Full EEG Analysis</Button>
          </CardContent>
        </Card>
      )}

      {/* Recent Sessions */}
      <Card>
        <CardHeader><CardTitle className="text-base">Recent Sessions</CardTitle></CardHeader>
        <CardContent>
          {sessionHistory.slice(0, 3).map(s => (
            <div key={s.id} className="flex items-center justify-between p-3 border-b last:border-0">
              <div><p className="text-sm font-medium">{s.date}</p><p className="text-xs text-muted-foreground">{s.exerciseResults.length} exercises</p></div>
              <p className="font-display font-bold text-primary">+{s.totalXP} XP</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
