import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExerciseResult } from '@/types';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const TOTAL_TRIALS = 20;

interface Props { onComplete: (result: ExerciseResult) => void; }

export default function NBackGame({ onComplete }: Props) {
  const [phase, setPhase] = useState<'instructions' | 'countdown' | 'playing' | 'done'>('instructions');
  const [countdown, setCountdown] = useState(3);
  const [nLevel] = useState(2);
  const [sequence, setSequence] = useState<string[]>([]);
  const [currentTrial, setCurrentTrial] = useState(0);
  const [showingLetter, setShowingLetter] = useState(true);
  const [score, setScore] = useState({ hits: 0, misses: 0, falseAlarms: 0, correctRejections: 0 });
  const [responded, setResponded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  // Generate sequence with ~30% matches
  useEffect(() => {
    const seq: string[] = [];
    for (let i = 0; i < TOTAL_TRIALS; i++) {
      if (i >= nLevel && Math.random() < 0.3) {
        seq.push(seq[i - nLevel]);
      } else {
        let letter;
        do { letter = LETTERS[Math.floor(Math.random() * LETTERS.length)]; }
        while (i >= nLevel && letter === seq[i - nLevel]);
        seq.push(letter);
      }
    }
    setSequence(seq);
  }, [nLevel]);

  // Countdown
  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown <= 0) { setPhase('playing'); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  // Trial progression
  useEffect(() => {
    if (phase !== 'playing' || currentTrial >= TOTAL_TRIALS) return;

    setShowingLetter(true);
    setResponded(false);

    timerRef.current = setTimeout(() => {
      // If no response and it was a match, count as miss
      if (!responded) {
        const isMatch = currentTrial >= nLevel && sequence[currentTrial] === sequence[currentTrial - nLevel];
        if (isMatch) setScore(s => ({ ...s, misses: s.misses + 1 }));
        else setScore(s => ({ ...s, correctRejections: s.correctRejections + 1 }));
      }
      setShowingLetter(false);
      setTimeout(() => {
        if (currentTrial < TOTAL_TRIALS - 1) setCurrentTrial(t => t + 1);
        else setPhase('done');
      }, 500);
    }, 2000);

    return () => clearTimeout(timerRef.current);
  }, [phase, currentTrial, sequence, nLevel]);

  const handleMatch = useCallback(() => {
    if (responded || phase !== 'playing') return;
    setResponded(true);
    const isMatch = currentTrial >= nLevel && sequence[currentTrial] === sequence[currentTrial - nLevel];
    if (isMatch) setScore(s => ({ ...s, hits: s.hits + 1 }));
    else setScore(s => ({ ...s, falseAlarms: s.falseAlarms + 1 }));
  }, [responded, phase, currentTrial, nLevel, sequence]);

  useEffect(() => {
    if (phase !== 'done') return;
    const total = score.hits + score.correctRejections;
    const totalAll = TOTAL_TRIALS;
    const accuracy = Math.round((total / totalAll) * 100);
    onComplete({ score: accuracy, accuracy, timeSpent: TOTAL_TRIALS * 2.5, details: score });
  }, [phase]);

  if (phase === 'instructions') {
    return (
      <Card>
        <CardContent className="p-6 text-center space-y-4">
          <div className="text-5xl">🧠</div>
          <h2 className="text-2xl font-display font-bold">N-Back Memory</h2>
          <p className="text-muted-foreground">Letters appear one at a time. Press <strong>"Match"</strong> if the current letter is the same as the one <strong>{nLevel} positions back</strong>.</p>
          <div className="bg-muted rounded-lg p-4 text-sm">
            <p>Example (2-back): A → B → <strong>A</strong> ← Match!</p>
          </div>
          <Badge variant="secondary">{TOTAL_TRIALS} trials • ~{Math.round(TOTAL_TRIALS * 2.5 / 60)} minutes</Badge>
          <Button size="lg" className="w-full" onClick={() => { setPhase('countdown'); setCountdown(3); }}>Start</Button>
        </CardContent>
      </Card>
    );
  }

  if (phase === 'countdown') {
    return (
      <div className="text-center">
        <p className="text-8xl font-display font-bold text-primary">{countdown}</p>
        <p className="text-muted-foreground mt-2">Get ready...</p>
      </div>
    );
  }

  if (phase === 'playing') {
    return (
      <div className="text-center space-y-8">
        <div className="text-xs text-muted-foreground">Trial {currentTrial + 1} / {TOTAL_TRIALS}</div>
        <div className={`text-8xl font-display font-bold transition-all duration-200 ${showingLetter ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
          {sequence[currentTrial]}
        </div>
        <Button size="lg" className="w-48 h-14 text-lg" onClick={handleMatch} disabled={responded}>
          {responded ? '✓ Responded' : `Match (${nLevel}-back)`}
        </Button>
        <div className="flex justify-center gap-4 text-xs text-muted-foreground">
          <span>Hits: {score.hits}</span>
          <span>False Alarms: {score.falseAlarms}</span>
        </div>
      </div>
    );
  }

  return null;
}
