import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FolderKanban, 
  Users, 
  Briefcase, 
  Clock, 
  FileCheck2, 
  TrendingUp, 
  Plus, 
  Download, 
  Activity,
  ArrowRight,
  ShieldCheck,
  Database,
  Upload,
  FileSpreadsheet
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { api, apiRequest } from '../../services/api';
import { AdminDashboardStats } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';

const CHART_COLORS = ['#0c92e7', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#3b82f6'];

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // CSV Import State
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);
  const [csvContent, setCSVContent] = useState('');
  const [targetCSVType, setTargetCSVType] = useState('auto');
  const [importingCSV, setImportingCSV] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCSVContent(event.target?.result as string || '');
      };
      reader.readAsText(file);
    }
  };

  const handleCSVImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvContent.trim()) {
      alert('Please paste or upload valid CSV text first.');
      return;
    }
    setImportingCSV(true);
    try {
      const res = await apiRequest('/csv/import', {
        method: 'POST',
        body: JSON.stringify({ csvText: csvContent, targetType: targetCSVType })
      });
      alert(`🎉 ${res.message}`);
      setIsCSVModalOpen(false);
      setCSVContent('');
      fetchStats();
    } catch (err: any) {
      alert(err.message || 'CSV Import failed');
    } finally {
      setImportingCSV(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.getAdminStats();
      if (res.success) {
        setStats(res.stats);
      }
    } catch (e) {
      console.error('Failed to fetch admin stats:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs font-semibold text-slate-400">
        Loading Admin Analytics Engine...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-brand-600 via-sky-600 to-indigo-700 text-white shadow-xl shadow-brand-500/20">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white mb-2">
            <ShieldCheck className="w-4 h-4" /> Admin Command Center
          </span>
          <h1 className="text-2xl font-black tracking-tight">System Overview & Role Analytics</h1>
          <p className="text-xs text-brand-100 mt-1">Manage project allocations, review digital signatures, and audit member acceptances.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsCSVModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" /> Import CSV File
          </button>
          <Link
            to="/admin/projects"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-brand-700 text-xs font-bold shadow-md hover:bg-brand-50 transition-all"
          >
            <Plus className="w-4 h-4" /> New Project
          </Link>
          <Link
            to="/admin/roles"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-800/60 hover:bg-brand-800 text-white text-xs font-bold backdrop-blur-md transition-all"
          >
            <Briefcase className="w-4 h-4" /> New Role
          </Link>
          <Link
            to="/admin/acknowledgements"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-800/60 hover:bg-brand-800 text-white text-xs font-bold backdrop-blur-md transition-all"
          >
            <Download className="w-4 h-4" /> Export CSV/ZIP
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Projects */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Projects</span>
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
              <FolderKanban className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{stats?.totalProjects || 0}</span>
            <span className="text-[11px] font-semibold text-emerald-500 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> Active
            </span>
          </div>
        </div>

        {/* Total Members */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Team Members</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{stats?.totalMembers || 0}</span>
            <span className="text-[11px] font-semibold text-slate-400">Allocated Roster</span>
          </div>
        </div>

        {/* Total Roles */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Role Catalog</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{stats?.totalRoles || 0}</span>
            <span className="text-[11px] font-semibold text-purple-500">Definitions</span>
          </div>
        </div>

        {/* Pending Acknowledgements */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Acceptance</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{stats?.pendingAcknowledgements || 0}</span>
            <span className="text-[11px] font-semibold text-amber-500">Awaiting Sign</span>
          </div>
        </div>

        {/* Completed Digital Acknowledgements */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Signed Letters</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{stats?.completedAcknowledgements || 0}</span>
            <span className="text-[11px] font-semibold text-emerald-500 font-bold">{stats?.acceptanceRate}% Rate</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Members Per Project Bar Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Members Allocated Per Project</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Team distribution across active project initiatives</p>
            </div>
            <Activity className="w-5 h-5 text-brand-500" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.membersPerProject || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="value" fill="#0c92e7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Role Distribution Pie Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Role Distribution Share</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Popularity breakdown of technical roles assigned</p>
            </div>
            <Briefcase className="w-5 h-5 text-emerald-500" />
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.roleDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(stats?.roleDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Audit Trail Feed */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">System Activity & Security Audit Logs</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Real-time log of assignments, digital signatures, & status updates</p>
          </div>
          <Link to="/admin/logs" className="text-xs font-bold text-brand-600 dark:text-brand-400 flex items-center gap-1 hover:underline">
            View All Logs <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {(stats?.recentActivities || []).map((log) => (
            <div key={log.id} className="py-3 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
                  {log.performedByRole === 'admin' ? 'A' : 'M'}
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{log.details}</p>
                  <p className="text-slate-400 text-[11px]">Performed by: {log.performedByName} • Action: {log.action}</p>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 whitespace-nowrap">
                {new Date(log.timestamp).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CSV File Import Modal */}
      <Modal
        isOpen={isCSVModalOpen}
        onClose={() => setIsCSVModalOpen(false)}
        title="Import Supabase CSV Data File"
        subtitle="Upload or paste your CSV file containing exported projects, users, or roles."
      >
        <form onSubmit={handleCSVImportSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Select CSV File from Disk:
            </label>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="w-full text-xs text-slate-600 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-500/10 file:text-emerald-600 dark:file:text-emerald-400 hover:file:bg-emerald-500/20 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Or Paste CSV Raw Text Content Below:
            </label>
            <textarea
              rows={6}
              value={csvContent}
              onChange={(e) => setCSVContent(e.target.value)}
              placeholder="title,description,category,deadline,technology_stack&#10;Nexora AI Platform,Enterprise AI assistant,Artificial Intelligence,2026-10-31,React;Python"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold">Target Entity Mapping:</span>
            <select
              value={targetCSVType}
              onChange={(e) => setTargetCSVType(e.target.value)}
              className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold"
            >
              <option value="auto">Auto Detect Columns</option>
              <option value="projects">Projects Only</option>
              <option value="users">Users / Roster Only</option>
              <option value="roles">Role Catalog Only</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsCSVModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={importingCSV}
              className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              {importingCSV ? 'Processing CSV...' : 'Process & Import CSV'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
