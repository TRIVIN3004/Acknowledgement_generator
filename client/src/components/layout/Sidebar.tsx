import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Briefcase, 
  Users, 
  FileCheck, 
  BarChart3, 
  History, 
  FileText, 
  UserCheck,
  User as UserIcon,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const adminNav = [
    { label: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Project Management', path: '/admin/projects', icon: FolderKanban },
    { label: 'Role Catalog', path: '/admin/roles', icon: Briefcase },
    { label: 'Member Roster', path: '/admin/members', icon: Users },
    { label: 'Acknowledgements', path: '/admin/acknowledgements', icon: FileCheck },
    { label: 'Analytics & Reports', path: '/admin/analytics', icon: BarChart3 },
    { label: 'System Audit Logs', path: '/admin/logs', icon: History },
  ];

  const memberNav = [
    { label: 'Member Dashboard', path: '/member/dashboard', icon: LayoutDashboard },
    { label: 'Assigned Roles', path: '/member/roles', icon: UserCheck },
    { label: 'My Signed Letters', path: '/member/letters', icon: FileText },
    { label: 'My Profile & Signature', path: '/member/profile', icon: UserIcon },
  ];

  const navItems = isAdmin ? adminNav : memberNav;

  return (
    <aside className="w-64 flex-shrink-0 hidden md:block bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800/80 min-h-[calc(100vh-4rem)] p-4">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
            {isAdmin ? 'Administration Portal' : 'Member Workspace'}
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Quick Demo Switcher Info Box */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-brand-50 to-sky-50 dark:from-slate-800/80 dark:to-slate-800/40 border border-brand-100 dark:border-slate-700/50">
          <div className="flex items-center gap-2 text-brand-700 dark:text-brand-300 font-bold text-xs">
            <HelpCircle className="w-4 h-4" />
            Digital Consent Engine
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
            All role acceptances automatically record cryptographic verification hashes & IP timestamps.
          </p>
        </div>
      </div>
    </aside>
  );
};
