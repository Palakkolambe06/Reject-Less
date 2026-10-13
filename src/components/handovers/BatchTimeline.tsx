import React, { useState } from 'react';
import { StatusHistoryEvent, BatchStatus, WasteBatch } from '../../types/batch';
import { formatDateTime, getRelativeTime } from '../../utils/dateFormat';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Truck,
  User,
  ArrowRight,
  ShieldCheck,
  FileText,
  Building2,
  Layers,
  ArrowUpDown,
  Filter,
  Check,
  BadgeAlert,
} from 'lucide-react';

export interface BatchTimelineProps {
  events: StatusHistoryEvent[];
  batch?: WasteBatch;
  compact?: boolean;
}

export const BatchTimeline: React.FC<BatchTimelineProps> = ({
  events = [],
  batch,
  compact = false,
}) => {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterType, setFilterType] = useState<'ALL' | 'HANDOVERS' | 'REJECTIONS'>('ALL');

  const getStatusIcon = (status: BatchStatus) => {
    switch (status) {
      case 'RECEIVED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'REJECTED':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'SCHEDULED':
      case 'PICKED UP':
      case 'HANDED OVER':
        return <Truck className="w-4 h-4 text-teal-600" />;
      case 'OFFERED':
      case 'ACCEPTED':
      case 'MATCHED':
        return <Building2 className="w-4 h-4 text-sky-600" />;
      case 'READY':
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      case 'PREPARATION':
        return <Layers className="w-4 h-4 text-amber-600" />;
      case 'DRAFT':
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  const getStatusBadgeStyle = (status: BatchStatus) => {
    switch (status) {
      case 'RECEIVED':
        return 'border-emerald-300 bg-emerald-50 text-emerald-900 font-bold';
      case 'REJECTED':
        return 'border-rose-300 bg-rose-50 text-rose-900 font-bold';
      case 'SCHEDULED':
      case 'PICKED UP':
      case 'HANDED OVER':
        return 'border-teal-300 bg-teal-50 text-teal-900 font-bold';
      case 'READY':
      case 'ACCEPTED':
      case 'MATCHED':
      case 'OFFERED':
        return 'border-sky-300 bg-sky-50 text-sky-900 font-bold';
      case 'PREPARATION':
        return 'border-amber-300 bg-amber-50 text-amber-900 font-semibold';
      case 'DRAFT':
      default:
        return 'border-slate-300 bg-slate-100 text-slate-700 font-semibold';
    }
  };

  const getRoleBadgeStyle = (role?: string) => {
    const r = (role || '').toLowerCase();
    if (r.includes('generator')) {
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
    if (r.includes('recipient') || r.includes('recycler')) {
      return 'bg-teal-50 text-teal-800 border-teal-200';
    }
    if (r.includes('operator') || r.includes('logistics') || r.includes('driver')) {
      return 'bg-indigo-50 text-indigo-800 border-indigo-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  // Build list of transitions with previous status references
  const transitionsWithMeta = events.map((evt, idx) => {
    const prevStatus = idx > 0 ? events[idx - 1].status : null;
    const prevTimestamp = idx > 0 ? events[idx - 1].timestamp : null;
    let timeDeltaFormatted: string | null = null;
    if (prevTimestamp && evt.timestamp) {
      const prevMs = new Date(prevTimestamp).getTime();
      const currMs = new Date(evt.timestamp).getTime();
      if (!isNaN(prevMs) && !isNaN(currMs) && currMs >= prevMs) {
        const deltaMins = Math.round((currMs - prevMs) / 60000);
        if (deltaMins < 60) {
          timeDeltaFormatted = `+${deltaMins}m`;
        } else {
          const deltaHours = Math.floor(deltaMins / 60);
          const remMins = deltaMins % 60;
          timeDeltaFormatted = `+${deltaHours}h ${remMins}m`;
        }
      }
    }

    const isHandoverEvent =
      evt.status === 'SCHEDULED' ||
      evt.status === 'PICKED UP' ||
      evt.status === 'HANDED OVER' ||
      evt.status === 'RECEIVED' ||
      evt.status === 'REJECTED';

    return {
      evt,
      originalIndex: idx,
      stepNumber: idx + 1,
      prevStatus,
      timeDeltaFormatted,
      isHandoverEvent,
    };
  });

  // Filter transitions
  const filteredTransitions = transitionsWithMeta.filter((item) => {
    if (filterType === 'HANDOVERS') {
      return item.isHandoverEvent;
    }
    if (filterType === 'REJECTIONS') {
      return item.evt.status === 'REJECTED';
    }
    return true;
  });

  // Sort transitions
  const displayTransitions = [...filteredTransitions].sort((a, b) => {
    if (sortOrder === 'desc') {
      return b.stepNumber - a.stepNumber;
    }
    return a.stepNumber - b.stepNumber;
  });

  if (!events || events.length === 0) {
    return (
      <div className="text-xs text-slate-500 italic p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
        No lifecycle status transitions recorded yet. Initializing status log...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls Bar (Filter & Sort) */}
      {!compact && events.length > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 pb-2 border-b border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
              Filter:
            </span>
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-[11px]">
              <button
                type="button"
                onClick={() => setFilterType('ALL')}
                className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                  filterType === 'ALL'
                    ? 'bg-white font-bold text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({events.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('HANDOVERS')}
                className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                  filterType === 'HANDOVERS'
                    ? 'bg-white font-bold text-teal-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Handovers
              </button>
              <button
                type="button"
                onClick={() => setFilterType('REJECTIONS')}
                className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                  filterType === 'REJECTIONS'
                    ? 'bg-white font-bold text-rose-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Rejections
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-slate-50 px-2 py-1 rounded-md border border-slate-200 cursor-pointer"
          >
            <ArrowUpDown className="w-3 h-3 text-slate-400" />
            <span>{sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}</span>
          </button>
        </div>
      )}

      {/* Vertical Timeline List */}
      <div className="relative pl-7 space-y-4 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {displayTransitions.map(
          ({ evt, stepNumber, prevStatus, timeDeltaFormatted }) => {
            const isLatest = stepNumber === events.length;

            return (
              <div key={evt.id || `evt-${stepNumber}`} className="relative group">
                {/* Timeline node marker with status icon */}
                <div
                  className={`absolute -left-7 top-1 w-6 h-6 rounded-full border-2 bg-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-110 ${
                    isLatest
                      ? 'border-emerald-700 ring-4 ring-emerald-50'
                      : evt.status === 'REJECTED'
                      ? 'border-rose-500 ring-2 ring-rose-50'
                      : 'border-slate-300'
                  }`}
                  title={`Status Transition Step #${stepNumber}: ${
                    prevStatus ? `${prevStatus} → ${evt.status}` : evt.status
                  }`}
                >
                  {getStatusIcon(evt.status)}
                </div>

                {/* Timeline Card */}
                <div
                  className={`bg-white p-3.5 rounded-xl border transition-all ${
                    isLatest
                      ? 'border-emerald-300 shadow-xs ring-1 ring-emerald-100'
                      : evt.status === 'REJECTED'
                      ? 'border-rose-300 bg-rose-50/20 shadow-2xs'
                      : 'border-slate-200/90 shadow-2xs hover:border-slate-300'
                  } space-y-2`}
                >
                  {/* Transition Header Banner: e.g. DRAFT to READY */}
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        #{stepNumber}
                      </span>

                      {/* Explicit Status Change Display: previous -> current */}
                      {prevStatus ? (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`font-mono text-[11px] px-2 py-0.5 rounded border ${getStatusBadgeStyle(
                              prevStatus
                            )}`}
                          >
                            {prevStatus}
                          </span>
                          <span className="inline-flex items-center text-slate-400">
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                          <span
                            className={`font-mono text-[11px] px-2 py-0.5 rounded border ${getStatusBadgeStyle(
                              evt.status
                            )}`}
                          >
                            {evt.status}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
                            Initial State:
                          </span>
                          <span
                            className={`font-mono text-[11px] px-2 py-0.5 rounded border ${getStatusBadgeStyle(
                              evt.status
                            )}`}
                          >
                            {evt.status}
                          </span>
                        </div>
                      )}

                      {isLatest && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Active State
                        </span>
                      )}
                    </div>

                    {/* Elapsed Time Delta if applicable */}
                    {timeDeltaFormatted && (
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                        {timeDeltaFormatted}
                      </span>
                    )}
                  </div>

                  {/* Timestamp & Performed By Role */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono text-[11px] text-slate-700 font-medium">
                        {formatDateTime(evt.timestamp)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ({getRelativeTime(evt.timestamp)})
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {evt.role && (
                        <span
                          className={`font-mono text-[10px] font-medium px-1.5 py-0.5 rounded border ${getRoleBadgeStyle(
                            evt.role
                          )}`}
                        >
                          {evt.role.toUpperCase()}
                        </span>
                      )}
                      <span className="text-[11px] text-slate-700 font-medium flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        {evt.performedBy}
                      </span>
                    </div>
                  </div>

                  {/* Notes / Reason / Evidence */}
                  {evt.notes && (
                    <div className="text-xs text-slate-700 bg-slate-50/80 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                      {evt.notes}
                    </div>
                  )}

                  {/* Rejection Specific Feedback */}
                  {evt.reason && (
                    <div className="p-2.5 bg-rose-50 rounded-lg border border-rose-200 text-xs text-rose-900 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-rose-700">
                        <BadgeAlert className="w-3.5 h-3.5" />
                        <span>Rejection Reason: {evt.reason}</span>
                      </div>
                      {evt.stage && (
                        <div className="text-[11px] text-rose-700 font-medium">
                          Stage: {evt.stage === 'POST_INSPECTION' ? 'Post-Inspection Physical Dock Check' : 'Pre-Acceptance Verification'}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Evidence Reference (Slip / Weighbridge / Waybill) */}
                  {(evt.evidenceReference || (isLatest && batch?.evidenceReference)) && (
                    <div className="flex items-center gap-1.5 text-[11px] text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200 font-mono">
                      <FileText className="w-3.5 h-3.5 text-teal-600" />
                      <span>
                        Receipt / Waybill Ref:{' '}
                        <strong>
                          {evt.evidenceReference || batch?.evidenceReference}
                        </strong>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          }
        )}
      </div>

      {/* Summary Footer on Bottom */}
      {!compact && batch && (
        <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <span>
            Total Transitions Recorded: <strong>{events.length}</strong>
          </span>
          <div className="flex items-center gap-3">
            {batch.generatorHandoverConfirmed && (
              <span className="flex items-center gap-1 text-emerald-800 font-medium">
                <Check className="w-3 h-3 text-emerald-600" /> Generator Handover Confirmed
              </span>
            )}
            {batch.recipientReceivedConfirmed && (
              <span className="flex items-center gap-1 text-emerald-800 font-medium">
                <Check className="w-3 h-3 text-emerald-600" /> Recipient Receipt Confirmed
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
