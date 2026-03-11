import React, { createContext, useContext, useState, useCallback } from 'react';
import { UserRole, Mood, WeeklyPlan } from '@/types';
import { currentPatient, defaultWeeklyPlan } from '@/data/mockData';

interface AppState {
  role: UserRole;
  setRole: (role: UserRole) => void;
  isDark: boolean;
  toggleTheme: () => void;
  hasOnboarded: boolean;
  setHasOnboarded: (v: boolean) => void;
  todayMood: Mood | null;
  setTodayMood: (m: Mood) => void;
  favorites: Set<string>;
  toggleFavorite: (id: string) => void;
  weeklyPlan: WeeklyPlan;
  setWeeklyPlan: (p: WeeklyPlan) => void;
  timeCommitment: number;
  setTimeCommitment: (m: number) => void;
  patient: typeof currentPatient;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>('patient');
  const [isDark, setIsDark] = useState(false);
  const [hasOnboarded, setHasOnboarded] = useState(true);
  const [todayMood, setTodayMood] = useState<Mood | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['nback', 'stroop']));
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan>(defaultWeeklyPlan);
  const [timeCommitment, setTimeCommitment] = useState(30);

  const toggleTheme = useCallback(() => {
    setIsDark(prev => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      return next;
    });
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  return (
    <AppContext.Provider value={{
      role, setRole, isDark, toggleTheme, hasOnboarded, setHasOnboarded,
      todayMood, setTodayMood, favorites, toggleFavorite,
      weeklyPlan, setWeeklyPlan, timeCommitment, setTimeCommitment,
      patient: currentPatient,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
