import { Exercise, Patient, SessionResult, EEGReport, WeeklyPlan, ProgressDataPoint } from '@/types';

export const exercises: Exercise[] = [
  { id: 'nback', name: 'N-Back Memory', domain: 'memory', difficulty: 'medium', duration: 5, description: 'Remember if the current item matches N positions back. Trains working memory capacity and fluid intelligence.', targetBand: 'Theta (4-8 Hz)', playable: true, icon: '🧠' },
  { id: 'stroop', name: 'Stroop Test', domain: 'attention', difficulty: 'easy', duration: 3, description: 'Identify the ink color of color words. Measures selective attention and cognitive inhibition.', targetBand: 'Beta (13-30 Hz)', playable: true, icon: '🎨' },
  { id: 'simon', name: 'Simon Game', domain: 'memory', difficulty: 'easy', duration: 4, description: 'Repeat increasingly complex color sequences from memory. Trains visual-spatial working memory.', targetBand: 'Alpha (8-13 Hz)', playable: true, icon: '🔴' },
  { id: 'trail', name: 'Trail Making', domain: 'executive', difficulty: 'hard', duration: 7, description: 'Connect numbered circles in ascending order as quickly as possible. Measures cognitive flexibility.', targetBand: 'Beta (13-30 Hz)', playable: true, icon: '🔗' },
  { id: 'reaction', name: 'Reaction Time', domain: 'attention', difficulty: 'easy', duration: 2, description: 'Tap as quickly as possible when the stimulus appears. Measures processing speed.', targetBand: 'Beta (13-30 Hz)', playable: true, icon: '⚡' },
  { id: 'pattern', name: 'Pattern Recall', domain: 'memory', difficulty: 'medium', duration: 5, description: 'Memorize and reproduce visual patterns of increasing complexity.', targetBand: 'Theta (4-8 Hz)', playable: false, icon: '🔲' },
  { id: 'wordlist', name: 'Word List Memory', domain: 'memory', difficulty: 'medium', duration: 6, description: 'Memorize and recall lists of words. Tests verbal episodic memory.', targetBand: 'Theta (4-8 Hz)', playable: false, icon: '📝' },
  { id: 'spatial', name: 'Spatial Memory', domain: 'memory', difficulty: 'hard', duration: 5, description: 'Remember locations of objects in a grid. Trains visuospatial working memory.', targetBand: 'Alpha (8-13 Hz)', playable: false, icon: '📍' },
  { id: 'digitspan', name: 'Digit Span', domain: 'memory', difficulty: 'easy', duration: 4, description: 'Repeat sequences of digits forward and backward.', targetBand: 'Theta (4-8 Hz)', playable: false, icon: '🔢' },
  { id: 'facename', name: 'Face-Name Pairs', domain: 'memory', difficulty: 'hard', duration: 8, description: 'Associate faces with names and recall them. Tests associative memory.', targetBand: 'Theta (4-8 Hz)', playable: false, icon: '👤' },
  { id: 'storyrecall', name: 'Story Recall', domain: 'memory', difficulty: 'hard', duration: 10, description: 'Listen to short stories and answer comprehension questions from memory.', targetBand: 'Alpha (8-13 Hz)', playable: false, icon: '📖' },
  { id: 'visualsearch', name: 'Visual Search', domain: 'attention', difficulty: 'medium', duration: 4, description: 'Find target items among distractors. Tests visual attention and scanning.', targetBand: 'Beta (13-30 Hz)', playable: false, icon: '🔍' },
  { id: 'sustained', name: 'Sustained Attention', domain: 'attention', difficulty: 'medium', duration: 8, description: 'Monitor a stream of stimuli and respond to rare targets. Tests vigilance.', targetBand: 'Beta (13-30 Hz)', playable: false, icon: '👁️' },
  { id: 'divided', name: 'Divided Attention', domain: 'attention', difficulty: 'hard', duration: 6, description: 'Track multiple objects simultaneously. Tests attention splitting ability.', targetBand: 'Beta (13-30 Hz)', playable: false, icon: '🎯' },
  { id: 'flanker', name: 'Flanker Task', domain: 'attention', difficulty: 'medium', duration: 4, description: 'Identify center arrow direction while ignoring flanking distractors.', targetBand: 'Beta (13-30 Hz)', playable: false, icon: '➡️' },
  { id: 'tower', name: 'Tower of Hanoi', domain: 'executive', difficulty: 'hard', duration: 10, description: 'Move disks between pegs following rules. Tests planning and problem solving.', targetBand: 'Beta (13-30 Hz)', playable: false, icon: '🗼' },
  { id: 'cardsorting', name: 'Card Sorting', domain: 'executive', difficulty: 'medium', duration: 6, description: 'Sort cards by changing rules. Tests cognitive flexibility and set-shifting.', targetBand: 'Beta (13-30 Hz)', playable: false, icon: '🃏' },
  { id: 'gonogo', name: 'Go/No-Go', domain: 'executive', difficulty: 'easy', duration: 3, description: 'Respond to go stimuli, inhibit response to no-go stimuli. Tests impulse control.', targetBand: 'Beta (13-30 Hz)', playable: false, icon: '🚦' },
  { id: 'taskswitching', name: 'Task Switching', domain: 'executive', difficulty: 'hard', duration: 7, description: 'Alternate between two classification tasks. Measures mental flexibility.', targetBand: 'Beta (13-30 Hz)', playable: false, icon: '🔄' },
  { id: 'planning', name: 'Planning Puzzle', domain: 'executive', difficulty: 'medium', duration: 8, description: 'Plan optimal routes or sequences to solve spatial puzzles.', targetBand: 'Alpha (8-13 Hz)', playable: false, icon: '🧩' },
  { id: 'inhibition', name: 'Inhibition Control', domain: 'executive', difficulty: 'medium', duration: 5, description: 'Suppress automatic responses in favor of goal-directed actions.', targetBand: 'Beta (13-30 Hz)', playable: false, icon: '🛑' },
  { id: 'mindfulness', name: 'Mindful Focus', domain: 'attention', difficulty: 'easy', duration: 5, description: 'Guided breathing exercise with attention monitoring.', targetBand: 'Alpha (8-13 Hz)', playable: false, icon: '🧘' },
];

