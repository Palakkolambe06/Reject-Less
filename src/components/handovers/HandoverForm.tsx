import React, { useState } from 'react';
import { WasteBatch } from '../../types/batch';
import { Recipient } from '../../types/recipient';
import { HandoverScheduleData, HandoverOutcomeData } from '../../types/handover';
import { DemoUser } from '../../types/user';
import {
  Truck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  FileText,
  Scale,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';

interface HandoverFormProps {
  batch: WasteBatch;
  recipients: Recipient[];
  activeUser?: DemoUser;
  onSchedule: (data: HandoverScheduleData) => Promise<void>;
  onMarkHandedOver: () => Promise<void>;
  onRecordOutcome: (data: HandoverOutcomeData) => Promise<void>;
  onReopenRejected?: (batchId: string) => Promise<void>;
  onNavigate?: (path: string) => void;
  isProcessing?: boolean;
}

export const HandoverForm: React.FC<HandoverFormProps> = ({
  batch,
  recipients,
  activeUser,
  onSchedule,
  onMarkHandedOver,
  onRecordOutcome,
  onReopenRejected,
  onNavigate,
  isProcessing = false,
}) => {
  const isGenerator = activeUser?.role === 'generator';

  // Scheduling state
  const [selectedRecipientId, setSelectedRecipientId] = useState(
    batch.matchedRecipientId || (recipients.length > 0 ? recipients[0].id : '')
  );
  const [scheduledDate, setScheduledDate] = useState(
    batch.scheduledHandoverDate
      ? batch.scheduledHandoverDate.substring(0, 16)
      : new Date(Date.now() + 86400000).toISOString().substring(0, 16)
  );
  const [contactPerson, setContactPerson] = useState('Logistics Desk Coordinator');
  const [contactPhone, setContactPhone] = useState('+91 98220 00000');
  const [scheduleNotes, setScheduleNotes] = useState(batch.handoverNotes || '');

  // Outcome state
  const [outcome, setOutcome] = useState<'RECEIVED' | 'REJECTED'>('RECEIVED');
  const [recordedBy, setRecordedBy] = useState(
    activeUser?.name || 'Intake Weighbridge Inspector'
  );
  const [evidenceReference, setEvidenceReference] = useState('WEIGH-2026-');
  const [outcomeNotes, setOutcomeNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [correctiveFeedback, setCorrectiveFeedback] = useState('');
  const [outcomeError, setOutcomeError] = useState<string | null>(null);

  const matchedRecipient = recipients.find((r) => r.id === batch.matchedRecipientId);

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecipientId) return;
    await onSchedule({
      batchId: batch.id,
      recipientId: selectedRecipientId,
      scheduledDate,
      contactPerson,
      contactPhone,
      handoverNotes: scheduleNotes,
    });
  };

  const handleOutcomeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOutcomeError(null);
    if (outcome === 'REJECTED') {
      if (!rejectionReason || rejectionReason.trim().length < 5) {
        setOutcomeError('A specific rejection reason is mandatory when recording a rejection.');
        return;
      }
    }
    await onRecordOutcome({
      batchId: batch.id,
      outcome,
      completedAt: new Date().toISOString(),
      recordedBy,
      evidenceReference: evidenceReference.trim() || undefined,
      notes: outcomeNotes.trim() || undefined,
      rejectionReason: outcome === 'REJECTED' ? rejectionReason.trim() : undefined,
      correctiveFeedback: outcome === 'REJECTED' ? correctiveFeedback.trim() : undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Schedule Form (Shown when READY or MATCHED, for operator/admin/generator) */}
      {(batch.status === 'READY' || batch.status === 'MATCHED') && (
        <form
          onSubmit={handleScheduleSubmit}
          className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-4"
        >
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Calendar className="w-4 h-4 text-emerald-800" />
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Schedule Recipient Handover / Dispatch</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Designated Recipient Facility
              </label>
              <select
                value={selectedRecipientId}
                onChange={(e) => setSelectedRecipientId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                disabled={isProcessing}
              >
                {recipients.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.facilityType})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Pickup Date & Time
              </label>
              <input
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-700"
                disabled={isProcessing}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dispatch Coordinator Name
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                disabled={isProcessing}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-700"
                disabled={isProcessing}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Dispatch Instructions / Vehicle Notes
            </label>
            <textarea
              value={scheduleNotes}
              onChange={(e) => setScheduleNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Loading from Bay 2. Commercial flatbed vehicle required."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              disabled={isProcessing}
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isProcessing}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-900 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <Truck className="w-4 h-4" />
              <span>{isProcessing ? 'Scheduling...' : 'Lock Scheduled Handover'}</span>
            </button>
          </div>
        </form>
      )}

      {/* 2. Physical Handover Action (When status is SCHEDULED) */}
      {batch.status === 'SCHEDULED' && (
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                {isGenerator ? 'Confirm Physical Handover to Carrier' : 'Dispatch / Pickup In Progress'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Scheduled for {batch.scheduledHandoverDate || 'today'}. Confirm when waste has been physically loaded onto transport vehicle.
              </p>
            </div>
            <button
              type="button"
              onClick={onMarkHandedOver}
              disabled={isProcessing}
              className="flex items-center gap-2 px-4 py-2.5 bg-teal-700 hover:bg-teal-600 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 shadow-xs active:scale-98"
            >
              <Truck className="w-4 h-4" />
              <span>
                {isGenerator ? 'Confirm Handover to Driver (In Transit)' : 'Confirm Handover Dispatch (In Transit)'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* 3. GENERATOR VIEW: When batch is IN TRANSIT / HANDED OVER */}
      {isGenerator && (batch.status === 'PICKED UP' || batch.status === 'HANDED OVER') && (
        <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  {batch.status === 'PICKED UP' ? 'In Transit with Logistics Carrier' : 'Staged at Recipient Receiving Dock'}
                </h3>
                <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200">
                  Awaiting Recipient Dock Decision
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                The waste has been dispatched. Under RejectLess platform segregation of duties, the receiving facility ({matchedRecipient ? matchedRecipient.name : 'Designated Recipient'}) must perform receiving inspection, check for moisture or contaminants, and record verified weighbridge tonnage.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
            <div className="font-semibold text-slate-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Generator Protection: Independent Intake Verification</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Waste generators cannot self-certify receipt of their own waste. The receiving facility officer will certify dock intake or issue corrective rejection feedback.
            </p>
            {onNavigate && (
              <div className="pt-1 flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Testing this workflow in demo?</span>
                <button
                  type="button"
                  onClick={() => onNavigate('/recipient/receipt-confirmation')}
                  className="text-[11px] font-bold text-teal-700 hover:text-teal-900 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>Switch to Recipient Intake Confirmation View</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. GENERATOR VIEW: When batch was RECEIVED */}
      {batch.status === 'RECEIVED' && (
        <div className="bg-white p-6 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 text-emerald-900 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Intake Receipt Verified by Recycler</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-white p-4 rounded-lg border border-emerald-100">
            <div>
              <span className="text-[11px] text-slate-500 block">Weighbridge Slip</span>
              <span className="font-mono font-bold text-slate-900">{batch.evidenceReference || 'WB-VERIFIED'}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Verified Net Weight</span>
              <span className="font-mono font-bold text-emerald-700 text-sm">
                {batch.actualReceivedQuantity ?? batch.quantity} kg
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Material Grade</span>
              <span className="font-semibold text-slate-900">{batch.materialCategory} (Approved)</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Status</span>
              <span className="font-mono font-bold text-emerald-800">100% Landfill Diverted</span>
            </div>
          </div>

          {batch.discrepancyNotes && (
            <div className="text-[11px] text-slate-500 bg-emerald-50/60 p-2.5 rounded border border-emerald-200/60">
              <strong>Scale Variance: </strong> {batch.discrepancyNotes}
            </div>
          )}
        </div>
      )}

      {/* 5. GENERATOR VIEW: When batch was REJECTED */}
      {batch.status === 'REJECTED' && (
        <div className="bg-white p-6 rounded-xl border border-rose-300 bg-rose-50/30 shadow-2xs space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
              <XCircle className="w-5 h-5 text-rose-600" />
              <span>Shipment Rejected by Recipient Facility</span>
            </div>
            <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-900 border border-rose-200">
              {batch.rejectionStage === 'POST_INSPECTION' ? 'Post-Delivery Dock Inspection' : 'Offer Stage Decline'}
            </span>
          </div>

          <div className="p-4 rounded-lg bg-white border border-rose-200 space-y-2 text-xs">
            <div>
              <span className="text-[11px] text-slate-500 font-semibold uppercase block font-mono">Mandatory Rejection Reason</span>
              <p className="font-bold text-rose-950 text-sm mt-0.5">{batch.rejectionReason || 'Inspection criteria not met'}</p>
            </div>
            {batch.correctiveFeedback && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] text-slate-500 font-semibold uppercase block font-mono">Recipient Corrective Feedback</span>
                <p className="text-slate-700 mt-0.5 leading-relaxed">{batch.correctiveFeedback}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <p className="text-[11px] text-slate-500">
              Readiness checklist has been automatically reset for affected items. Re-sort the batch to prepare a new compliant offer.
            </p>
            {onReopenRejected && (
              <button
                type="button"
                onClick={() => onReopenRejected(batch.id)}
                disabled={isProcessing}
                className="flex items-center gap-2 px-4 py-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 shadow-xs active:scale-98"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Correct Preparation & Reopen Batch</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 6. RECIPIENT & ADMIN VIEW: Record Final Outcome (Visible for non-generator roles when HANDED OVER or SCHEDULED) */}
      {!isGenerator && (batch.status === 'HANDED OVER' || batch.status === 'SCHEDULED' || batch.status === 'PICKED UP') && (
        <form
          onSubmit={handleOutcomeSubmit}
          className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-4"
        >
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileText className="w-4 h-4 text-emerald-800" />
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Record Recipient Intake Outcome</h3>
          </div>

          {outcomeError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{outcomeError}</span>
            </div>
          )}

          {/* Outcome Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Intake Verdict at Recipient Gate / Weighbridge
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOutcome('RECEIVED')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                  outcome === 'RECEIVED'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-950 ring-2 ring-emerald-600/20 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="text-xs font-bold">RECEIVED (Approved)</div>
                  <div className="text-[11px] text-slate-500">
                    Material met specifications and entered recovery pipeline
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setOutcome('REJECTED')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                  outcome === 'REJECTED'
                    ? 'bg-rose-50 border-rose-600 text-rose-950 ring-2 ring-rose-600/20 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <div>
                  <div className="text-xs font-bold">REJECTED (Declined)</div>
                  <div className="text-[11px] text-slate-500">
                    Failed inspection. Requires corrective re-sorting
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Inspector / Officer Name
              </label>
              <input
                type="text"
                value={recordedBy}
                onChange={(e) => setRecordedBy(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                disabled={isProcessing}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Weighbridge / Gatepass Reference Slip #
              </label>
              <input
                type="text"
                value={evidenceReference}
                onChange={(e) => setEvidenceReference(e.target.value)}
                placeholder="e.g. WB-PUN-2026-9481"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-700"
                disabled={isProcessing}
              />
            </div>
          </div>

          {/* If REJECTED: Mandatory reason and corrective feedback */}
          {outcome === 'REJECTED' && (
            <div className="p-4 bg-rose-50/70 rounded-xl border border-rose-200 space-y-3">
              <div>
                <label className="block text-xs font-bold text-rose-900 mb-1">
                  Mandatory Rejection Reason <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Moisture content 24% (exceeded 15% limit); oil-soaked pizza box residue"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-rose-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  disabled={isProcessing}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-rose-900 mb-1">
                  Corrective Feedback for Waste Generator
                </label>
                <textarea
                  value={correctiveFeedback}
                  onChange={(e) => setCorrectiveFeedback(e.target.value)}
                  rows={2}
                  placeholder="e.g. 1. Re-sort to eliminate greasy boxes. 2. Store indoors until dry. 3. Bale securely."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-rose-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  disabled={isProcessing}
                />
              </div>
            </div>
          )}

          {/* Outcome disclaimer */}
          <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
            <strong>Audit Note: </strong>
            A recorded Received outcome represents an operational gate transaction and preserves full chain-of-custody integrity.
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isProcessing}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold text-white transition-all cursor-pointer shadow-xs active:scale-98 ${
                outcome === 'RECEIVED'
                  ? 'bg-emerald-900 hover:bg-emerald-800'
                  : 'bg-rose-700 hover:bg-rose-800'
              }`}
            >
              {outcome === 'RECEIVED' ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isProcessing ? 'Recording...' : 'Record Confirmed Intake'}</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  <span>{isProcessing ? 'Recording...' : 'Record Batch Rejection'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
