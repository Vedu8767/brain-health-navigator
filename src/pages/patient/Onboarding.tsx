import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { BrainCircuit, ArrowRight, Loader2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

const symptoms = ['Difficulty concentrating', 'Memory lapses', 'Mental fatigue', 'Slow processing', 'Poor planning', 'Mood changes'];
const goals = ['Improve memory', 'Sharpen attention', 'Better executive function', 'Stress management', 'Brain fitness'];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [age, setAge] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const { setHasOnboarded, patient } = useApp();
  const navigate = useNavigate();

  const radarData = [
    { domain: 'Memory', score: patient.cognitiveScores.memory, fullMark: 100 },
    { domain: 'Attention', score: patient.cognitiveScores.attention, fullMark: 100 },
    { domain: 'Executive', score: patient.cognitiveScores.executive, fullMark: 100 },
  ];

  const handleAnalyze = () => {
    setAnalyzing(true);
    setTimeout(() => { setAnalyzing(false); setStep(2); }, 3000);
  };

  const finish = () => { setHasOnboarded(true); navigate('/dashboard'); };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <BrainCircuit className="h-12 w-12 text-primary mx-auto mb-3" />
          <h1 className="text-2xl font-display font-bold">Welcome to BrainHealthPro</h1>
          <p className="text-muted-foreground mt-1">Let's set up your cognitive profile</p>
        </div>

        <div className="flex gap-2 mb-6">
          {[0, 1, 2].map(i => (
            <div key={i} className={`flex-1 h-1.5 rounded-full ${i <= step ? 'bg-primary' : 'bg-muted'}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card>
                <CardHeader><CardTitle>About You</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input id="age" type="number" placeholder="Your age" value={age} onChange={e => setAge(e.target.value)} />
                  </div>
                  <div>
                    <Label>Current Symptoms</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {symptoms.map(s => (
                        <label key={s} className="flex items-center gap-2 text-sm cursor-pointer">
                          <Checkbox checked={selectedSymptoms.includes(s)} onCheckedChange={c => setSelectedSymptoms(c ? [...selectedSymptoms, s] : selectedSymptoms.filter(x => x !== s))} />
                          {s}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Goals</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {goals.map(g => (
                        <label key={g} className="flex items-center gap-2 text-sm cursor-pointer">
                          <Checkbox checked={selectedGoals.includes(g)} onCheckedChange={c => setSelectedGoals(c ? [...selectedGoals, g] : selectedGoals.filter(x => x !== g))} />
                          {g}
                        </label>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full" onClick={() => setStep(1)}>Continue <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card>
                <CardHeader><CardTitle>EEG Analysis</CardTitle></CardHeader>
                <CardContent className="text-center space-y-6">
                  {analyzing ? (
                    <>
                      <Loader2 className="h-16 w-16 text-primary mx-auto animate-spin" />
                      <p className="text-muted-foreground">Analyzing your cognitive baseline...</p>
                      <Progress value={66} className="w-full" />
                    </>
                  ) : (
                    <>
                      <div className="border-2 border-dashed border-muted rounded-lg p-8">
                        <BrainCircuit className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">Upload your EEG file or use our simulated analysis</p>
                      </div>
                      <Button className="w-full" onClick={handleAnalyze}>Run Simulated Analysis <ArrowRight className="ml-2 h-4 w-4" /></Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card>
                <CardHeader><CardTitle>Your Cognitive Profile</CardTitle></CardHeader>
                <CardContent className="space-y-4">
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
                  <div className="grid grid-cols-3 gap-3 text-center">
                    {radarData.map(d => (
                      <div key={d.domain} className="rounded-lg bg-muted p-3">
                        <p className="text-2xl font-bold font-display">{d.score}</p>
                        <p className="text-xs text-muted-foreground">{d.domain}</p>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full" onClick={finish}>Start Training <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
