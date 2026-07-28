import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Download, PieChart, Users, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';

export const AnalyticsPage: React.FC = () => {
  const [reports, setReports] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getReports().then(res => {
      if (res.success) setReports(res.reports);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-xs text-slate-400">Loading system analytics...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-brand-600" />
          Analytics & System Compliance Reports
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          In-depth reports on team allocations, role acceptance velocity, & digital letter downloads
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 font-bold uppercase">Acceptance Rate</span>
          <p className="text-3xl font-black text-emerald-500 mt-2">{reports?.acceptanceRate || 100}%</p>
          <p className="text-[11px] text-slate-400 mt-1">High role alignment score</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 font-bold uppercase">Total Allocations</span>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">{reports?.totalAssignments || 0}</p>
          <p className="text-[11px] text-slate-400 mt-1">Across all project teams</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 font-bold uppercase">Downloaded PDF Letters</span>
          <p className="text-3xl font-black text-brand-600 dark:text-brand-400 mt-2">{reports?.totalDownloads || 0}</p>
          <p className="text-[11px] text-slate-400 mt-1">Verified PDF documents</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 font-bold uppercase">Active Team Members</span>
          <p className="text-3xl font-black text-purple-600 dark:text-purple-400 mt-2">{reports?.totalMembers || 0}</p>
          <p className="text-[11px] text-slate-400 mt-1">Software engineering roster</p>
        </div>
      </div>
    </div>
  );
};
