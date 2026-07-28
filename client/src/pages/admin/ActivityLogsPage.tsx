import React, { useState, useEffect } from 'react';
import { History, Shield, Lock, Activity } from 'lucide-react';
import { api } from '../../services/api';
import { AuditLog } from '../../types';

export const ActivityLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAuditLogs().then(res => {
      if (res.success) setLogs(res.logs);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <History className="w-6 h-6 text-brand-600" />
          System Security & Audit Trail Logs
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Immutable history of all role assignments, status modifications, & digital signature transactions
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span className="font-bold uppercase tracking-wider">Cryptographic Log Stream</span>
          <span className="flex items-center gap-1 text-emerald-500 font-bold">
            <Lock className="w-3.5 h-3.5" /> SECURE AUDIT TRAIL
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading audit log timeline...</div>
          ) : logs.map((log) => (
            <div key={log.id} className="p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{log.details}</p>
                  <p className="text-slate-400 text-[11px]">
                    User: <strong className="text-slate-700 dark:text-slate-300">{log.performedByName}</strong> ({log.performedByRole}) • Target: {log.targetType}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {log.action}
                </span>
                <p className="text-[10px] text-slate-400 mt-1">{new Date(log.timestamp).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