export const patients: Patient[] = [
  { id: 'p1', name: 'Sarah Chen', email: 'sarah@example.com', age: 34, condition: 'Mild Cognitive Impairment', cognitiveScores: { memory: 62, attention: 78, executive: 71 }, adherence: 87, lastSession: '2026-03-10', lastEEG: '2026-03-05', status: 'active', avatar: 'SC', streak: 12, xp: 2450, level: 8 },
  { id: 'p2', name: 'James Okonkwo', email: 'james@example.com', age: 45, condition: 'ADHD', cognitiveScores: { memory: 74, attention: 52, executive: 60 }, adherence: 63, lastSession: '2026-03-08', lastEEG: '2026-02-28', status: 'needs-attention', avatar: 'JO', streak: 3, xp: 1200, level: 5 },
  { id: 'p3', name: 'Maria Santos', email: 'maria@example.com', age: 28, condition: 'Post-concussion', cognitiveScores: { memory: 55, attention: 65, executive: 58 }, adherence: 92, lastSession: '2026-03-11', lastEEG: '2026-03-09', status: 'active', avatar: 'MS', streak: 21, xp: 3800, level: 12 },
  { id: 'p4', name: 'Robert Kim', email: 'robert@example.com', age: 61, condition: 'Early Alzheimer\'s', cognitiveScores: { memory: 38, attention: 55, executive: 45 }, adherence: 78, lastSession: '2026-03-09', lastEEG: '2026-03-01', status: 'needs-attention', avatar: 'RK', streak: 7, xp: 900, level: 3 },
  { id: 'p5', name: 'Emily Torres', email: 'emily@example.com', age: 22, condition: 'Anxiety-related', cognitiveScores: { memory: 80, attention: 70, executive: 75 }, adherence: 45, lastSession: '2026-03-01', lastEEG: '2026-02-15', status: 'new', avatar: 'ET', streak: 0, xp: 150, level: 1 },
];

export const currentPatient = patients[0];

export const sessionHistory: SessionResult[] = [
  { id: 's1', date: '2026-03-10', exerciseResults: [{ exerciseId: 'nback', exerciseName: 'N-Back Memory', score: 78, duration: 300 }, { exerciseId: 'stroop', exerciseName: 'Stroop Test', score: 85, duration: 180 }, { exerciseId: 'reaction', exerciseName: 'Reaction Time', score: 72, duration: 120 }], totalXP: 180, mood: 'good' },
  { id: 's2', date: '2026-03-09', exerciseResults: [{ exerciseId: 'simon', exerciseName: 'Simon Game', score: 65, duration: 240 }, { exerciseId: 'trail', exerciseName: 'Trail Making', score: 58, duration: 420 }], totalXP: 120, mood: 'okay' },
  { id: 's3', date: '2026-03-08', exerciseResults: [{ exerciseId: 'nback', exerciseName: 'N-Back Memory', score: 72, duration: 300 }, { exerciseId: 'stroop', exerciseName: 'Stroop Test', score: 80, duration: 180 }, { exerciseId: 'simon', exerciseName: 'Simon Game', score: 70, duration: 240 }], totalXP: 200, mood: 'great' },
  { id: 's4', date: '2026-03-07', exerciseResults: [{ exerciseId: 'reaction', exerciseName: 'Reaction Time', score: 68, duration: 120 }, { exerciseId: 'trail', exerciseName: 'Trail Making', score: 55, duration: 420 }], totalXP: 100, mood: 'low' },
  { id: 's5', date: '2026-03-06', exerciseResults: [{ exerciseId: 'nback', exerciseName: 'N-Back Memory', score: 70, duration: 300 }, { exerciseId: 'stroop', exerciseName: 'Stroop Test', score: 76, duration: 180 }], totalXP: 140, mood: 'good' },
];

