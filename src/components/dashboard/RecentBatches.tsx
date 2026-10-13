import React from 'react';
import { WasteBatch } from '../../types/batch';
import { formatDate } from '../../utils/dateFormat';
import { StatusBadge } from '../ui/StatusBadge';
import { EmptyState } from '../ui/EmptyState';
import { ChevronRight, PackageCheck, MapPin } from 'lucide-react';

interface RecentBatchesProps {
  batches: WasteBatch[];
  onSelectBatch: (id: string) => void;
  onCreateBatch: () => void;
  limit?: number;
}

export const RecentBatches: React.FC<RecentBatchesProps> = ({
  batches,
  onSelectBatch,
  onCreateBatch,
  limit = 5,
}) => {
  const displayBatches = batches.slice(0, limit);

  if (batches.length === 0) {
    return (
      <EmptyState
        icon={<PackageCheck className="w-6 h-6" />}
        title="No Waste Batches Logged"
        description="Register your first recyclable waste batch with photo capture and AI-assisted material identification."
        actionLabel="Register First Batch"
        onAction={onCreateBatch}
      />
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-2xs">
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Recent Waste Batches
          </h3>
          <p className="text-xs text-slate-500">
            Active and completed batches with readiness certification and chain-of-custody records
          </p>
        </div>
        <span className="text-xs font-mono text-slate-400 tabular-nums">
          Showing {displayBatches.length} of {batches.length}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Batch ID & Origin</th>
              <th className="py-3 px-4">Material</th>
              <th className="py-3 px-4 text-right">Quantity</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Created</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {displayBatches.map((b) => (
              <tr
                key={b.id}
                onClick={() => onSelectBatch(b.id)}
                className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
              >
                <td className="py-3.5 px-4">
                  <div className="font-mono font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                    {b.id}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate max-w-[220px]">
                      {b.generatorName} · {b.pickupLocation.city}
                    </span>
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <div className="font-semibold text-slate-800">
                    {b.materialCategory}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {b.packagingType} · {b.contaminationLevel.split(' ')[0]}
                  </div>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <span className="font-mono font-bold text-slate-900 tabular-nums">
                    {b.quantity}
                  </span>{' '}
                  <span className="text-[11px] text-slate-500 font-mono">
                    {b.unit}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <StatusBadge status={b.status} size="sm" />
                </td>
                <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 tabular-nums">
                  {formatDate(b.createdAt)}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 rounded-md group-hover:bg-emerald-50 group-hover:text-emerald-900 group-hover:border-emerald-300 transition-colors shadow-2xs">
                    <span>Inspect</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
