import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider, useApp } from "@/contexts/AppContext";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "@/pages/patient/Dashboard";
import Library from "@/pages/patient/Library";
import Plan from "@/pages/patient/Plan";
import Progress from "@/pages/patient/Progress";
import Profile from "@/pages/patient/Profile";
import Session from "@/pages/patient/Session";
import Onboarding from "@/pages/patient/Onboarding";
import Patients from "@/pages/clinician/Patients";
import PatientDetail from "@/pages/clinician/PatientDetail";
import EEGAnalysis from "@/pages/clinician/EEGAnalysis";
import ClinPlans from "@/pages/clinician/Plans";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { role } = useApp();
  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/session" element={<Session />} />
      <Route element={<AppLayout />}>
        {/* Patient routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/library" element={<Library />} />
        <Route path="/plan" element={<Plan />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/profile" element={<Profile />} />
        {/* Clinician routes */}
        <Route path="/patients" element={<Patients />} />
        <Route path="/patient/:id" element={<PatientDetail />} />
        <Route path="/eeg/:id" element={<EEGAnalysis />} />
        <Route path="/eeg" element={<EEGAnalysis />} />
        <Route path="/plans" element={<ClinPlans />} />
      </Route>
      <Route path="/" element={<Navigate to={role === 'patient' ? '/dashboard' : '/patients'} replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
