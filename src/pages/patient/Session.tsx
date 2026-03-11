import { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { exercises } from '@/data/mockData';
import { ExerciseResult } from '@/types';
import NBackGame from '@/components/exercises/NBackGame';
import StroopTest from '@/components/exercises/StroopTest';
import SimonGame from '@/components/exercises/SimonGame';
import TrailMaking from '@/components/exercises/TrailMaking';
import ReactionTime from '@/components/exercises/ReactionTime';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Play, Pause, SkipForward, X, Trophy, Zap } from 'lucide-react';

const exerciseComponents: Record<string, React.FC<{ onComplete: (result: ExerciseResult) => void }>> = {
  nback: NBackGame, stroop: StroopTest, simon: SimonGame, trail: TrailMaking, reaction: ReactionTime,
};

export default function Session() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const singleExercise = params.get('exercise');
  const exerciseIds = singleExercise ? [singleExercise] : ['nback', 'stroop', 'reaction'];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<{ exerciseId: string; result: ExerciseResult }[]>([]);
  const [phase, setPhase] = useState<'ready' | 'playing' | 'summary'>('ready');
  const [paused, setPaused] = useState(false);

  const currentExerciseId = exerciseIds[currentIndex];
  const currentExercise = exercises.find(e => e.id === currentExerciseId);
  const ExerciseComponent = currentExerciseId ? exerciseComponents[currentExerciseId] : null;

  const handleComplete = useCallback((result: ExerciseResult) => {
    setResults(prev => [...prev, { exerciseId: currentExerciseId, result }]);
    if (currentIndex < exerciseIds.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setPhase('summary');
    }
  }, [currentExerciseId, currentIndex, exerciseIds.length]);

  const totalXP = results.reduce((sum, r) => sum + Math.round(r.result.score * 2), 0);
  const avgScore = results.length > 0 ? Math.round(results.reduce((sum, r) => sum + r.result.score, 0) / results.length) : 0;

  // Mock EEG engagement data
  const engagementData = Array.from({ length: 30 }, (_, i) => ({
    time: i, engagement: 40 + Math.random() * 40 + Math.sin(i / 3) * 10,
  }));

  if (phase === 'ready') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
          <div className="text-6xl mb-4">{currentExercise?.icon || '🧠'}</div>
          <h1 className="text-3xl font-display font-bold mb-2">Ready to Train?</h1>
          <p className="text-muted-foreground mb-2">{exerciseIds.length} exercise{exerciseIds.length > 1 ? 's' : ''} in this session</p>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {exerciseIds.map(id => {
              const ex = exercises.find(e => e.id === id);
              return ex ? <span key={id} className="text-xs bg-muted px-2 py-1 rounded">{ex.icon} {ex.name}</span> : null;
            })}
          </div>
          <Button size="lg" className="gap-2" onClick={() => setPhase('playing')}>
            <Play className="h-5 w-5" /> Start Session
          </Button>
          <Button variant="ghost" className="ml-2" onClick={() => navigate(-1)}>Cancel</Button>
        </motion.div>
      </div>
    );
  }

  if (phase === 'summary') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg">
          <Card>
            <CardContent className="p-6 text-center space-y-6">
              <Trophy className="h-16 w-16 text-warning mx-auto" />
              <h1 className="text-3xl font-display font-bold">Session Complete!</h1>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-3xl font-display font-bold text-primary">{avgScore}%</p>
                  <p className="text-xs text-muted-foreground">Avg Score</p>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-3xl font-display font-bold text-warning">+{totalXP}</p>
                  <p className="text-xs text-muted-foreground">XP Earned</p>
                </div>
              </div>
              {results.map(r => {
                const ex = exercises.find(e => e.id === r.exerciseId);
                return (
                  <div key={r.exerciseId} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm">{ex?.icon} {ex?.name}</span>
                    <span className="font-display font-bold">{r.result.score}%</span>
                  </div>
                );
              })}
              <div className="h-32">
                <p className="text-xs text-muted-foreground mb-2">EEG Engagement (simulated)</p>
                <ResponsiveContainer>
                  <LineChart data={engagementData}>
                    <Line type="monotone" dataKey="engagement" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                    <XAxis hide /><YAxis hide domain={[0, 100]} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex gap-3">
                <Button className="flex-1" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
                <Button variant="outline" className="flex-1" onClick={() => navigate('/progress')}>View Progress</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-3 border-b bg-card">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><X className="h-4 w-4" /></Button>
        <div className="flex-1 mx-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>{currentExercise?.name}</span>
            <span>{currentIndex + 1}/{exerciseIds.length}</span>
          </div>
          <Progress value={((currentIndex) / exerciseIds.length) * 100} className="h-1.5" />
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => setPaused(!paused)}>
            {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleComplete({ score: 0, accuracy: 0, timeSpent: 0, details: {} })}>
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Exercise Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          <motion.div key={currentExerciseId} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="w-full max-w-2xl">
            {ExerciseComponent && !paused ? (
              <ExerciseComponent onComplete={handleComplete} />
            ) : !ExerciseComponent ? (
              <div className="text-center">
                <p className="text-lg text-muted-foreground">Exercise not available</p>
                <Button className="mt-4" onClick={() => handleComplete({ score: 50, accuracy: 50, timeSpent: 0, details: {} })}>Skip</Button>
              </div>
            ) : (
              <div className="text-center">
                <Pause className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-display font-semibold">Paused</p>
                <Button className="mt-4" onClick={() => setPaused(false)}>Resume</Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
