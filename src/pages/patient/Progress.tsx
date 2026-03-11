import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { progressData, insights, sessionHistory } from '@/data/mockData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, Legend } from 'recharts';
import { TrendingUp, Calendar, Target } from 'lucide-react';

export default function Progress() {
  const { patient } = useApp();

  const radialData = [
    { name: 'Memory', value: patient.cognitiveScores.memory, fill: 'hsl(var(--primary))' },
    { name: 'Attention', value: patient.cognitiveScores.attention, fill: 'hsl(var(--success))' },
    { name: 'Executive', value: patient.cognitiveScores.executive, fill: 'hsl(var(--warning))' },
  ];

  const avgScore = Math.round((patient.cognitiveScores.memory + patient.cognitiveScores.attention + patient.cognitiveScores.executive) / 3);

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold">Progress & Insights</h1>
        <p className="text-muted-foreground">Track your cognitive improvement over time</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: <Target className="h-5 w-5 text-primary" />, value: `${avgScore}%`, label: 'Overall Score' },
          { icon: <TrendingUp className="h-5 w-5 text-success" />, value: '+12%', label: 'This Month' },
          { icon: <Calendar className="h-5 w-5 text-warning" />, value: `${sessionHistory.length}`, label: 'Sessions' },
        ].map((s, i) => (
          <Card key={i}><CardContent className="p-4 text-center">{s.icon}<p className="font-display font-bold text-xl mt-1">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></CardContent></Card>
        ))}
      </div>

      {/* Line Chart */}
      <Card>
        <CardHeader><CardTitle className="text-base">Performance Trends</CardTitle></CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={d => d.slice(5)} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="memory" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} name="Memory" />
                <Line type="monotone" dataKey="attention" stroke="hsl(var(--success))" strokeWidth={2} dot={{ r: 4 }} name="Attention" />
                <Line type="monotone" dataKey="executive" stroke="hsl(var(--warning))" strokeWidth={2} dot={{ r: 4 }} name="Executive" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Radial Chart */}
        <Card>
          <CardHeader><CardTitle className="text-base">Domain Mastery</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer>
                <RadialBarChart innerRadius="30%" outerRadius="90%" data={radialData} startAngle={180} endAngle={0}>
                  <RadialBar dataKey="value" cornerRadius={8} />
                  <Legend iconSize={10} formatter={(value) => <span className="text-xs">{value}</span>} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card>
          <CardHeader><CardTitle className="text-base">AI Insights</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {insights.map((insight, i) => (
              <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-muted">
                <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${insight.type === 'positive' ? 'bg-success' : insight.type === 'achievement' ? 'bg-warning' : 'bg-muted-foreground'}`} />
                <div>
                  <p className="text-sm font-medium">{insight.text}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{insight.suggestion}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Session History */}
      <Card>
        <CardHeader><CardTitle className="text-base">Recent Sessions</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sessionHistory.map(session => (
              <div key={session.id} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div>
                  <p className="text-sm font-medium">{session.date}</p>
                  <p className="text-xs text-muted-foreground">{session.exerciseResults.length} exercises</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-display font-bold text-primary">+{session.totalXP} XP</p>
                  <p className="text-xs text-muted-foreground">Avg: {Math.round(session.exerciseResults.reduce((s, r) => s + r.score, 0) / session.exerciseResults.length)}%</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
