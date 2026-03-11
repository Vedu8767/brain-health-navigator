import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExerciseResult } from '@/types';

const COLORS = ['red', 'blue', 'green', 'yellow'] as const;
const COLOR_DISPLAY: Record<string, { bg: string; label: string }> = {
  red: { bg: 'bg-red-500', label: 'Red' },
  blue: { bg: 'bg-blue-500', label: 'Blue' },
  green: { bg: 'bg-green-500', label: 'Green' },
  yellow: { bg: 'bg-yellow-500', label: 'Yellow' },
};
const TOTAL_TRIALS = 20;

interface Trial { word: string; inkColor: typeof COLORS[number]; }

function generateTrials(): Trial[] {
  return Array.from({ length: TOTAL_TRIALS }, () => {
    const word = COLORS[Math.floor(Math.random() * COLORS.length)];
    let ink: typeof COLORS[number];
    do { ink = COLORS[Math.floor(Math.random() * COLORS.length)]; } while (ink === word);
    return { word, inkColor: ink };
  });
}

interface Props { onComplete: (result: ExerciseResult) => void; }

export default function StroopTest({ onComplete }: Props) {
  const [phase, setPhase] = useState<'instructions' | 'countdown' | 'playing' | 'done'>('instructions');
  const [countdown, setCountdown] = useState(3);
  const [trials] = useState(generateTrials);
  const [current, setCurrent] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [trialTimes, setTrialTimes] = useState<number[]>([]);
  const [trialStart, setTrialStart] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown <= 0) { setPhase('playing'); setStartTime(Date.now()); setTrialStart(Date.now()); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  const handleAnswer = useCallback((color: typeof COLORS[number]) => {
    if (phase !== 'playing' || feedback) return;
    const isCorrect = color === trials[current].inkColor;
    if (isCorrect) setCorrect(c => c + 1);
    setFeedback(isCorrect ? 'correct' : 'wrong');
    setTrialTimes(prev => [...prev, Date.now() - trialStart]);

    setTimeout(() => {
      setFeedback(null);
      if (current < TOTAL_TRIALS - 1) {
        setCurrent(c => c + 1);
        setTrialStart(Date.now());
      } else {
        setPhase('done');
      }
    }, 600);
  }, [phase, feedback, trials, current, trialStart]);

  useEffect(() => {
    if (phase !== 'done') return;
    const accuracy = Math.round((correct / TOTAL_TRIALS) * 100);
    const avgTime = trialTimes.length > 0 ? Math.round(trialTimes.reduce((s, t) => s + t, 0) / trialTimes.length) : 0;
    onComplete({ score: accuracy, accuracy, timeSpent: (Date.now() - startTime) / 1000, details: { correct, total: TOTAL_TRIALS, avgReactionTime: avgTime } });
  }, [phase]);

  const inkColorClass: Record<string, string> = {
    red: 'text-red-500', blue: 'text-blue-500', green: 'text-green-500', yellow: 'text-yellow-500',
  };

  if (phase === 'instructions') {
    return (
      <Card>
        <CardContent className="p-6 text-center space-y-4">
          <div className="text-5xl">🎨</div>
          <h2 className="text-2xl font-display font-bold">Stroop Test</h2>
          <p className="text-muted-foreground">A color word will appear in a <strong>different</strong> ink color. Tap the button matching the <strong>INK COLOR</strong>, not the word.</p>
          <div className="bg-muted rounded-lg p-4">
            <p className="text-xl font-bold text-blue-500">RED</p>
            <p className="text-xs text-muted-foreground mt-1">↑ Correct answer: Blue (the ink color)</p>
          </div>
          <Badge variant="secondary">{TOTAL_TRIALS} trials • ~3 minutes</Badge>
          <Button size="lg" className="w-full" onClick={() => { setPhase('countdown'); setCountdown(3); }}>Start</Button>
        </CardContent>
      </Card>
    );
  }

  if (phase === 'countdown') {
    return <div className="text-center"><p className="text-8xl font-display font-bold text-primary">{countdown}</p></div>;
  }

  if (phase === 'playing') {
    const trial = trials[current];
    return (
      <div className="text-center space-y-8">
        <div className="text-xs text-muted-foreground">{current + 1} / {TOTAL_TRIALS}</div>
        <div className={`text-7xl font-display font-bold ${inkColorClass[trial.inkColor]} transition-all ${feedback === 'correct' ? 'scale-110' : feedback === 'wrong' ? 'scale-90 opacity-50' : ''}`}>
          {trial.word.toUpperCase()}
        </div>
        {feedback && (
          <p className={`text-lg font-bold ${feedback === 'correct' ? 'text-success' : 'text-destructive'}`}>
            {feedback === 'correct' ? '✓ Correct!' : '✗ Wrong!'}
          </p>
        )}
        <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
          {COLORS.map(color => (
            <Button key={color} size="lg" className={`${COLOR_DISPLAY[color].bg} hover:opacity-80 text-white h-14`} onClick={() => handleAnswer(color)} disabled={!!feedback}>
              {COLOR_DISPLAY[color].label}
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Score: {correct}/{current + (feedback ? 1 : 0)}</p>
      </div>
    );
  }

  return null;
}
