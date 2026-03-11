

# BrainHealthPro - Implementation Plan

## Overview
A brain-computer interface app with two interfaces: **Patient App** (cognitive training) and **Clinician App** (medical decision support). Frontend prototype with mock data, playable cognitive exercises, and realistic EEG visualizations.

---

## Phase 1: Foundation & Layout

### App Shell & Navigation
- Role switcher (Patient/Clinician toggle) in the header for demo purposes
- Patient sidebar: Dashboard, Library, My Plan, Progress, Profile
- Clinician sidebar: Patients, EEG Analysis, Plans
- Dark/light theme toggle
- Custom color scheme: Blue primary (#3B82F6), Green secondary (#10B981), Gold accent (#F59E0B)
- Mobile-responsive layout with collapsible sidebar

### Mock Data Layer
- Create mock data store with 20+ exercises, sample patients, EEG reports, and cognitive scores
- Simulated auth context (switch between patient/clinician roles)
- Exercise metadata: name, domain, difficulty, duration, target EEG band, description

---

## Phase 2: Patient App

### Onboarding Flow (3-step wizard)
- Step 1: Basic info questionnaire (age, goals, symptoms)
- Step 2: Simulated EEG analysis with loading animation → results
- Step 3: Baseline cognitive profile display (Memory, Attention, Executive Function radar chart)

### Home Dashboard
- Today's personalized plan (3-5 exercise cards)
- Progress streak counter and XP/level display
- Daily mood check-in (emoji selector)
- "Start Session" prominent call-to-action button
- Quick stats cards (exercises completed, total time, current streak)

### Exercise Library
- Grid of 20+ exercise cards with image, domain badge, difficulty stars, duration
- Filter by domain (Memory, Attention, Executive Function)
- Search by name
- Favorites toggle and "Add to Plan" functionality
- Exercise detail modal with preview and description

### 5 Fully Playable Exercises
1. **N-Back Memory** – Remember if current item matches N positions back; adjustable N level; scoring based on accuracy
2. **Stroop Test** – Color-word interference task; tap the color, not the word; timed rounds with scoring
3. **Simon Game** – Sequence memory game; colored buttons light up in patterns; increasing difficulty
4. **Trail Making** – Connect numbered/lettered circles in order; timed; measures cognitive flexibility
5. **Reaction Time** – Tap when stimulus appears; measures processing speed; multiple rounds with averages

Each exercise includes: instructions screen, countdown, live timer, score tracking, immediate feedback, and completion summary.

### Session Player (Fullscreen)
- Sequential exercise delivery from the plan
- Large timer display, live scoring, progress bar across exercises
- Skip/pause controls
- Post-session summary: scores per exercise, total XP earned, domain improvements
- Mock "EEG engagement" line chart showing simulated brain activity during session

### Plan Builder
- Auto-generated weekly calendar view based on cognitive profile
- Time commitment slider (15-60 min/day)
- Drag-and-drop exercises onto days
- Exercise count and total duration per day

### Progress & Insights
- Time-series line charts: performance trends per cognitive domain (using Recharts)
- Radial progress charts for domain mastery percentages
- AI-style insight cards: "Memory improving 12%", "Try 2x/week attention exercises"
- Weekly report view with exportable summary

---

## Phase 3: Clinician App

### Patient Management
- Searchable patient list with cards showing key metrics
- Filter by condition, adherence level, last EEG date
- Patient status badges (active, needs attention, new)

### Individual Patient Dashboard
- Cognitive scores overview with trend charts
- Exercise adherence and compliance metrics
- Recent session results
- EEG history timeline

### EEG Analysis Workspace
- Simulated EEG file upload with processing animation
- Realistic waveform viewer using Recharts (delta, theta, alpha, beta bands)
- Frequency band power bar chart
- Anomaly detection flags highlighted on waveforms
- Summary panel with key findings

### Diagnosis Support Panel
- AI-suggested diagnoses with confidence scores (e.g., "ADHD - 78% confidence")
- Clinician can accept/override with notes
- Pattern matching explanations shown as expandable cards

### Rehabilitation Planner
- Auto-populated exercise recommendations based on mock EEG results
- Custom plan builder with clinical goal setting
- Assign plans to patients with monitoring timeline

---

## Phase 4: Polish & UX

- Loading skeletons for all async-simulated operations
- Error boundary components with friendly messages
- WCAG 2.1 AA accessibility (proper ARIA labels, keyboard navigation, contrast ratios)
- Touch-friendly buttons (48px minimum touch targets)
- Smooth page transitions and micro-animations
- Mobile-optimized layouts for all pages

