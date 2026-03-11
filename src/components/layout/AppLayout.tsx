import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { ThemeToggle } from './ThemeToggle';
import { useApp } from '@/contexts/AppContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BrainCircuit } from 'lucide-react';

export function AppLayout() {
  const { role, setRole, patient } = useApp();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b bg-card/80 backdrop-blur-sm px-4 sticky top-0 z-30">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <div className="hidden sm:flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-primary" />
                <span className="font-display font-bold text-sm">BrainHealthPro</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-muted rounded-lg p-0.5">
                <Button
                  variant={role === 'patient' ? 'default' : 'ghost'}
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => setRole('patient')}
                >
                  Patient
                </Button>
                <Button
                  variant={role === 'clinician' ? 'default' : 'ghost'}
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => setRole('clinician')}
                >
                  Clinician
                </Button>
              </div>
              <ThemeToggle />
              <div className="flex items-center gap-2 ml-2">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                  {role === 'patient' ? patient.avatar : 'DR'}
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
