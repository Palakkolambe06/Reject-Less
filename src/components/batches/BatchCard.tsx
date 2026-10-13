import React from 'react';
import { WasteBatch } from '../../types/batch';
import { StatusBadge } from '../ui/StatusBadge';
import { formatDate } from '../../utils/dateFormat';
import {
  MapPin,
  CheckCircle2,
  Clock,
  ChevronRight,
  Package,
  Layers,
  Sparkles,
  Building2,
  Truck,
} from 'lucide-react';

interface BatchCardProps {
  batch: WasteBatch;
  onSelect: (id: string) => void;
  onQuickAction?: (action: 'readiness' | 'matching' | 'handover', id: string) => void;
}

export const BatchCard: React.FC<BatchCardProps> = ({
  batch,
  onSelect,
  onQuickAction,
}) => {
  return (
    <div
      onClick={() => onSelect(batch.id)}
      className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
    >
      <div>
        {/* Thumbnail & Header Banner */}
        <div className="relative aspect-16/9 bg-slate-100 border-b border-slate-100 flex items-center justify-center overflow-hidden">
          {batch.photoUrl ? (
            <img
              src={batch.photoUrl}
              alt={batch.materialCategory}
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 p-4 text-center">
              <Package className="w-8 h-8 mb-1 text-slate-300" />
              <span className="text-[11px] font-medium font-mono">{batch.materialCategory} Bay</span>
            </div>
          )}

          {/* Top badges floating over image */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-900/80 text-white backdrop-blur-xs">
              {batch.id}
            </span>
          </div>

          <div className="absolute top-2.5 right-2.5">
            <StatusBadge status={batch.status} size="sm" />
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-3">
          {/* Title & Quantity */}
          <div>
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-base font-bold text-slate-900 group-hover:text-emerald-800 transition-colors tracking-tight">
                {batch.materialCategory}
              </h4>
              <span className="font-mono font-bold text-sm text-slate-900 tabular-nums">
                {batch.quantity} {batch.unit}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{batch.generatorName} · {batch.pickupLocation.city}</span>
            </div>
          </div>

          {/* Packaging & Cleanliness */}
          <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
            <div>
              <span className="text-[10px] text-slate-400 block font-mono">Format</span>
              <span className="font-medium text-slate-800 text-[11px] truncate block">{batch.packagingType}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-mono">Cleanliness</span>
              <span className="font-medium text-slate-800 text-[11px] truncate block">{batch.contaminationLevel.split(' ')[0]}</span>
            </div>
          </div>

          {/* Verification & AI Tagging */}
          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Readiness Gate:</span>
              {batch.isReadyForMatching ? (
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  100% Certified
                </span>
              ) : (
                <span className="text-amber-700 font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Incomplete
                </span>
              )}
            </div>

            {batch.aiPrediction && (
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">AI Triage:</span>
                <span className="text-teal-700 font-mono text-[10px] flex items-center gap-1 font-semibold">
                  <Sparkles className="w-3 h-3" />
                  {batch.aiPrediction.predictedCategory} ({Math.round(batch.aiPrediction.confidence * 100)}%)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 pt-2 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between gap-2 text-xs">
        <span className="text-[11px] text-slate-400 font-mono tabular-nums">
          {formatDate(batch.updatedAt || batch.createdAt)}
        </span>

        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {!batch.isReadyForMatching && onQuickAction && (
            <button
              onClick={() => onQuickAction('readiness', batch.id)}
              className="px-2.5 py-1 text-[11px] font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors"
            >
              Verify Prep
            </button>
          )}

          {batch.isReadyForMatching && batch.status === 'READY' && onQuickAction && (
            <button
              onClick={() => onQuickAction('matching', batch.id)}
              className="px-2.5 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors flex items-center gap-1"
            >
              <Building2 className="w-3 h-3" />
              <span>Match</span>
            </button>
          )}

          {(batch.status === 'SCHEDULED' || batch.status === 'ACCEPTED' || batch.status === 'PICKED UP' || batch.status === 'HANDED OVER') && onQuickAction && (
            <button
              onClick={() => onQuickAction('handover', batch.id)}
              className="px-2.5 py-1 text-[11px] font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-colors flex items-center gap-1"
            >
              <Truck className="w-3 h-3" />
              <span>Custody</span>
            </button>
          )}

          <button
            onClick={() => onSelect(batch.id)}
            className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors shadow-2xs flex items-center gap-0.5"
          >
            <span>Inspect</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
