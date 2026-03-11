import {
  LayoutDashboard, BookOpen, CalendarDays, TrendingUp, User,
  Users, BrainCircuit, ClipboardList, Activity
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { NavLink } from '@/components/NavLink';
import { useApp } from '@/contexts/AppContext';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel,
  SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar,
} from '@/components/ui/sidebar';

const patientNav = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Exercise Library', url: '/library', icon: BookOpen },
  { title: 'My Plan', url: '/plan', icon: CalendarDays },
  { title: 'Progress', url: '/progress', icon: TrendingUp },
  { title: 'Profile', url: '/profile', icon: User },
];

const clinicianNav = [
  { title: 'Patients', url: '/patients', icon: Users },
  { title: 'EEG Analysis', url: '/eeg', icon: Activity },
  { title: 'Plans', url: '/plans', icon: ClipboardList },
];

export function AppSidebar() {
  const { role } = useApp();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const items = role === 'patient' ? patientNav : clinicianNav;

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <BrainCircuit className="h-4 w-4 text-primary" />
            {!collapsed && <span className="font-display font-bold text-primary">BrainHealthPro</span>}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(item => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/dashboard'}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
