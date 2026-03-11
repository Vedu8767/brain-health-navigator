import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExerciseResult } from '@/types';

const PADS = [
  { id: 0, color: 'bg-red-500', activeColor: 'bg-red-300', label: 'Red' },
  { id: 1, color: 'bg-blue-500', activeColor: 'bg-blue-300', label: 'Blue' },
  { id: 2, color: 'bg-green-500', activeColor: 'bg-green-300', label: 'Green' },
  { id: 3, color: 'bg-yellow-500', activeColor: 'bg-yellow-300', label: 'Yellow' },
];

interface Props { onComplete: (result: ExerciseResult) => void; }

export default function SimonGame({ onComplete }: Props) {
  const [phase, setPhase] = useState<'instructions' | 'countdown' | 'playing' | 'done'>('instructions');
  const [countdown, setCountdown] = useState(3);
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerInput, setPlayerInput] = useState<number[]>([]);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [activePad, setActivePad] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  const [maxRound, setMaxRound] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown <= 0) { setPhase('playing'); addToSequence(); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  const addToSequence = useCallback(() => {
    const next = [...sequence, Math.floor(Math.random() * 4)];
    setSequence(next);
    setRound(r => r + 1);
    setPlayerInput([]);
    showSequence(next);
  }, [sequence]);

  const showSequence = (seq: number[]) => {
    setIsShowingSequence(true);
    seq.forEach((pad, i) => {
      setTimeout(() => { setActivePad(pad); }, i * 600);
      setTimeout(() => { setActivePad(null); }, i * 600 + 400);
    });
    setTimeout(() => { setIsShowingSequence(false); }, seq.length * 600 + 200);
  };

  const handlePadClick = useCallback((padId: number) => {
    if (isShowingSequence || phase !== 'playing' || gameOver) return;

    setActivePad(padId);
    setTimeout(() => setActivePad(null), 200);

    const newInput = [...playerInput, padId];
    setPlayerInput(newInput);

    const inputIndex = newInput.length - 1;
    if (newInput[inputIndex] !== sequence[inputIndex]) {
      setGameOver(true);
      setMaxRound(round);
      setPhase('done');
      return;
    }

    if (newInput.length === sequence.length) {
      setMaxRound(round);
      setTimeout(addToSequence, 800);
    }
  }, [isShowingSequence, phase, gameOver, playerInput, sequence, round, addToSequence]);

  useEffect(() => {
    if (phase !== 'done') return;
    const score = Math.min(100, Math.round((maxRound / 10) * 100));
    onComplete({ score, accuracy: score, timeSpent: round * 3, details: { longestSequence: maxRound } });
  }, [phase]);

  if (phase === 'instructions') {
    return (
      <Card>
        <CardContent className="p-6 text-center space-y-4">
          <div className="text-5xl">🔴</div>
          <h2 className="text-2xl font-display font-bold">Simon Game</h2>
          <p className="text-muted-foreground">Watch the sequence of colored pads light up, then repeat the exact same sequence. It gets longer each round!</p>
          <Badge variant="secondary">~4 minutes</Badge>
          <Button size="lg" className="w-full" onClick={() => { setPhase('countdown'); setCountdown(3); }}>Start</Button>
        </CardContent>
      </Card>
    );
  }

  if (phase === 'countdown') {
    return <div className="text-center"><p className="text-8xl font-display font-bold text-primary">{countdown}</p></div>;
  }

  return (
    <div className="text-center space-y-6">
      <div className="text-sm text-muted-foreground">
        {isShowingSequence ? 'Watch the sequence...' : gameOver ? 'Game Over!' : 'Your turn! Repeat the sequence'}
      </div>
      <p className="font-display font-bold text-lg">Round {round}</p>

      <div className="grid grid-cols-2 gap-4 max-w-[280px] mx-auto">
        {PADS.map(pad => (
          <button
            key={pad.id}
            className={`h-28 w-full rounded-2xl transition-all duration-200 ${activePad === pad.id ? `${pad.activeColor} scale-105 shadow-lg` : pad.color} ${isShowingSequence || gameOver ? 'cursor-default' : 'cursor-pointer active:scale-95'}`}
            onClick={() => handlePadClick(pad.id)}
            disabled={isShowingSequence || gameOver}
            aria-label={pad.label}
          />
        ))}
      </div>

      <div className="flex justify-center gap-1">
        {sequence.map((_, i) => (
          <div key={i} className={`h-2 w-2 rounded-full ${i < playerInput.length ? 'bg-primary' : 'bg-muted'}`} />
        ))}
      </div>
    </div>
  );
}
