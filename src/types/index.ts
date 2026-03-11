export type CognitiveDomain = 'memory' | 'attention' | 'executive';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type UserRole = 'patient' | 'clinician';
export type Mood = 'great' | 'good' | 'okay' | 'low' | 'bad';

export interface Exercise {
  id: string;
  name: string;
  domain: CognitiveDomain;
  difficulty: Difficulty;
  duration: number;
  description: string;
  targetBand: string;
  playable: boolean;
  icon: string;
}

export interface CognitiveScores {
  memory: number;
  attention: number;
  executive: number;
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  age: number;
  condition: string;
  cognitiveScores: CognitiveScores;
  adherence: number;
  lastSession: string;
  lastEEG: string;
  status: 'active' | 'needs-attention' | 'new';
  avatar: string;
  streak: number;
  xp: number;
  level: number;
}

export interface SessionResult {
  id: string;
  date: string;
  exerciseResults: { exerciseId: string; exerciseName: string; score: number; duration: number }[];
  totalXP: number;
  mood?: Mood;
}

export interface EEGReport {
  id: string;
  patientId: string;
  date: string;
  bands: { delta: number; theta: number; alpha: number; beta: number; gamma: number };
  anomalies: string[];
  findings: string;
  confidence: number;
  suggestedDiagnoses: { name: string; confidence: number }[];
}

export interface WeeklyPlan {
  [day: string]: string[]; // day -> exercise IDs
}

export interface ProgressDataPoint {
  date: string;
  memory: number;
  attention: number;
  executive: number;
}

export interface ExerciseResult {
  score: number;
  accuracy: number;
  timeSpent: number;
  details: Record<string, unknown>;
}
