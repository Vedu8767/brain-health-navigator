import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { patients, exercises } from '@/data/mockData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Send, Check } from 'lucide-react';

export default function ClinPlans() {
  const [selectedPatient, setSelectedPatient] = useState(patients[0].id);
  const [planExercises, setPlanExercises] = useState<string[]>(['nback', 'stroop', 'trail']);
  const [sent, setSent] = useState(false);

  const patient = patients.find(p => p.id === selectedPatient)!;
  const recommended = exercises.filter(e => {
    if (patient.cognitiveScores.memory < 60 && e.domain === 'memory') return true;
    if (patient.cognitiveScores.attention < 60 && e.domain === 'attention') return true;
    if (patient.cognitiveScores.executive < 60 && e.domain === 'executive') return true;
    return false;
  }).slice(0, 5);

  const addExercise = (id: string) => {
    if (!planExercises.includes(id)) setPlanExercises([...planExercises, id]);
  };
  const removeExercise = (id: string) => setPlanExercises(planExercises.filter(e => e !== id));

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold">Rehabilitation Plans</h1>
        <p className="text-muted-foreground">Create and manage patient exercise plans</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Select Patient</CardTitle></CardHeader>
        <CardContent>
          <Select value={selectedPatient} onValueChange={v => { setSelectedPatient(v); setSent(false); }}>
            <SelectTrigger className="w-full max-w-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {patients.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name} — {p.condition}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recommended */}
        <Card>
          <CardHeader><CardTitle className="text-base">AI-Recommended Exercises</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground mb-2">Based on {patient.name}'s cognitive profile</p>
            {recommended.map(ex => (
              <div key={ex.id} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-2">
                  <span>{ex.icon}</span>
                  <div>
                    <p className="text-sm font-medium">{ex.name}</p>
                    <p className="text-xs text-muted-foreground">{ex.domain} • {ex.difficulty}</p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => addExercise(ex.id)} disabled={planExercises.includes(ex.id)}>
                  {planExercises.includes(ex.id) ? <Check className="h-4 w-4 text-success" /> : <Plus className="h-4 w-4" />}
                </Button>
              </div>
            ))}
            {recommended.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">All scores are above threshold — no urgent recommendations</p>
            )}
          </CardContent>
        </Card>

        {/* Current Plan */}
        <Card>
          <CardHeader><CardTitle className="text-base">Current Plan</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {planExercises.map(id => {
              const ex = exercises.find(e => e.id === id);
              if (!ex) return null;
              return (
                <div key={id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <span>{ex.icon}</span>
                    <span className="text-sm">{ex.name}</span>
                  </div>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => removeExercise(id)}>Remove</Button>
                </div>
              );
            })}
            {planExercises.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No exercises added yet</p>}

            <div className="pt-3">
              <textarea className="w-full h-20 p-3 rounded-lg border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Add clinical goals and notes..." />
              <Button className="w-full mt-2 gap-2" disabled={planExercises.length === 0 || sent} onClick={() => setSent(true)}>
                {sent ? <><Check className="h-4 w-4" /> Plan Assigned</> : <><Send className="h-4 w-4" /> Assign Plan to {patient.name.split(' ')[0]}</>}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