export const defaultWeeklyPlan: WeeklyPlan = {
  Monday: ['nback', 'stroop', 'reaction'],
  Tuesday: ['simon', 'trail'],
  Wednesday: ['nback', 'visualsearch', 'flanker'],
  Thursday: ['stroop', 'simon', 'reaction'],
  Friday: ['trail', 'nback'],
  Saturday: [],
  Sunday: ['mindfulness'],
};

export const progressData: ProgressDataPoint[] = [
  { date: '2026-02-10', memory: 50, attention: 55, executive: 48 },
  { date: '2026-02-17', memory: 52, attention: 58, executive: 50 },
  { date: '2026-02-24', memory: 55, attention: 62, executive: 53 },
  { date: '2026-03-03', memory: 58, attention: 68, executive: 60 },
  { date: '2026-03-10', memory: 62, attention: 78, executive: 71 },
];

export const eegReports: EEGReport[] = [
  {
    id: 'eeg1', patientId: 'p1', date: '2026-03-05',
    bands: { delta: 22, theta: 28, alpha: 30, beta: 15, gamma: 5 },
    anomalies: ['Elevated theta in frontal region', 'Mild alpha asymmetry'],
    findings: 'EEG shows elevated frontal theta activity consistent with mild cognitive impairment. Alpha rhythm is mildly asymmetric with right-hemisphere dominance. Beta activity within normal range. No epileptiform discharges observed.',
    confidence: 0.85,
    suggestedDiagnoses: [{ name: 'Mild Cognitive Impairment', confidence: 78 }, { name: 'Normal Aging', confidence: 15 }, { name: 'Early Dementia', confidence: 7 }],
  },
  {
    id: 'eeg2', patientId: 'p2', date: '2026-02-28',
    bands: { delta: 18, theta: 35, alpha: 20, beta: 22, gamma: 5 },
    anomalies: ['Excess theta globally', 'Reduced alpha peak frequency', 'Elevated beta in frontal areas'],
    findings: 'EEG pattern consistent with ADHD profile. Elevated theta-to-beta ratio (TBR) across frontal channels. Reduced alpha peak frequency suggests attentional processing difficulties.',
    confidence: 0.82,
    suggestedDiagnoses: [{ name: 'ADHD - Inattentive Type', confidence: 72 }, { name: 'ADHD - Combined Type', confidence: 18 }, { name: 'Anxiety Disorder', confidence: 10 }],
  },
  {
    id: 'eeg3', patientId: 'p3', date: '2026-03-09',
    bands: { delta: 30, theta: 25, alpha: 25, beta: 15, gamma: 5 },
    anomalies: ['Elevated delta in temporal regions', 'Slowed background activity'],
    findings: 'Post-concussive EEG pattern with elevated delta waves in temporal regions, suggesting ongoing recovery. Overall background slowing noted. Pattern improving compared to baseline.',
    confidence: 0.79,
    suggestedDiagnoses: [{ name: 'Post-Concussion Syndrome', confidence: 82 }, { name: 'Mild TBI Recovery', confidence: 12 }, { name: 'Normal Variant', confidence: 6 }],
  },
];

export function generateEEGWaveform(band: 'delta' | 'theta' | 'alpha' | 'beta', points = 200): { time: number; value: number }[] {
  const freqMap = { delta: 2, theta: 6, alpha: 10, beta: 20 };
  const ampMap = { delta: 80, theta: 50, alpha: 40, beta: 20 };
  const freq = freqMap[band];
  const amp = ampMap[band];
  return Array.from({ length: points }, (_, i) => ({
    time: i,
    value: amp * Math.sin((2 * Math.PI * freq * i) / 100) + (Math.random() - 0.5) * amp * 0.5,
  }));
}

export const insights = [
  { text: 'Memory scores improved 12% this month', type: 'positive' as const, suggestion: 'Keep up your N-Back training 3x/week' },
  { text: 'Attention scores plateauing', type: 'neutral' as const, suggestion: 'Try adding 2 more Stroop sessions per week' },
  { text: 'Executive function up 15%', type: 'positive' as const, suggestion: 'Great progress on Trail Making! Try harder difficulty' },
  { text: 'Streak at 12 days — personal best!', type: 'achievement' as const, suggestion: 'You\'re building a strong habit' },
];
