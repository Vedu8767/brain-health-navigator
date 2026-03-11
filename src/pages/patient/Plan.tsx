import { useApp } from '@/contexts/AppContext';
import { exercises } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { X, Clock } from 'lucide-react';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function Plan() {
  const { weeklyPlan, setWeeklyPlan, timeCommitment, setTimeCommitment } = useApp();

  const removeFromDay = (day: string, exerciseId: string) => {
    setWeeklyPlan({ ...weeklyPlan, [day]: (weeklyPlan[day] || []).filter(id => id !== exerciseId) });
  };

  const dayDuration = (day: string) => (weeklyPlan[day] || []).reduce((sum, id) => {
    const ex = exercises.find(e => e.id === id);
    return sum + (ex?.duration || 0);
  }, 0);

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold">My Weekly Plan</h1>
        <p className="text-muted-foreground">Your personalized training schedule</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Daily time commitment</span>
            <span className="text-sm font-display font-bold text-primary">{timeCommitment} min/day</span>
          </div>
          <Slider value={[timeCommitment]} onValueChange={v => setTimeCommitment(v[0])} min={15} max={60} step={5} />
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-7 gap-3">
        {days.map(day => {
          const dayExercises = (weeklyPlan[day] || []).map(id => exercises.find(e => e.id === id)).filter(Boolean);
          const duration = dayDuration(day);
          const overTime = duration > timeCommitment;

          return (
            <Card key={day} className={overTime ? 'border-destructive/50' : ''}>
              <CardHeader className="p-3 pb-1">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-medium">{day.slice(0, 3)}</CardTitle>
                  <div className={`flex items-center gap-0.5 text-xs ${overTime ? 'text-destructive' : 'text-muted-foreground'}`}>
                    <Clock className="h-3 w-3" /> {duration}m
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-1 space-y-1.5">
                {dayExercises.length === 0 && <p className="text-xs text-muted-foreground text-center py-3">Rest day</p>}
                {dayExercises.map(ex => ex && (
                  <div key={ex.id} className="flex items-center gap-1.5 bg-muted rounded-md p-1.5 text-xs">
                    <span>{ex.icon}</span>
                    <span className="truncate flex-1">{ex.name}</span>
                    <button onClick={() => removeFromDay(day, ex.id)} className="text-muted-foreground hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
