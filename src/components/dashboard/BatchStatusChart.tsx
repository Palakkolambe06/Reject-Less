import React from 'react';
import { BatchStatus } from '../../types/batch';

interface BatchStatusChartProps {
  statusBreakdown: Record<BatchStatus, number>;
  totalBatches: number;
}

export const BatchStatusChart: React.FC<BatchStatusChartProps> = ({
  statusBreakdown,
  totalBatches,
}) => {
  const segments = [
    {
      label: 'Draft & Prep',
      count: (statusBreakdown.DRAFT || 0) + (statusBreakdown.PREPARATION || 0),
      color: 'bg-amber-400',
      dotColor: 'bg-amber-500',
    },
    {
      label: 'Certified Ready',
      count: statusBreakdown.READY || 0,
      color: 'bg-teal-500',
      dotColor: 'bg-teal-600',
    },
    {
      label: 'Offered / Accepted',
      count:
        (statusBreakdown.OFFERED || 0) +
        (statusBreakdown.ACCEPTED || 0) +
        (statusBreakdown.MATCHED || 0),
      color: 'bg-sky-500',
      dotColor: 'bg-sky-600',
    },
    {
      label: 'Scheduled & Transit',
      count:
        (statusBreakdown.SCHEDULED || 0) +
        (statusBreakdown['PICKED UP'] || 0) +
        (statusBreakdown['HANDED OVER'] || 0),
      color: 'bg-indigo-500',
      dotColor: 'bg-indigo-600',
    },
    {
      label: 'Received (Yield)',
      count: statusBreakdown.RECEIVED || 0,
      color: 'bg-emerald-600',
      dotColor: 'bg-emerald-700',
    },
    {
      label: 'Rejected',
      count: statusBreakdown.REJECTED || 0,
      color: 'bg-rose-500',
      dotColor: 'bg-rose-600',
    },
  ];

  return (
    <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/90 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Batch Lifecycle Distribution
          </h3>
          <p className="text-xs text-slate-500">
            Real-time stage distribution across circular recyclable waste streams
          </p>
        </div>
        <span className="text-xs font-mono text-slate-500 self-start sm:self-auto">
          Total: <strong className="text-slate-900 tabular-nums">{totalBatches}</strong> batches
        </span>
      </div>

      {/* Progress Track */}
      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex mb-4 border border-slate-200/60">
        {totalBatches === 0 ? (
          <div className="h-full w-full bg-slate-100" />
        ) : (
          segments.map((s, idx) => {
            if (s.count === 0) return null;
            const pct = (s.count / totalBatches) * 100;
            return (
              <div
                key={idx}
                style={{ width: `${pct}%` }}
                className={`h-full ${s.color} transition-all duration-300 first:rounded-l-full last:rounded-r-full`}
                title={`${s.label}: ${s.count} (${Math.round(pct)}%)`}
              />
            );
          })
        )}
      </div>

      {/* Legend & Tabular Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-slate-100 text-xs">
        {segments.map((s, idx) => {
          const pct = totalBatches > 0 ? Math.round((s.count / totalBatches) * 100) : 0;
          return (
            <div key={idx} className="flex flex-col">
              <div className="flex items-center gap-1.5 mb-1">
                <span className={`w-2 h-2 rounded-full ${s.dotColor} shrink-0`} />
                <span className="text-slate-600 text-[11px] font-medium truncate">
                  {s.label}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 pl-3.5">
                <span className="font-mono font-bold text-slate-900 tabular-nums text-xs">
                  {s.count}
                </span>
                <span className="text-[10px] text-slate-400 font-mono tabular-nums">
                  ({pct}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
