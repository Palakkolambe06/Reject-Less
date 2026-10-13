import React from 'react';
import { RecipientDashboardMetrics } from '../../services/batchService';
import { RecipientOffer } from '../../types/offer';
import { WasteBatch } from '../../types/batch';
import { Recipient } from '../../types/recipient';
import { DemoUser } from '../../types/user';
import { KpiCard } from '../ui/KpiCard';
import { Button } from '../ui/Button';
import {
  Inbox,
  CheckCircle2,
  XCircle,
  Calendar,
  Truck,
  Scale,
  ArrowRight,
  MapPin,
} from 'lucide-react';

interface RecipientDashboardProps {
  metrics: RecipientDashboardMetrics;
  activeUser: DemoUser;
  facility: Recipient | null;
  pendingOffers: RecipientOffer[];
  handedOverBatches: WasteBatch[];
  onNavigate: (path: string) => void;
  onSelectBatch: (id: string) => void;
}

export const RecipientDashboard: React.FC<RecipientDashboardProps> = ({
  metrics,
  facility,
  pendingOffers,
  handedOverBatches,
  onNavigate,
}) => {
  const needsAttentionCount = pendingOffers.length + handedOverBatches.length;

  return (
    <div className="space-y-6">
      {/* 1. Welcome Section & Single Primary Action */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-800 mb-1 font-mono">
            <span>Recipient & Recycler Workspace</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {facility ? facility.name : 'Recipient Facility Operations'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 max-w-2xl leading-relaxed">
            {facility
              ? `${facility.facilityType} in ${facility.location.city}. Intake range: ${facility.minQuantityKg} – ${facility.maxQuantityKg} kg. Evaluate generator offers and confirm physical dock receipt.`
              : 'Review incoming generator offers, propose collection windows, and confirm weighbridge dock receipts.'}
          </p>
        </div>
        <div className="shrink-0">
          <Button
            variant="accent"
            onClick={() => onNavigate('/recipient/offers')}
            icon={<Inbox className="w-4 h-4" />}
          >
            Review Incoming Offers ({metrics.newOffersAwaitingReview})
          </Button>
        </div>
      </div>

      {/* 2. Four Compact KPI Cards Per Row on Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard
          label="New Offers"
          value={metrics.newOffersAwaitingReview}
          description="Awaiting facility review"
          icon={<Inbox className="w-4 h-4 text-sky-600" />}
          onClick={() => onNavigate('/recipient/offers')}
        />
        <KpiCard
          label="Accepted Offers"
          value={metrics.acceptedOffers}
          description="Agreed for collection"
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          onClick={() => onNavigate('/recipient/accepted')}
        />
        <KpiCard
          label="Pickups Due Today"
          value={metrics.pickupsDueToday}
          description="Scheduled logistics arrivals"
          icon={<Calendar className="w-4 h-4 text-teal-700" />}
          onClick={() => onNavigate('/recipient/schedule')}
        />
        <KpiCard
          label="Awaiting Dock Receipt"
          value={metrics.awaitingReceiptConfirmation}
          description="Delivered, pending weighbridge slip"
          icon={<Scale className="w-4 h-4 text-amber-600" />}
          onClick={() => onNavigate('/recipient/receipt-confirmation')}
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard
          label="Awaiting Collection"
          value={metrics.awaitingCollection}
          description="Accepted loads in dispatch queue"
          icon={<Truck className="w-4 h-4 text-indigo-600" />}
          onClick={() => onNavigate('/recipient/schedule')}
        />
        <KpiCard
          label="Rejected Offers"
          value={metrics.rejectedOffers}
          description="Declined with mandatory reason"
          icon={<XCircle className="w-4 h-4 text-rose-600" />}
          onClick={() => onNavigate('/recipient/rejected')}
        />
        <KpiCard
          label="Capacity Range"
          value={`${facility?.minQuantityKg || 50} – ${facility?.maxQuantityKg || 5000}`}
          unit="kg"
          description="Minimum to maximum single intake"
          icon={<Scale className="w-4 h-4 text-slate-600" />}
          onClick={() => onNavigate('/recipient/requirements')}
        />
        <KpiCard
          label="Facility Service Hub"
          value={facility?.location.city || 'Pune'}
          description={facility?.location.address || 'Operational Zone'}
          icon={<MapPin className="w-4 h-4 text-slate-600" />}
          onClick={() => onNavigate('/recipient/requirements')}
        />
      </div>

      {/* 3. "Needs Attention" Section */}
      {needsAttentionCount > 0 && (
        <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-2xs">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-500" />
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Needs Attention ({needsAttentionCount})
              </h3>
            </div>
            <span className="text-xs text-slate-500">
              Immediate intake decisions requiring facility sign-off
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {/* Delivered loads awaiting receipt confirmation */}
            {handedOverBatches.map((b) => (
              <div
                key={`ho-${b.id}`}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-amber-800">
                        {b.id}
                      </span>
                      <span>·</span>
                      <span>Delivered at Dock — Awaiting Weighbridge Confirmation</span>
                    </div>
                    <p className="text-slate-500 text-[11px] mt-0.5 leading-snug">
                      From {b.generatorName} · {b.quantity} {b.unit} of {b.materialCategory}
                    </p>
                  </div>
                </div>
                <div className="shrink-0">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => onNavigate('/recipient/receipt-confirmation')}
                    icon={<Scale className="w-3.5 h-3.5" />}
                  >
                    Confirm Receipt
                  </Button>
                </div>
              </div>
            ))}

            {/* Pending incoming offers */}
            {pendingOffers.map((o) => (
              <div
                key={`po-${o.id}`}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center shrink-0 mt-0.5">
                    <Inbox className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-sky-800">
                        {o.id}
                      </span>
                      <span>·</span>
                      <span>Incoming Offer from {o.generatorName}</span>
                    </div>
                    <p className="text-slate-500 text-[11px] mt-0.5 leading-snug">
                      {o.quantity} {o.unit} of {o.materialCategory} · 100% certified readiness checklist
                    </p>
                  </div>
                </div>
                <div className="shrink-0">
                  <Button
                    size="sm"
                    variant="accent"
                    onClick={() => onNavigate('/recipient/offers')}
                    icon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Review Offer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Recent Facility Activity Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-2xs">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Facility Waste Intake Stream
            </h3>
            <p className="text-xs text-slate-500">
              Recent offers and custody arrivals addressed to {facility?.name || 'your facility'}
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onNavigate('/recipient/offers')}
          >
            All Offers
          </Button>
        </div>
        <div className="overflow-x-auto">
          {pendingOffers.length === 0 && handedOverBatches.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 italic">
              No pending offers or intake arrivals currently queued for this facility.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Offer / Batch Ref</th>
                  <th className="py-3 px-4">Generator</th>
                  <th className="py-3 px-4">Material</th>
                  <th className="py-3 px-4 text-right">Quantity</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingOffers.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {o.id}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {o.generatorName}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {o.materialCategory}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {o.quantity} {o.unit}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200">
                        OFFER PENDING
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onNavigate('/recipient/offers')}
                      >
                        Review
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
