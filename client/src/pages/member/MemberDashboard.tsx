import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FolderKanban, 
  UserCheck, 
  FileText, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  PenTool, 
  Sparkles,
  AlertCircle,
  Building2
} from 'lucide-react';
import { api } from '../../services/api';
import { MemberDashboardStats } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';

export const MemberDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<MemberDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemberStats();
  }, []);

  const fetchMemberStats = async () => {
    try {
      const res = await api.getMemberStats();
      if (res.success) {
        setStats(res.stats);
      }
    } catch (e) {
      console.error('Failed to fetch member stats:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-xs font-semibold text-slate-400">Loading Member Workspace...</div>;

  return (
    <div className="space-y-6">
      {/* Member Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-brand-600 via-sky-600 to-indigo-700 text-white shadow-xl shadow-brand-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Team Member Workspace
          </span>
          <h1 className="text-2xl font-black tracking-tight">Welcome back, {user?.name}!</h1>
          <p className="text-xs text-brand-100 mt-1">Review assigned project roles, sign digital acknowledgements, and download verified letters.</p>
        </div>

        <Link
          to="/member/roles"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-brand-700 font-bold text-xs shadow-md hover:bg-brand-50 transition-all shrink-0"
        >
          <PenTool className="w-4 h-4 text-emerald-600" />
          Review Assigned Roles ({stats?.pendingAcceptanceCount || 0})
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">My Active Projects</span>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{stats?.myProjectsCount || 0}</p>
          <p className="text-[11px] text-slate-400">Assigned software initiatives</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Acceptance</span>
          <p className="text-3xl font-black text-amber-600 dark:text-amber-400">{stats?.pendingAcceptanceCount || 0}</p>
          <p className="text-[11px] text-amber-500 font-semibold">Requires digital signature</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Roles</span>
          <p className="text-3xl font-black text-brand-600 dark:text-brand-400">{stats?.assignedRolesCount || 0}</p>
          <p className="text-[11px] text-slate-400">Technical role allocations</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Downloaded Letters</span>
          <p className="text-3xl font-black text-emerald-500">{stats?.downloadedLettersCount || 0}</p>
          <p className="text-[11px] text-slate-400">Signed digital PDFs</p>
        </div>
      </div>

      {/* Pending Role Acceptance Urgent Action Box */}
      {(stats?.pendingAssignments || []).length > 0 && (
        <div className="p-6 rounded-3xl bg-amber-500/10 border-2 border-amber-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold text-sm">
              <AlertCircle className="w-5 h-5" />
              Role Assignment Awaiting Action ({stats?.pendingAssignments.length})
            </div>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">Action Required</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats?.pendingAssignments.map((asgn) => (
              <div key={asgn.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-500/20 shadow-sm space-y-3">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{asgn.project?.title}</h3>
                  <p className="text-xs font-semibold text-brand-600 dark:text-brand-400">Assigned Role: {asgn.role?.title}</p>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{asgn.project?.description}</p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400">Assigned: {new Date(asgn.assignedAt).toLocaleDateString()}</span>
                  <Link
                    to="/member/roles"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition-all"
                  >
                    Review & Sign <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Assigned Projects Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">My Active Projects Roster</h3>
        
        {(stats?.activeProjects || []).length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No active projects assigned yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats?.activeProjects.map((proj) => (
              <div key={proj.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between">
                  <StatusBadge status={proj.status} />
                  <span className="text-[10px] text-slate-400 font-semibold">Deadline: {proj.deadline}</span>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{proj.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{proj.description}</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {proj.technologyStack.map((tech, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-[10px] font-semibold border border-slate-200 dark:border-slate-800">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
