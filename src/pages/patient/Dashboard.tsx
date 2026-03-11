import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useApp } from '@/contexts/AppContext';
import { exercises, sessionHistory, insights } from '@/data/mockData';
import { Mood } from '@/types';
import { Play, Flame, Star, Clock, TrendingUp, Zap, Heart, Meh, Frown, ThumbsDown } from 'lucide-react';

const moodOptions: { mood: Mood; icon: React.ReactNode; label: string }[] = [
  { mood: 'great', icon: <Star className="h-5 w-5" />, label: 'Great' },
  { mood: 'good', icon: <Heart className="h-5 w-5" />, label: 'Good' },
  { mood: 'okay', icon: <Meh className="h-5 w-5" />, label: 'Okay' },
  { mood: 'low', icon: <Frown className="h-5 w-5" />, label: 'Low' },
  { mood: 'bad', icon: <ThumbsDown className="h-5 w-5" />, label: 'Bad' },
];

const domainColors: Record<string, string> = {
  memory: 'bg-primary/10 text-primary',
  attention: 'bg-success/10 text-success',
  executive: 'bg-warning/10 text-warning',
};

export default function Dashboard() {
  const { patient, todayMood, setTodayMood, weeklyPlan } = useApp();
  const navigate = useNavigate();
  const todayExercises = weeklyPlan.Monday || [];
  const todayExerciseData = todayExercises.map(id => exercises.find(e => e.id === id)).filter(Boolean);
  const lastSession = sessionHistory[0];
  const totalExercises = sessionHistory.reduce((sum, s) => sum + s.exerciseResults.length, 0);
  const totalMinutes = Math.round(sessionHistory.reduce((sum, s) => sum + s.exerciseResults.reduce((t, r) => t + r.duration, 0), 0) / 60);

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Good morning, {patient.name.split(' ')[0]} 👋</h1>
          <p className="text-muted-foreground">Here's your brain training for today</p>
        </div>
        <Button size="lg" className="animate-pulse-glow gap-2" onClick={() => navigate('/session')}>
          <Play className="h-5 w-5" /> Start Session
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: <Flame className="h-5 w-5 text-warning" />, value: `${patient.streak} days`, label: 'Streak' },
          { icon: <Zap className="h-5 w-5 text-primary" />, value: `${patient.xp} XP`, label: `Level ${patient.level}` },
          { icon: <Clock className="h-5 w-5 text-success" />, value: `${totalMinutes} min`, label: 'Total Time' },
          { icon: <TrendingUp className="h-5 w-5 text-primary" />, value: `${totalExercises}`, label: 'Exercises Done' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                {stat.icon}
                <div>
                  <p className="font-display font-bold text-lg">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Mood Check-in */}
      {!todayMood && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium mb-3">How are you feeling today?</p>
            <div className="flex gap-2 flex-wrap">
              {moodOptions.map(m => (
                <Button key={m.mood} variant="outline" size="sm" className="gap-1.5" onClick={() => setTodayMood(m.mood)}>
                  {m.icon} {m.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Today's Plan */}
        <div className="md:col-span-2 space-y-3">
          <h2 className="text-lg font-display font-semibold">Today's Plan</h2>
          {todayExerciseData.map((ex, i) => ex && (
            <motion.div key={ex.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/session?exercise=${ex.id}`)}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{ex.icon}</span>
                    <div>
                      <p className="font-medium">{ex.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary" className={domainColors[ex.domain]}>{ex.domain}</Badge>
                        <span className="text-xs text-muted-foreground">{ex.duration} min</span>
                        <span className="text-xs text-muted-foreground">• {ex.difficulty}</span>
                      </div>
                    </div>
                  </div>
                  <Play className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Insights */}
        <div className="space-y-3">
          <h2 className="text-lg font-display font-semibold">Insights</h2>
          {insights.map((insight, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${insight.type === 'positive' ? 'bg-success' : insight.type === 'achievement' ? 'bg-warning' : 'bg-muted-foreground'}`} />
                  <div>
                    <p className="text-sm font-medium">{insight.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">{insight.suggestion}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Cognitive Summary */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <p className="text-sm font-medium">Cognitive Summary</p>
              {(['memory', 'attention', 'executive'] as const).map(domain => (
                <div key={domain}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="capitalize">{domain}</span>
                    <span className="font-medium">{patient.cognitiveScores[domain]}%</span>
                  </div>
                  <Progress value={patient.cognitiveScores[domain]} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
