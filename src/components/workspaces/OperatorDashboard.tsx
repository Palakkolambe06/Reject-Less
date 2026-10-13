import React from 'react';
import { OperatorDashboardMetrics } from '../../services/batchService';
import { WasteBatch } from '../../types/batch';
import { DemoUser } from '../../types/user';
import { KpiCard } from '../ui/KpiCard';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/StatusBadge';
import {
  Truck,
  Calendar,
  Clock,
  CheckSquare,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  Scale,
} from 'lucide-react';

interface OperatorDashboardProps {
  metrics: OperatorDashboardMetrics;
  activeUser: DemoUser;
  batches: WasteBatch[];
  onNavigate: (path: string) => void;
  onSelectBatch: (id: string) => void;
}

export const OperatorDashboard: React.FC<OperatorDashboardProps> = ({
  metrics,
  batches,
  onNavigate,
  onSelectBatch,
}) => {
  const activeFleetBatches = batches.filter(
    (b) =>
      b.status === 'ACCEPTED' ||
      b.status === 'SCHEDULED' ||
      b.status === 'PICKED UP' ||
      b.status === 'HANDED OVER'
  );

  const needsAttentionCount =
    metrics.overdueOrDelayed +
    metrics.openExceptions +
    metrics.awaitingHandoverConfirmation;

  return (
    <div className="space-y-6">
      {/* 1. Welcome Section & Single Primary Action */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-800 mb-1 font-mono">
            <span>Logistics & Fleet Operations Control</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Dispatch, Custody & Handover Operations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 max-w-2xl leading-relaxed">
            Coordinate driver pickups for accepted loads only. Record verified custody events, generator handover checkoffs, and receiving facility dock deliveries.
          </p>
        </div>
        <div className="shrink-0">
          <Button
            variant="primary"
            onClick={() => onNavigate('/operator/pickup-queue')}
            icon={<Clock className="w-4 h-4" />}
          >
            Driver Pickup Queue ({metrics.awaitingDispatch})
          </Button>
        </div>
      </div>

      {/* 2. Four Compact KPI Cards Per Row on Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard
          label="Pickups Today"
          value={metrics.pickupsScheduledToday}
          description="Scheduled collection runs"
          icon={<Calendar className="w-4 h-4 text-amber-600" />}
          onClick={() => onNavigate('/operator/schedule')}
        />
        <KpiCard
          label="Awaiting Dispatch"
          value={metrics.awaitingDispatch}
          description="Accepted loads to schedule"
          icon={<Clock className="w-4 h-4 text-slate-600" />}
          onClick={() => onNavigate('/operator/pickup-queue')}
        />
        <KpiCard
          label="In Transit"
          value={metrics.inTransit}
          description="Driver custody active"
          icon={<Truck className="w-4 h-4 text-indigo-600" />}
          onClick={() => onNavigate('/operator/active')}
        />
        <KpiCard
          label="Awaiting Generator"
          value={metrics.awaitingHandoverConfirmation}
          description="Pending generator physical sign-off"
          icon={<CheckSquare className="w-4 h-4 text-amber-600" />}
          onClick={() => onNavigate('/operator/active')}
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard
          label="Overdue / Delayed"
          value={metrics.overdueOrDelayed}
          description="Past scheduled pickup SLA"
          icon={<AlertTriangle className="w-4 h-4 text-rose-600" />}
          onClick={() => onNavigate('/operator/exceptions')}
        />
        <KpiCard
          label="Awaiting Recipient Dock"
          value={metrics.awaitingRecipientReceipt}
          description="Delivered, pending weighbridge slip"
          icon={<Scale className="w-4 h-4 text-teal-600" />}
          onClick={() => onNavigate('/operator/evidence')}
        />
        <KpiCard
          label="Completed Handovers"
          value={metrics.completedHandovers}
          description="Full chain of custody verified"
          icon={<ShieldCheck className="w-4 h-4 text-emerald-700" />}
          onClick={() => onNavigate('/operator/completed')}
        />
        <KpiCard
          label="Open Exceptions"
          value={metrics.openExceptions}
          description="Reported delays & discrepancies"
          icon={<AlertCircle className="w-4 h-4 text-rose-600" />}
          onClick={() => onNavigate('/operator/exceptions')}
        />
      </div>

      {/* 3. Needs Attention Section */}
      {needsAttentionCount > 0 && (
        <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-2xs">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Needs Attention ({needsAttentionCount})
              </h3>
            </div>
            <span className="text-xs text-slate-500">
              High priority logistics delays and pending transfer milestones
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {activeFleetBatches.slice(0, 3).map((b) => (
              <div
                key={`att-${b.id}`}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center shrink-0 mt-0.5">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-slate-800">
                        {b.id}
                      </span>
                      <span>·</span>
                      <span>
                        {b.quantity} {b.unit} of {b.materialCategory}
                      </span>
                      <StatusBadge status={b.status} size="sm" />
                    </div>
                    <p className="text-slate-500 text-[11px] mt-0.5 leading-snug">
                      Origin: {b.pickupLocation.address}, {b.pickupLocation.city} · Assigned: {b.assignedOperatorName || 'Unassigned'}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onSelectBatch(b.id)}
                  >
                    Details
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => onNavigate(`/handovers?batchId=${b.id}`)}
                  >
                    Update Custody
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Active Fleet Dispatch Activity Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-2xs">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Active Fleet Dispatch Queue
            </h3>
            <p className="text-xs text-slate-500">
              Coordinated collections with custody verification and destination delivery status
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onNavigate('/operator/pickup-queue')}
          >
            All Pickups
          </Button>
        </div>
        <div className="overflow-x-auto">
          {activeFleetBatches.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 italic">
              No active pickups or transit dispatches in queue.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Batch ID & Origin</th>
                  <th className="py-3 px-4">Material</th>
                  <th className="py-3 px-4 text-right">Quantity</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned Driver</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeFleetBatches.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-slate-900">
                        {b.id}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {b.pickupLocation.city}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {b.materialCategory}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {b.quantity} {b.unit}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={b.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {b.assignedOperatorName || 'Unassigned'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onNavigate(`/handovers?batchId=${b.id}`)}
                      >
                        Update
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
