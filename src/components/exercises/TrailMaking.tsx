import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExerciseResult } from '@/types';

const TOTAL_CIRCLES = 15;

function generateCircles() {
  const circles: { id: number; x: number; y: number }[] = [];
  for (let i = 1; i <= TOTAL_CIRCLES; i++) {
    let x: number, y: number, valid: boolean;
    do {
      x = 10 + Math.random() * 80;
      y = 10 + Math.random() * 80;
      valid = circles.every(c => Math.hypot(c.x - x, c.y - y) > 12);
    } while (!valid);
    circles.push({ id: i, x, y });
  }
  return circles;
}

interface Props { onComplete: (result: ExerciseResult) => void; }

export default function TrailMaking({ onComplete }: Props) {
  const [phase, setPhase] = useState<'instructions' | 'countdown' | 'playing' | 'done'>('instructions');
  const [countdown, setCountdown] = useState(3);
  const [circles] = useState(generateCircles);
  const [currentTarget, setCurrentTarget] = useState(1);
  const [clicked, setClicked] = useState<number[]>([]);
  const [errors, setErrors] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [wrongFlash, setWrongFlash] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown <= 0) { setPhase('playing'); setStartTime(Date.now()); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  useEffect(() => {
    if (phase !== 'playing') return;
    intervalRef.current = setInterval(() => setElapsed((Date.now() - startTime) / 1000), 100);
    return () => clearInterval(intervalRef.current);
  }, [phase, startTime]);

  const handleClick = useCallback((id: number) => {
    if (phase !== 'playing') return;
    if (id === currentTarget) {
      setClicked(prev => [...prev, id]);
      if (currentTarget === TOTAL_CIRCLES) {
        clearInterval(intervalRef.current);
        setPhase('done');
      } else {
        setCurrentTarget(t => t + 1);
      }
    } else {
      setErrors(e => e + 1);
      setWrongFlash(id);
      setTimeout(() => setWrongFlash(null), 500);
    }
  }, [phase, currentTarget]);

  useEffect(() => {
    if (phase !== 'done') return;
    const time = (Date.now() - startTime) / 1000;
    const baseScore = Math.max(0, 100 - Math.round(time * 2) - errors * 5);
    onComplete({ score: baseScore, accuracy: Math.round(((TOTAL_CIRCLES) / (TOTAL_CIRCLES + errors)) * 100), timeSpent: time, details: { errors, time: Math.round(time) } });
  }, [phase]);

  if (phase === 'instructions') {
    return (
      <Card>
        <CardContent className="p-6 text-center space-y-4">
          <div className="text-5xl">🔗</div>
          <h2 className="text-2xl font-display font-bold">Trail Making</h2>
          <p className="text-muted-foreground">Click the numbered circles in ascending order (1 → 2 → 3 → ...) as fast as you can!</p>
          <Badge variant="secondary">{TOTAL_CIRCLES} circles • ~7 minutes max</Badge>
          <Button size="lg" className="w-full" onClick={() => { setPhase('countdown'); setCountdown(3); }}>Start</Button>
        </CardContent>
      </Card>
    );
  }

  if (phase === 'countdown') {
    return <div className="text-center"><p className="text-8xl font-display font-bold text-primary">{countdown}</p></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Next: <strong>{currentTarget}</strong></span>
        <span className="font-display font-bold">{elapsed.toFixed(1)}s</span>
        <span className="text-muted-foreground">Errors: {errors}</span>
      </div>

      <div className="relative w-full aspect-square bg-muted rounded-xl border-2 border-border">
        {circles.map(circle => {
          const isDone = clicked.includes(circle.id);
          const isNext = circle.id === currentTarget;
          const isWrong = wrongFlash === circle.id;

          return (
            <button
              key={circle.id}
              className={`absolute w-10 h-10 -ml-5 -mt-5 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200
                ${isDone ? 'bg-success text-success-foreground scale-75 opacity-60' : isWrong ? 'bg-destructive text-destructive-foreground scale-110' : isNext ? 'bg-primary text-primary-foreground animate-pulse-glow scale-110' : 'bg-card text-card-foreground border-2 border-border hover:border-primary'}`}
              style={{ left: `${circle.x}%`, top: `${circle.y}%` }}
              onClick={() => handleClick(circle.id)}
              disabled={isDone}
              aria-label={`Circle ${circle.id}`}
            >
              {circle.id}
            </button>
          );
        })}

        {/* Lines connecting clicked circles */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {clicked.slice(1).map((id, i) => {
            const prev = circles.find(c => c.id === clicked[i])!;
            const curr = circles.find(c => c.id === id)!;
            return (
              <line key={i} x1={`${prev.x}%`} y1={`${prev.y}%`} x2={`${curr.x}%`} y2={`${curr.y}%`} stroke="hsl(var(--primary))" strokeWidth="2" opacity="0.5" />
            );
          })}
        </svg>
      </div>
    </div>
  );
}
