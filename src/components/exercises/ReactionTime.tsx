import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExerciseResult } from '@/types';

const TOTAL_ROUNDS = 5;

interface Props { onComplete: (result: ExerciseResult) => void; }

export default function ReactionTime({ onComplete }: Props) {
  const [phase, setPhase] = useState<'instructions' | 'countdown' | 'playing' | 'done'>('instructions');
  const [countdown, setCountdown] = useState(3);
  const [round, setRound] = useState(0);
  const [state, setState] = useState<'waiting' | 'ready' | 'go' | 'result' | 'early'>('waiting');
  const [times, setTimes] = useState<number[]>([]);
  const [goTime, setGoTime] = useState(0);
  const [reactionTime, setReactionTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown <= 0) { setPhase('playing'); startRound(); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  const startRound = () => {
    setState('ready');
    const delay = 1500 + Math.random() * 3500;
    timerRef.current = setTimeout(() => {
      setState('go');
      setGoTime(Date.now());
    }, delay);
  };

  const handleTap = useCallback(() => {
    if (state === 'ready') {
      clearTimeout(timerRef.current);
      setState('early');
      setTimeout(startRound, 1500);
      return;
    }
    if (state === 'go') {
      const rt = Date.now() - goTime;
      setReactionTime(rt);
      setTimes(prev => [...prev, rt]);
      setState('result');

      setTimeout(() => {
        if (round + 1 < TOTAL_ROUNDS) {
          setRound(r => r + 1);
          startRound();
        } else {
          setPhase('done');
        }
      }, 1500);
    }
  }, [state, goTime, round]);

  useEffect(() => {
    if (phase !== 'done') return;
    const avg = times.length > 0 ? Math.round(times.reduce((s, t) => s + t, 0) / times.length) : 999;
    const score = Math.max(0, Math.min(100, Math.round(100 - (avg - 150) / 5)));
    onComplete({ score, accuracy: score, timeSpent: TOTAL_ROUNDS * 4, details: { times, average: avg } });
  }, [phase]);

  if (phase === 'instructions') {
    return (
      <Card>
        <CardContent className="p-6 text-center space-y-4">
          <div className="text-5xl">⚡</div>
          <h2 className="text-2xl font-display font-bold">Reaction Time</h2>
          <p className="text-muted-foreground">Wait for the screen to turn <strong className="text-success">green</strong>, then tap as quickly as possible!</p>
          <p className="text-sm text-muted-foreground">Don't tap too early — wait for the green signal.</p>
          <Badge variant="secondary">{TOTAL_ROUNDS} rounds • ~2 minutes</Badge>
          <Button size="lg" className="w-full" onClick={() => { setPhase('countdown'); setCountdown(3); }}>Start</Button>
        </CardContent>
      </Card>
    );
  }

  if (phase === 'countdown') {
    return <div className="text-center"><p className="text-8xl font-display font-bold text-primary">{countdown}</p></div>;
  }

  const bgColor = state === 'ready' ? 'bg-destructive/20' : state === 'go' ? 'bg-success/30' : state === 'early' ? 'bg-warning/20' : 'bg-muted';

  return (
    <div className="space-y-4">
      <div className="text-center text-sm text-muted-foreground">Round {round + 1} / {TOTAL_ROUNDS}</div>

      <button
        className={`w-full aspect-[3/2] rounded-2xl flex items-center justify-center transition-colors duration-200 cursor-pointer ${bgColor}`}
        onClick={handleTap}
        disabled={state === 'result'}
      >
        {state === 'waiting' && <p className="text-muted-foreground">Loading...</p>}
        {state === 'ready' && <p className="text-xl font-display font-bold text-destructive">Wait...</p>}
        {state === 'go' && <p className="text-3xl font-display font-bold text-success">TAP NOW!</p>}
        {state === 'early' && <p className="text-xl font-display font-bold text-warning">Too early! Wait for green.</p>}
        {state === 'result' && (
          <div className="text-center">
            <p className="text-5xl font-display font-bold">{reactionTime}ms</p>
            <p className="text-sm text-muted-foreground mt-1">
              {reactionTime < 200 ? 'Excellent! 🔥' : reactionTime < 300 ? 'Good! 👍' : reactionTime < 400 ? 'Average' : 'Keep trying!'}
            </p>
          </div>
        )}
      </button>

      {times.length > 0 && (
        <div className="flex gap-2 justify-center flex-wrap">
          {times.map((t, i) => (
            <Badge key={i} variant="outline" className="text-xs">{t}ms</Badge>
          ))}
        </div>
      )}
    </div>
  );
}
