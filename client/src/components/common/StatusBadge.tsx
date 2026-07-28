import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getStyles = (st: string) => {
    switch (st.toLowerCase()) {
      case 'accepted':
      case 'completed':
      case 'active':
      case 'approved':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';

      case 'pending':
      case 'planning':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';

      case 'in_progress':
      case 'in progress':
      case 'started':
        return 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/20';

      case 'rejected':
      case 'archived':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';

      case 'change_requested':
      case 'change requested':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';

      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
    }
  };

  const formatText = (st: string) => {
    return st.replace(/_/g, ' ').toUpperCase();
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStyles(
        status
      )} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
      {formatText(status)}
    </span>
  );
};
