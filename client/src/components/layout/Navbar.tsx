import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Bell, 
  Sun, 
  Moon, 
  Search, 
  User as UserIcon, 
  LogOut, 
  Sparkles,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { SystemNotification } from '../../types';

export const Navbar: React.FC = () => {
  const { user, logout, darkMode, toggleDarkMode } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [globalQuery, setGlobalQuery] = useState('');

  useEffect(() => {
    if (user) {
      api.getNotifications()
        .then(res => {
          if (res.success) setNotifications(res.notifications);
        })
        .catch(() => {});
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotifClick = async (notif: SystemNotification) => {
    try {
      await api.markNotificationRead(notif.id);
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
      if (notif.link) {
        navigate(notif.link);
        setShowNotifDropdown(false);
      }
    } catch (e) {}
  };

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalQuery.trim()) return;
    if (user?.role === 'admin') {
      navigate(`/admin/acknowledgements?search=${encodeURIComponent(globalQuery)}`);
    } else {
      navigate(`/member/projects?search=${encodeURIComponent(globalQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand Logo */}
          <div className="flex items-center gap-3">
            <Link to={user?.role === 'admin' ? '/admin/dashboard' : '/member/dashboard'} className="flex items-center gap-3 group">
              <div className="h-10 px-2 py-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <img src="/logo.png" alt="Nexora Technologies Logo" className="h-8 object-contain" />
              </div>
              <div>
                <span className="text-base font-black tracking-tight bg-gradient-to-r from-brand-600 via-sky-500 to-indigo-600 bg-clip-text text-transparent dark:from-brand-400 dark:to-sky-300">
                  NEXORA TECHNOLOGIES
                </span>
                <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Building Tomorrow, Today
                </span>
              </div>
            </Link>

            <span className="hidden md:inline-flex items-center gap-1.5 ml-4 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-300 border border-brand-200 dark:border-brand-800/50">
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
              Enterprise v2.4
            </span>
          </div>

          {/* Center: Global Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleGlobalSearch} className="w-full relative">
              <input
                type="text"
                placeholder="Search projects, roles, members, or hashes..."
                value={globalQuery}
                onChange={e => setGlobalQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-1.5 rounded-xl text-sm bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            </form>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Verification Link */}
            <Link
              to="/verify/demo"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Verify QR
            </Link>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle Dark/Light Mode"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>

            {/* Notifications Dropdown */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                  className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifDropdown && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Notifications</span>
                      <span className="text-[11px] font-semibold text-brand-600 dark:text-brand-400">{unreadCount} Unread</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                      {notifications.length === 0 ? (
                        <p className="p-4 text-xs text-center text-slate-400">No new notifications</p>
                      ) : (
                        notifications.map(notif => (
                          <div
                            key={notif.id}
                            onClick={() => handleNotifClick(notif)}
                            className={`p-3 text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                              !notif.read ? 'bg-brand-50/40 dark:bg-brand-950/20' : ''
                            }`}
                          >
                            <p className="font-semibold text-slate-900 dark:text-white">{notif.title}</p>
                            <p className="text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{notif.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <img
                    src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                    alt={user.name}
                    className="w-8 h-8 rounded-lg object-cover ring-2 ring-brand-500/20"
                  />
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{user.name}</p>
                    <p className="text-[10px] font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                      {user.role}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in duration-150">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{user.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>
                    <Link
                      to={user.role === 'admin' ? '/admin/dashboard' : '/member/profile'}
                      onClick={() => setShowProfileDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <UserIcon className="w-4 h-4" />
                      My Profile & Settings
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setShowProfileDropdown(false);
                        navigate('/auth');
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/auth"
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
