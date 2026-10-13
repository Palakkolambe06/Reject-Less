import React, { useState, useEffect } from 'react';
import { Recipient } from '../types/recipient';
import { WasteBatch } from '../types/batch';
import { BatchMatchingReport } from '../types/matching';
import { DemoUser } from '../types/user';
import { recipientService } from '../services/recipientService';
import { batchService } from '../services/batchService';
import { matchingService } from '../services/matchingService';
import { offerService } from '../services/offerService';
import { RecipientCard } from '../components/recipients/RecipientCard';
import { MatchExplanation } from '../components/recipients/MatchExplanation';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  AlertCircle,
  X,
} from 'lucide-react';
import { Button } from '../components/ui/Button';

interface RecipientsPageProps {
  initialBatchId?: string;
  activeUser?: DemoUser;
  onNavigate: (path: string) => void;
  onRecipientMatched: (batchId: string, recipientId: string) => void;
}

export const RecipientsPage: React.FC<RecipientsPageProps> = ({
  initialBatchId,
  activeUser,
  onNavigate,
}) => {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [batches, setBatches] = useState<WasteBatch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>(initialBatchId || '');
  const [selectedBatch, setSelectedBatch] = useState<WasteBatch | null>(null);
  const [matchingReport, setMatchingReport] = useState<BatchMatchingReport | null>(null);
  const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(null);
  const [materialFilter, setMaterialFilter] = useState<string>('ALL');

  // Submit Offer Modal
  const [targetRecipient, setTargetRecipient] = useState<Recipient | null>(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerNotes, setOfferNotes] = useState('');
  const [offerFeedback, setOfferFeedback] = useState<string | null>(null);

  useEffect(() => {
    recipientService.getAll().then(setRecipients);
    batchService.getAll().then((all) => {
      setBatches(all);
      if (all.length > 0) {
        const found = initialBatchId
          ? all.find((b) => b.id === initialBatchId)
          : all.find((b) => b.isReadyForMatching && b.status === 'READY') || all[0];
        if (found) {
          setSelectedBatchId(found.id);
          setSelectedBatch(found);
        }
      }
    });
  }, [initialBatchId]);

  useEffect(() => {
    if (selectedBatch && recipients.length > 0) {
      const report = matchingService.evaluateAll(selectedBatch, recipients);
      setMatchingReport(report);
      if (selectedBatch.matchedRecipientId) {
        setSelectedRecipientId(selectedBatch.matchedRecipientId);
      }
    } else {
      setMatchingReport(null);
    }
  }, [selectedBatch, recipients]);

  const handleBatchSelect = (id: string) => {
    setSelectedBatchId(id);
    const b = batches.find((x) => x.id === id) || null;
    setSelectedBatch(b);
    setOfferFeedback(null);
  };

  const handleOpenOfferModal = (recipient: Recipient) => {
    setTargetRecipient(recipient);
    setOfferNotes('');
    setIsOfferModalOpen(true);
    setOfferFeedback(null);
  };

  const handleConfirmSubmitOffer = async () => {
    if (!selectedBatch || !targetRecipient) return;
    if (selectedBatch.status !== 'READY') {
      setOfferFeedback(
        `Cannot submit offer: Batch status is '${selectedBatch.status}'. Must be 100% READY with checklist verified.`
      );
      return;
    }

    const res = await offerService.submitOffer(
      selectedBatch,
      targetRecipient,
      offerNotes,
      activeUser ? activeUser.name : 'Generator'
    );

    if (res.success && res.offer) {
      setOfferFeedback(
        `Offer ${res.offer.id} successfully submitted to ${targetRecipient.name}. Awaiting recipient response.`
      );
      setIsOfferModalOpen(false);

      // Reload batches
      const updatedBatches = await batchService.getAll();
      setBatches(updatedBatches);
      const b = updatedBatches.find((x) => x.id === selectedBatch.id) || null;
      setSelectedBatch(b);
    } else {
      setOfferFeedback(res.error || 'Failed to submit offer.');
    }
  };

  const filteredRecipients = recipients.filter((r) => {
    if (materialFilter === 'ALL') return true;
    return r.acceptedMaterials.includes(materialFilter as any);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Recipient Directory & Explainable Matching
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Rule-based deterministic matching engine. Evaluates material, capacity, packaging, cleanliness, and service area.
          </p>
        </div>

        {/* Batch Evaluator Switcher */}
        {batches.length > 0 && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-semibold text-slate-600 shrink-0">Matching Batch:</span>
            <select
              value={selectedBatchId}
              onChange={(e) => handleBatchSelect(e.target.value)}
              className="px-3 py-2 text-xs font-mono font-bold rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            >
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.id} — {b.materialCategory} ({b.quantity} {b.unit}) [{b.status}]
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {offerFeedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs font-semibold rounded-xl flex items-center justify-between shadow-2xs">
          <span>{offerFeedback}</span>
          <button onClick={() => setOfferFeedback(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Batch Matching View with Rule Engine Evaluations */}
      {selectedBatch && matchingReport ? (
        <div className="space-y-6">
          {/* Active Batch Summary Card */}
          <div className="p-5 rounded-xl bg-slate-900 text-white border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs text-emerald-400 font-bold">{selectedBatch.id}</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-xs text-slate-300">{selectedBatch.generatorName}</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-xs font-mono text-slate-400">
                  {selectedBatch.pickupLocation.city}
                </span>
              </div>
              <div className="text-sm font-bold flex items-center gap-3">
                <span>
                  {selectedBatch.quantity} {selectedBatch.unit} of {selectedBatch.materialCategory}
                </span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Format: {selectedBatch.packagingType}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] font-mono">Readiness State:</span>
                <span
                  className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                    selectedBatch.isReadyForMatching
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                      : 'bg-amber-950 text-amber-300 border border-amber-700'
                  }`}
                >
                  {selectedBatch.isReadyForMatching ? '100% Certified' : 'Incomplete'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-mono">Lifecycle Status:</span>
                <span className="font-mono font-bold text-white text-[11px]">
                  {selectedBatch.status}
                </span>
              </div>
            </div>
          </div>

          {/* If batch is in OFFERED state */}
          {selectedBatch.status === 'OFFERED' && (
            <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-sky-950 text-xs flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-700 shrink-0" />
                <span>
                  <strong>Offer Submitted ({selectedBatch.activeOfferId}): </strong> Currently awaiting recipient review.
                  Switch to the Recipient Workspace via the top switcher to evaluate and accept this offer.
                </span>
              </div>
            </div>
          )}

          {/* If batch is NOT ready for matching */}
          {!selectedBatch.isReadyForMatching && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  <strong>Readiness Gate Incomplete: </strong> Complete all 6 physical quality verification items on the Readiness page before submitting an offer.
                </span>
              </div>
              <button
                onClick={() => onNavigate(`/readiness?batchId=${selectedBatch.id}`)}
                className="px-3.5 py-1.5 bg-amber-800 hover:bg-amber-900 text-white font-bold rounded-lg text-xs cursor-pointer shrink-0"
              >
                Go to Readiness
              </button>
            </div>
          )}

          {/* Matching Results: Eligible Recyclers */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Eligible Recipient Facilities ({matchingReport.eligibleRecipients.length})
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {matchingReport.eligibleRecipients.length} of {recipients.length} matched all criteria
              </span>
            </div>

            {matchingReport.eligibleRecipients.length === 0 ? (
              <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl text-center space-y-2">
                <div className="text-xs font-bold text-amber-950">
                  No Eligible Recipients Found for Current Batch Parameters
                </div>
                <p className="text-xs text-amber-800 max-w-lg mx-auto">
                  None of the registered demo facilities satisfy all criteria simultaneously. Check the ineligibility explanations below to see what failed (e.g. minimum quantity, packaging format, or material stream).
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {matchingReport.eligibleRecipients.map((match) => (
                  <div key={match.recipient.id} className="relative">
                    <MatchExplanation
                      matchResult={match}
                      isSelected={selectedRecipientId === match.recipient.id}
                      onSelectRecipient={
                        selectedBatch.status === 'READY'
                          ? () => handleOpenOfferModal(match.recipient)
                          : undefined
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Matching Results: Ineligible Recyclers with Full Explanations */}
          {matchingReport.ineligibleRecipients.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-slate-400" />
                  <h3 className="text-sm font-bold text-slate-700">
                    Excluded Facilities ({matchingReport.ineligibleRecipients.length})
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  Did not meet 1 or more mandatory criteria
                </span>
              </div>
              <div className="space-y-4">
                {matchingReport.ineligibleRecipients.map((match) => (
                  <MatchExplanation key={match.recipient.id} matchResult={match} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* General Directory View */
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Filter by Material:</span>
            <select
              value={materialFilter}
              onChange={(e) => setMaterialFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            >
              <option value="ALL">All Materials</option>
              <option value="Cardboard">Cardboard</option>
              <option value="Paper">Paper</option>
              <option value="Plastic">Plastic</option>
              <option value="Glass">Glass</option>
              <option value="Metal">Metal</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRecipients.map((rec) => (
              <RecipientCard key={rec.id} recipient={rec} />
            ))}
          </div>
        </div>
      )}

      {/* SUBMIT OFFER MODAL */}
      {isOfferModalOpen && targetRecipient && selectedBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-800" />
                <span>Submit Offer to Recipient</span>
              </h3>
              <button
                onClick={() => setIsOfferModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
                aria-label="Close offer modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Sending official offer for{' '}
              <strong>
                {selectedBatch.quantity} {selectedBatch.unit} of {selectedBatch.materialCategory}
              </strong>{' '}
              to <strong>{targetRecipient.name}</strong>.
            </p>
            <div className="p-3.5 bg-slate-50 rounded-lg text-xs space-y-1 border border-slate-100">
              <div>
                Packaging: <strong>{selectedBatch.packagingType}</strong>
              </div>
              <div>
                Cleanliness: <strong>{selectedBatch.contaminationLevel}</strong>
              </div>
              <div>
                Pickup Bay: {selectedBatch.pickupLocation.address}, {selectedBatch.pickupLocation.city}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Optional Generator Note for Recipient
              </label>
              <textarea
                value={offerNotes}
                onChange={(e) => setOfferNotes(e.target.value)}
                rows={2}
                placeholder="e.g. Bales banded with PET strapping; forklift access available at Gate 2."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsOfferModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleConfirmSubmitOffer}
                icon={<Send className="w-3.5 h-3.5" />}
              >
                Submit Offer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
