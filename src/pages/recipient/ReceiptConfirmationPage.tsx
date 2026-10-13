import React, { useState, useEffect } from 'react';
import { WasteBatch } from '../../types/batch';
import { Recipient } from '../../types/recipient';
import { DemoUser } from '../../types/user';
import { batchService } from '../../services/batchService';
import { recipientService } from '../../services/recipientService';
import { handoverService } from '../../services/handoverService';
import { convertQuantityToKg } from '../../services/matchingService';
import { REJECTION_REASONS, RejectionReasonOption } from '../../types/offer';
import {
  Scale,
  XCircle,
  Truck,
  X,
} from 'lucide-react';

interface ReceiptConfirmationPageProps {
  activeUser: DemoUser;
  onNavigate: (path: string) => void;
  onSelectBatch: (id: string) => void;
}

export const ReceiptConfirmationPage: React.FC<ReceiptConfirmationPageProps> = ({
  activeUser,
  onSelectBatch,
}) => {
  const [batches, setBatches] = useState<WasteBatch[]>([]);
  const [facility, setFacility] = useState<Recipient | null>(null);
  const [activeBatch, setActiveBatch] = useState<WasteBatch | null>(null);

  // Receipt Modal State
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [actualWeightKg, setActualWeightKg] = useState<string>('');
  const [slipRef, setSlipRef] = useState('WB-2026-');
  const [receiptNotes, setReceiptNotes] = useState('');

  // Post-Inspection Reject Modal State
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState<RejectionReasonOption>(REJECTION_REASONS[3]); // Contaminated or wet
  const [customExplanation, setCustomExplanation] = useState('');
  const [dockEvidenceRef, setDockEvidenceRef] = useState('DOCK-REJ-2026-');
  const [correctiveFeedback, setCorrectiveFeedback] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadData = async () => {
    const facilityId = activeUser.recipientFacilityId || 'REC-PUN-001';
    const rec = await recipientService.getById(facilityId);
    setFacility(rec);
    const all = await batchService.getAll();
    const facilityBatches = all.filter(
      (b) => b.matchedRecipientId === facilityId && (b.status === 'HANDED OVER' || b.status === 'RECEIVED' || (b.status === 'REJECTED' && b.rejectionStage === 'POST_INSPECTION'))
    );
    setBatches(facilityBatches);
  };

  useEffect(() => {
    loadData();
  }, [activeUser]);

  const handedOverBatches = batches.filter((b) => b.status === 'HANDED OVER');
  const pastConfirmations = batches.filter((b) => b.status === 'RECEIVED' || b.status === 'REJECTED');

  const handleOpenReceipt = (b: WasteBatch) => {
    setActiveBatch(b);
    const declaredKg = convertQuantityToKg(b.quantity, b.unit);
    setActualWeightKg(declaredKg.toString());
    setSlipRef(`WB-${facility?.id?.split('-')[1] || 'PUN'}-${Date.now().toString().slice(-4)}`);
    setReceiptNotes('');
    setIsReceiptModalOpen(true);
    setFeedback(null);
  };

  const handleConfirmReceipt = async () => {
    if (!activeBatch) return;
    const numWeight = parseFloat(actualWeightKg);
    if (isNaN(numWeight) || numWeight <= 0) {
      alert('Please enter a valid scale weight in kilograms.');
      return;
    }
    const res = handoverService.confirmRecipientReceipt(activeBatch, activeUser, {
      actualQuantityKg: numWeight,
      evidenceReference: slipRef.trim(),
      notes: receiptNotes.trim() || undefined,
    });
    if (res.success && res.batch) {
      await batchService.updateBatch(res.batch);
      setFeedback(`Batch ${activeBatch.id} approved at weighbridge and marked RECEIVED.`);
      setIsReceiptModalOpen(false);
      setActiveBatch(null);
      loadData();
    } else {
      setFeedback(res.error || 'Failed to confirm receipt.');
    }
  };

  const handleOpenReject = (b: WasteBatch) => {
    setActiveBatch(b);
    setRejectReason(REJECTION_REASONS[3]);
    setCustomExplanation('');
    setDockEvidenceRef(`DOCK-REJ-${Date.now().toString().slice(-4)}`);
    setCorrectiveFeedback('');
    setIsRejectModalOpen(true);
    setFeedback(null);
  };

  const handleConfirmReject = async () => {
    if (!activeBatch) return;
    const fullReason = `${rejectReason}${customExplanation ? `: ${customExplanation}` : ''}`;
    const res = handoverService.rejectPostInspection(activeBatch, activeUser, {
      rejectionReason: fullReason,
      correctiveFeedback: correctiveFeedback.trim() || 'Sort out contaminated materials before requesting re-delivery.',
      evidenceReference: dockEvidenceRef.trim(),
    });
    if (res.success && res.batch) {
      await batchService.updateBatch(res.batch);
      setFeedback(`Post-inspection dock rejection recorded for batch ${activeBatch.id}.`);
      setIsRejectModalOpen(false);
      setActiveBatch(null);
      loadData();
    } else {
      setFeedback(res.error || 'Failed to record rejection.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Receiving Gate & Weighbridge Intake Confirmation
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Confirm physical arrivals, record verified net weighbridge yield (with scale variance logging), or decline substandard loads at dock inspection.
          </p>
        </div>
        {facility && (
          <div className="px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-xs text-teal-900 font-mono self-start sm:self-auto">
            Facility: <span className="font-bold">{facility.name}</span>
          </div>
        )}
      </div>

      {feedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs font-semibold rounded-xl flex items-center justify-between shadow-2xs">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Loads Staged at Dock */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-amber-600" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
            Staged at Receiving Dock Awaiting Gate Clearance ({handedOverBatches.length})
          </h2>
        </div>

        {handedOverBatches.length === 0 ? (
          <div className="bg-white p-8 sm:p-12 rounded-xl border border-slate-200/90 text-center space-y-2 shadow-2xs">
            <Scale className="w-8 h-8 mx-auto text-slate-300" />
            <h4 className="text-xs font-bold text-slate-700">No Vehicles Waiting at Dock</h4>
            <p className="text-xs text-slate-400">
              When driver finishes transit and offloads at your facility dock, the batch appears here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {handedOverBatches.map((b) => {
              const declaredKg = convertQuantityToKg(b.quantity, b.unit);
              return (
                <div
                  key={b.id}
                  className="bg-white rounded-xl border border-amber-200 p-5 sm:p-6 shadow-2xs space-y-4 card-hover"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">{b.id}</span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="text-xs font-semibold text-slate-800">{b.generatorName}</span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Delivered {b.handoverTimestamp ? new Date(b.handoverTimestamp).toLocaleTimeString() : 'Today'}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 self-start sm:self-auto">
                      AWAITING INTAKE CONFIRMATION
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50/80 p-3.5 rounded-lg text-xs border border-slate-100">
                    <div>
                      <span className="text-[11px] text-slate-500 block">Declared Weight</span>
                      <span className="font-bold text-slate-900 font-mono tabular-nums">
                        {b.quantity} {b.unit} ({declaredKg} kg)
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block">Material & Format</span>
                      <span className="font-medium text-slate-800">
                        {b.materialCategory} ({b.packagingType})
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block">Cleanliness Observation</span>
                      <span className="text-slate-700">{b.contaminationLevel}</span>
                    </div>
                  </div>

                  {b.handoverNotes && (
                    <p className="text-xs text-slate-600 bg-slate-50/50 p-3 rounded-lg border border-slate-100 italic">
                      <strong>Delivery Logistics Note: </strong>"{b.handoverNotes}"
                    </p>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <button
                      onClick={() => onSelectBatch(b.id)}
                      className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                    >
                      Inspect Photo & Readiness Checklist
                    </button>
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => handleOpenReject(b)}
                        className="px-3.5 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Decline at Dock (Physical Inspection)</span>
                      </button>
                      <button
                        onClick={() => handleOpenReceipt(b)}
                        className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Scale className="w-3.5 h-3.5" />
                        <span>Confirm Scale Net Weight & Receive</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Archive */}
      {pastConfirmations.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-slate-200">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider font-mono">
            Gate Intake Clearance Archive ({pastConfirmations.length})
          </h2>
          <div className="space-y-2">
            {pastConfirmations.map((b) => (
              <div
                key={b.id}
                className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{b.id}</span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="font-semibold text-slate-800">{b.generatorName}</span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span>{b.materialCategory}</span>
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5 font-mono">
                    {b.evidenceReference && <span>Slip #{b.evidenceReference} · </span>}
                    {b.actualReceivedQuantity && (
                      <span>
                        Verified Net: {b.actualReceivedQuantity} kg
                        {b.discrepancyKg ? ` (${b.discrepancyKg > 0 ? `+${b.discrepancyKg}` : b.discrepancyKg} kg variance)` : ''}
                      </span>
                    )}
                    {b.rejectionReason && (
                      <span className="text-rose-700 font-sans">
                        Dock Rejection: {b.rejectionReason}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${
                      b.status === 'RECEIVED'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}
                  >
                    {b.status}
                  </span>
                  <button
                    onClick={() => onSelectBatch(b.id)}
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

      {/* CONFIRM RECEIPT MODAL */}
      {isReceiptModalOpen && activeBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-700" />
                <span>Confirm Weighbridge Intake Net Yield</span>
              </h3>
              <button onClick={() => setIsReceiptModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-lg text-xs space-y-1 border border-slate-100">
              <div className="font-semibold text-slate-800">
                Batch {activeBatch.id} ({activeBatch.materialCategory})
              </div>
              <div className="text-slate-500">
                Generator declared: <strong>{convertQuantityToKg(activeBatch.quantity, activeBatch.unit)} kg</strong>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Actual Scale Weight (kg) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                value={actualWeightKg}
                onChange={(e) => setActualWeightKg(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                required
              />
              {actualWeightKg && (
                <div className="text-[11px] text-slate-500 font-mono mt-1">
                  Variance:{' '}
                  <span
                    className={
                      parseFloat(actualWeightKg) - convertQuantityToKg(activeBatch.quantity, activeBatch.unit) < 0
                        ? 'text-rose-600 font-bold'
                        : 'text-emerald-700 font-bold'
                    }
                  >
                    {(
                      parseFloat(actualWeightKg) - convertQuantityToKg(activeBatch.quantity, activeBatch.unit)
                    ).toFixed(1)}{' '}
                    kg
                  </span>
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Weighbridge / Gatepass Reference Slip # <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={slipRef}
                onChange={(e) => setSlipRef(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                placeholder="WB-2026-9812"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Receiving Inspector Notes (Optional)
              </label>
              <textarea
                value={receiptNotes}
                onChange={(e) => setReceiptNotes(e.target.value)}
                rows={2}
                placeholder="e.g. Moisture verified under 10%. Yield approved for secondary processing."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsReceiptModalOpen(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReceipt}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-700 rounded-lg shadow-xs cursor-pointer"
              >
                Sign Off & Record Received
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT POST-INSPECTION MODAL */}
      {isRejectModalOpen && activeBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-rose-900 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Decline Load at Physical Dock Inspection</span>
              </h3>
              <button onClick={() => setIsRejectModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3.5 bg-rose-50 text-rose-900 text-xs leading-relaxed rounded-xl border border-rose-200">
              <strong>Post-Inspection Rejection Notice: </strong> You are rejecting this batch after physical inspection at the receiving gate. This creates a documented non-conformance event for generator re-sorting.
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Inspection Failure Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value as RejectionReasonOption)}
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
                Detailed Observed Defect
              </label>
              <input
                type="text"
                value={customExplanation}
                onChange={(e) => setCustomExplanation(e.target.value)}
                placeholder="e.g. Moisture level 32% (soaking wet); food oil grease on inner cartons"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dock Non-Conformance Report Slip #
              </label>
              <input
                type="text"
                value={dockEvidenceRef}
                onChange={(e) => setDockEvidenceRef(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mandatory Corrective Action Guidance for Generator
              </label>
              <textarea
                value={correctiveFeedback}
                onChange={(e) => setCorrectiveFeedback(e.target.value)}
                rows={2}
                placeholder="e.g. Segregate contaminated pizza boxes. Dry fiber bundle for 48h before re-offering."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                required
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
                Sign Off Dock Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
