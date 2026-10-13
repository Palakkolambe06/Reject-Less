import React from 'react';
import { GeneratorDashboardMetrics } from '../../services/batchService';
import { WasteBatch } from '../../types/batch';
import { RecipientOffer } from '../../types/offer';
import { KpiCard } from '../ui/KpiCard';
import { Button } from '../ui/Button';
import { BatchStatusChart } from '../dashboard/BatchStatusChart';
import { RecentBatches } from '../dashboard/RecentBatches';
import {
  PackageCheck,
  CheckSquare,
  Building2,
  Truck,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  Inbox,
  Clock,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';

interface GeneratorDashboardProps {
  metrics: GeneratorDashboardMetrics;
  batches: WasteBatch[];
  offers: RecipientOffer[];
  onNavigate: (path: string) => void;
  onSelectBatch: (id: string) => void;
}

export const GeneratorDashboard: React.FC<GeneratorDashboardProps> = ({
  metrics,
  batches,
  offers,
  onNavigate,
  onSelectBatch,
}) => {
  const pendingOffers = offers.filter((o) => o.status === 'PENDING');
  const incompleteReadiness = batches.filter(
    (b) => b.status === 'DRAFT' || b.status === 'PREPARATION' || (!b.isReadyForMatching && b.status !== 'REJECTED')
  );
  const rejectedBatches = batches.filter((b) => b.status === 'REJECTED');
  const needsAttentionCount =
    incompleteReadiness.length + pendingOffers.length + rejectedBatches.length;

  // Build status breakdown object for BatchStatusChart
  const statusBreakdown = {
    DRAFT: batches.filter((b) => b.status === 'DRAFT').length,
    PREPARATION: batches.filter((b) => b.status === 'PREPARATION').length,
    READY: batches.filter((b) => b.status === 'READY').length,
    MATCHED: batches.filter((b) => b.status === 'MATCHED').length,
    OFFERED: batches.filter((b) => b.status === 'OFFERED').length,
    ACCEPTED: batches.filter((b) => b.status === 'ACCEPTED').length,
    SCHEDULED: batches.filter((b) => b.status === 'SCHEDULED').length,
    'PICKED UP': batches.filter((b) => b.status === 'PICKED UP').length,
    'HANDED OVER': batches.filter((b) => b.status === 'HANDED OVER').length,
    RECEIVED: batches.filter((b) => b.status === 'RECEIVED').length,
    REJECTED: batches.filter((b) => b.status === 'REJECTED').length,
  };

  return (
    <div className="space-y-6">
      {/* 1. Welcome Section & Single Primary Action */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800 mb-1 font-mono">
            <span>Waste Generator Workspace</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Segregation & Readiness Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 max-w-2xl leading-relaxed">
            AI-assisted material classification, human verification gate, deterministic recycler matching, and chain-of-custody tracking.
          </p>
        </div>
        <div className="shrink-0">
          <Button
            variant="primary"
            onClick={() => onNavigate('/create-batch')}
            icon={<PlusCircle className="w-4 h-4" />}
          >
            Register Waste Batch
          </Button>
        </div>
      </div>

      {/* 2. Four Compact KPI Cards Per Row on Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard
          label="Total Batches"
          value={metrics.totalBatches}
          description="All generated waste streams"
          icon={<PackageCheck className="w-4 h-4" />}
          onClick={() => onNavigate('/batches')}
        />
        <KpiCard
          label="In Preparation"
          value={metrics.draftPreparation}
          description="Sorting & readiness incomplete"
          icon={<CheckSquare className="w-4 h-4 text-amber-600" />}
          onClick={() => onNavigate('/readiness')}
        />
        <KpiCard
          label="Ready for Match"
          value={metrics.readyForMatching}
          description="100% quality gate certified"
          icon={<CheckCircle2 className="w-4 h-4 text-teal-600" />}
          onClick={() => onNavigate('/recipients')}
        />
        <KpiCard
          label="Awaiting Recipient"
          value={metrics.awaitingRecipientResponse}
          description="Pending facility decision"
          icon={<Inbox className="w-4 h-4 text-sky-600" />}
          onClick={() => onNavigate('/batches')}
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard
          label="Accepted Offers"
          value={metrics.acceptedOffers}
          description="Locked by recycler"
          icon={<Building2 className="w-4 h-4 text-emerald-600" />}
          onClick={() => onNavigate('/handovers')}
        />
        <KpiCard
          label="Scheduled Handover"
          value={metrics.scheduledHandovers}
          description="Logistics pickup locked"
          icon={<Truck className="w-4 h-4 text-indigo-600" />}
          onClick={() => onNavigate('/handovers')}
        />
        <KpiCard
          label="Recovered Yield"
          value={metrics.receivedCount}
          unit={`(${metrics.totalRecycledWeightKg.toLocaleString()} kg)`}
          description="Verified recycler intake"
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-700" />}
          onClick={() => onNavigate('/history')}
        />
        <KpiCard
          label="Rejections"
          value={rejectedBatches.length}
          description="Declined or dock-rejected"
          icon={<AlertTriangle className="w-4 h-4 text-rose-600" />}
          onClick={() => onNavigate('/history')}
        />
      </div>

      {/* 3. One Main Batch Lifecycle Visualisation */}
      <BatchStatusChart
        statusBreakdown={statusBreakdown}
        totalBatches={metrics.totalBatches}
      />

      {/* 4. Clear "Needs Attention" Section */}
      {needsAttentionCount > 0 && (
        <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-2xs">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Needs Attention ({needsAttentionCount})
              </h3>
            </div>
            <span className="text-xs text-slate-500">
              Actionable tasks requiring generator intervention
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {/* Rejected batches awaiting correction */}
            {rejectedBatches.map((b) => (
              <div
                key={`rej-${b.id}`}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-rose-700">
                        {b.id}
                      </span>
                      <span>·</span>
                      <span>Rejected Load ({b.materialCategory})</span>
                    </div>
                    <p className="text-slate-500 text-[11px] mt-0.5 leading-snug">
                      Reason: <strong className="text-slate-700">{b.rejectionReason || 'Quality check failed'}</strong>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onSelectBatch(b.id)}
                  >
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => onNavigate(`/readiness?batchId=${b.id}`)}
                    icon={<RotateCcw className="w-3 h-3" />}
                  >
                    Correct & Reopen
                  </Button>
                </div>
              </div>
            ))}

            {/* Pending recipient offers */}
            {pendingOffers.map((o) => (
              <div
                key={`off-${o.id}`}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-sky-800">
                        {o.id}
                      </span>
                      <span>·</span>
                      <span>Offered to {o.recipientName}</span>
                    </div>
                    <p className="text-slate-500 text-[11px] mt-0.5 leading-snug">
                      Batch {o.batchId} ({o.quantity} {o.unit} {o.materialCategory}) · Waiting for recipient acceptance
                    </p>
                  </div>
                </div>
                <div className="shrink-0">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onSelectBatch(o.batchId)}
                  >
                    Track Offer
                  </Button>
                </div>
              </div>
            ))}

            {/* Incomplete readiness batches */}
            {incompleteReadiness.slice(0, 3).map((b) => (
              <div
                key={`read-${b.id}`}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-amber-800">
                        {b.id}
                      </span>
                      <span>·</span>
                      <span>Readiness Checklist Incomplete</span>
                    </div>
                    <p className="text-slate-500 text-[11px] mt-0.5 leading-snug">
                      {b.quantity} {b.unit} of {b.materialCategory} · Complete 6-point verification to unlock matching
                    </p>
                  </div>
                </div>
                <div className="shrink-0">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onNavigate(`/readiness?batchId=${b.id}`)}
                    icon={<ArrowRight className="w-3 h-3" />}
                  >
                    Complete Check
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Recent Activity Table with Status Badges and Concise Actions */}
      <RecentBatches
        batches={batches}
        onSelectBatch={onSelectBatch}
        onCreateBatch={() => onNavigate('/create-batch')}
      />
    </div>
  );
};
