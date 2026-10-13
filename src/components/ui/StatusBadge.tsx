import React from 'react';
import { BatchStatus } from '../../types/batch';

interface StatusBadgeProps {
  status: BatchStatus | string;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = '',
  size = 'md',
}) => {
  const getStyles = (s: string) => {
    switch (s) {
      case 'RECEIVED':
        return {
          bg: 'bg-emerald-50 text-emerald-900 border-emerald-200/90',
          dot: 'bg-emerald-600',
          label: 'Received & Verified',
        };
      case 'REJECTED':
        return {
          bg: 'bg-rose-50 text-rose-900 border-rose-200/90',
          dot: 'bg-rose-600',
          label: 'Rejected',
        };
      case 'READY':
        return {
          bg: 'bg-teal-50 text-teal-900 border-teal-200/90',
          dot: 'bg-teal-600',
          label: 'Ready for Matching',
        };
      case 'OFFERED':
        return {
          bg: 'bg-sky-50 text-sky-900 border-sky-200/90',
          dot: 'bg-sky-600',
          label: 'Offered to Recipient',
        };
      case 'ACCEPTED':
        return {
          bg: 'bg-emerald-50 text-emerald-900 border-emerald-200/90',
          dot: 'bg-emerald-600',
          label: 'Offer Accepted',
        };
      case 'SCHEDULED':
        return {
          bg: 'bg-teal-50 text-teal-900 border-teal-200/90',
          dot: 'bg-teal-600',
          label: 'Pickup Scheduled',
        };
      case 'PICKED UP':
        return {
          bg: 'bg-indigo-50 text-indigo-900 border-indigo-200/90',
          dot: 'bg-indigo-600',
          label: 'In Transit',
        };
      case 'HANDED OVER':
        return {
          bg: 'bg-cyan-50 text-cyan-900 border-cyan-200/90',
          dot: 'bg-cyan-600',
          label: 'Delivered to Dock',
        };
      case 'PREPARATION':
        return {
          bg: 'bg-amber-50 text-amber-900 border-amber-200/90',
          dot: 'bg-amber-500',
          label: 'In Preparation',
        };
      case 'DRAFT':
        return {
          bg: 'bg-slate-100 text-slate-800 border-slate-200',
          dot: 'bg-slate-400',
          label: 'Draft',
        };
      case 'MATCHED':
        return {
          bg: 'bg-sky-50 text-sky-900 border-sky-200/90',
          dot: 'bg-sky-600',
          label: 'Matched',
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-800 border-slate-200',
          dot: 'bg-slate-400',
          label: s,
        };
    }
  };

  const style = getStyles(status);
  const sizeClass =
    size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border font-sans select-none tracking-normal ${sizeClass} ${style.bg} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot} shrink-0`} />
      <span className="whitespace-nowrap font-medium">{style.label}</span>
    </span>
  );
};
