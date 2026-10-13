import React, { useState, useEffect } from 'react';
import { RecipientOffer, REJECTION_REASONS, RejectionReasonOption } from '../../types/offer';
import { WasteBatch } from '../../types/batch';
import { Recipient } from '../../types/recipient';
import { DemoUser } from '../../types/user';
import { offerService } from '../../services/offerService';
import { batchService } from '../../services/batchService';
import { recipientService } from '../../services/recipientService';
import {
  Inbox,
  CheckCircle2,
  XCircle,
  Clock,
  FileCheck,
  ChevronRight,
  X,
} from 'lucide-react';

interface IncomingOffersPageProps {
  activeUser: DemoUser;
  onNavigate: (path: string) => void;
  onSelectBatch: (id: string) => void;
}

export const IncomingOffersPage: React.FC<IncomingOffersPageProps> = ({
  activeUser,
  onSelectBatch,
}) => {
  const [offers, setOffers] = useState<RecipientOffer[]>([]);
  const [batches, setBatches] = useState<Record<string, WasteBatch>>({});
  const [facility, setFacility] = useState<Recipient | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<RecipientOffer | null>(null);

  // Accept modal state
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [proposedPickupDate, setProposedPickupDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().substring(0, 16)
  );

  // Reject modal state
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<RejectionReasonOption>(REJECTION_REASONS[0]);
  const [rejectionExplanation, setRejectionExplanation] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const loadData = async () => {
    const facilityId = activeUser.recipientFacilityId || 'REC-PUN-001';
    const rec = await recipientService.getById(facilityId);
    setFacility(rec);

    const allOffers = await offerService.getAll();
    const facilityOffers = allOffers.filter((o) => o.recipientId === facilityId);
    setOffers(facilityOffers);

    const allBatches = await batchService.getAll();
    const batchMap: Record<string, WasteBatch> = {};
    for (const b of allBatches) {
      batchMap[b.id] = b;
    }
    setBatches(batchMap);
  };

  useEffect(() => {
    loadData();
  }, [activeUser]);

  const handleOpenAccept = (offer: RecipientOffer) => {
    setSelectedOffer(offer);
    setIsAcceptModalOpen(true);
    setFeedbackMessage(null);
  };

  const handleConfirmAccept = async () => {
    if (!selectedOffer) return;
    const res = await offerService.acceptOffer(selectedOffer.id, activeUser, proposedPickupDate);
    if (res.success) {
      setFeedbackMessage(`Offer ${selectedOffer.id} accepted. Handover scheduling queued.`);
      setIsAcceptModalOpen(false);
      setSelectedOffer(null);
      loadData();
    } else {
      setFeedbackMessage(res.error || 'Failed to accept offer.');
    }
  };

  const handleOpenReject = (offer: RecipientOffer) => {
    setSelectedOffer(offer);
    setSelectedReason(REJECTION_REASONS[0]);
    setRejectionExplanation('');
    setIsRejectModalOpen(true);
    setFeedbackMessage(null);
  };

  const handleConfirmReject = async () => {
    if (!selectedOffer) return;
    const res = await offerService.rejectOffer(
      selectedOffer.id,
      activeUser,
      selectedReason,
      rejectionExplanation
    );
    if (res.success) {
      setFeedbackMessage(
        `Offer ${selectedOffer.id} declined. Rejection reason recorded and generator notified.`
      );
      setIsRejectModalOpen(false);
      setSelectedOffer(null);
      loadData();
    } else {
      setFeedbackMessage(res.error || 'Failed to reject offer.');
    }
  };

  const pendingOffers = offers.filter((o) => o.status === 'PENDING');
  const pastOffers = offers.filter((o) => o.status !== 'PENDING');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Incoming Recyclable Offers
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Offers submitted by waste generators to {facility ? facility.name : 'your facility'}. Evaluate material purity, quantity thresholds, and packaging suitability.
          </p>
        </div>
        {facility && (
          <div className="px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-xs text-teal-900 font-mono self-start sm:self-auto">
            Facility: <span className="font-bold">{facility.name}</span>
          </div>
        )}
      </div>

      {feedbackMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs font-semibold flex items-center justify-between shadow-2xs">
          <span>{feedbackMessage}</span>
          <button onClick={() => setFeedbackMessage(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Pending Offers Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-teal-700" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
            Awaiting Facility Intake Decision ({pendingOffers.length})
          </h2>
        </div>

        {pendingOffers.length === 0 ? (
          <div className="bg-white p-8 sm:p-12 rounded-xl border border-slate-200/90 text-center space-y-2 shadow-2xs">
            <Inbox className="w-8 h-8 mx-auto text-slate-300" />
            <h4 className="text-xs font-bold text-slate-700">No New Incoming Offers</h4>
            <p className="text-xs text-slate-400">
              When waste generators match and submit batches to your facility, they will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pendingOffers.map((offer) => {
              const batch = batches[offer.batchId];
              return (
                <div
                  key={offer.id}
                  className="bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4 hover:border-slate-300 transition-all card-hover"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-slate-900">{offer.id}</span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="text-xs font-semibold text-slate-800">{offer.generatorName}</span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Offered {new Date(offer.offeredAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200 self-start sm:self-auto">
                      STATUS: PENDING REVIEW
                    </span>
                  </div>

                  {/* Batch Details Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs bg-slate-50/80 p-3.5 rounded-lg border border-slate-100">
                    <div>
                      <span className="text-[11px] text-slate-500 block">Material & Weight</span>
                      <span className="font-bold text-slate-900 text-sm">
                        {offer.quantity} {offer.unit} of {offer.materialCategory}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block">Packaging & Condition</span>
                      <span className="font-medium text-slate-800">
                        {batch ? `${batch.packagingType} · ${batch.contaminationLevel}` : 'Standard'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block">Pickup Location</span>
                      <span className="text-slate-800 font-medium">
                        {batch ? `${batch.pickupLocation.city} (${batch.pickupLocation.pincode})` : 'Pune'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block">Readiness Quality Gate</span>
                      <span className="font-bold text-emerald-800 flex items-center gap-1">
                        <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                        {batch && batch.isReadyForMatching ? '100% Certified' : 'Verified'}
                      </span>
                    </div>
                  </div>

                  {offer.notes && (
                    <p className="text-xs text-slate-600 bg-slate-50/50 p-3 rounded-lg border border-slate-100 italic">
                      <strong>Generator Remark: </strong>"{offer.notes}"
                    </p>
                  )}

                  {/* Action Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <button
                      onClick={() => onSelectBatch(offer.batchId)}
                      className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                    >
                      <span>Inspect Complete Batch Dossier</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-center gap-2.5 self-end sm:self-auto">
                      <button
                        onClick={() => handleOpenReject(offer)}
                        className="px-3.5 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Decline Offer</span>
                      </button>
                      <button
                        onClick={() => handleOpenAccept(offer)}
                        className="px-4 py-1.5 text-xs font-bold text-white bg-teal-800 hover:bg-teal-700 rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Accept Offer & Schedule</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Decision History Section */}
      {pastOffers.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-slate-200">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider font-mono">
            Prior Decision Archive ({pastOffers.length})
          </h2>
          <div className="space-y-2">
            {pastOffers.map((o) => (
              <div
                key={o.id}
                className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{o.id}</span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="font-semibold text-slate-800">{o.generatorName}</span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span>{o.quantity} {o.unit} of {o.materialCategory}</span>
                  </div>
                  {o.rejectionReason && (
                    <div className="text-rose-700 text-[11px] mt-0.5">
                      <strong>Declined Reason: </strong>{o.rejectionReason}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${
                      o.status === 'ACCEPTED'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}
                  >
                    {o.status}
                  </span>
                  <button
                    onClick={() => onSelectBatch(o.batchId)}
                    className="text-slate-500 hover:text-slate-800 text-xs font-semibold cursor-pointer"
                  >
                    Inspect
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ACCEPT MODAL */}
      {isAcceptModalOpen && selectedOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-700" />
                <span>Accept Recyclable Batch Offer</span>
              </h3>
              <button
                onClick={() => setIsAcceptModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Confirming this offer commits {facility?.name || 'your facility'} to receive{' '}
              <strong>{selectedOffer.quantity} {selectedOffer.unit} of {selectedOffer.materialCategory}</strong>{' '}
              from {selectedOffer.generatorName}.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Proposed Collection / Receiving Window
              </label>
              <input
                type="datetime-local"
                value={proposedPickupDate}
                onChange={(e) => setProposedPickupDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Logistics fleet operators will be notified to schedule truck dispatch.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAcceptModalOpen(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAccept}
                className="px-4 py-2 text-xs font-bold text-white bg-teal-800 hover:bg-teal-700 rounded-lg shadow-xs cursor-pointer"
              >
                Confirm Offer Acceptance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {isRejectModalOpen && selectedOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-rose-900 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Decline Recyclable Offer</span>
              </h3>
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 rounded-lg bg-rose-50 text-rose-900 text-xs">
              <strong>Mandatory Rejection Reason:</strong> An explainable rejection reason is required so the generator can take corrective sorting actions.
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Standard Rejection Reason Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value as RejectionReasonOption)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                {REJECTION_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Specific Explanation & Corrective Guidance for Generator
              </label>
              <textarea
                value={rejectionExplanation}
                onChange={(e) => setRejectionExplanation(e.target.value)}
                rows={3}
                placeholder="e.g. Current storage capacity filled; or batch is 75 kg below minimum commercial intake threshold."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-lg shadow-xs cursor-pointer"
              >
                Record Offer Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
