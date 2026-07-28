import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto py-6 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-brand-500" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            PRDAMS
          </span>
          <span>© 2026 Enterprise Digital Acknowledgement System. All Rights Reserved.</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#terms" className="hover:text-brand-500 transition-colors">Legal Terms</a>
          <a href="#security" className="hover:text-brand-500 transition-colors">Security Audit Logs</a>
          <a href="#compliance" className="hover:text-brand-500 transition-colors">Compliance Verification</a>
        </div>
      </div>
    </footer>
  );
};
