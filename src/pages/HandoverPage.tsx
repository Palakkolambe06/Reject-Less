import React, { useState, useEffect } from 'react';
import { WasteBatch } from '../types/batch';
import { Recipient } from '../types/recipient';
import { HandoverScheduleData, HandoverOutcomeData } from '../types/handover';
import { DemoUser } from '../types/user';
import { batchService } from '../services/batchService';
import { recipientService } from '../services/recipientService';
import { handoverService } from '../services/handoverService';
import { HandoverForm } from '../components/handovers/HandoverForm';
import { BatchTimeline } from '../components/handovers/BatchTimeline';
import { PackageCheck } from 'lucide-react';

interface HandoverPageProps {
  initialBatchId?: string;
  activeUser?: DemoUser;
  onNavigate: (path: string) => void;
}

export const HandoverPage: React.FC<HandoverPageProps> = ({
  initialBatchId,
  activeUser,
  onNavigate,
}) => {
  const [batches, setBatches] = useState<WasteBatch[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>(initialBatchId || '');
  const [currentBatch, setCurrentBatch] = useState<WasteBatch | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    recipientService.getAll().then(setRecipients);
    batchService.getAll().then((all) => {
      setBatches(all);
      if (all.length > 0) {
        const found = initialBatchId
          ? all.find((b) => b.id === initialBatchId)
          : all.find(
              (b) =>
                b.status === 'SCHEDULED' ||
                b.status === 'ACCEPTED' ||
                b.status === 'MATCHED' ||
                b.status === 'READY' ||
                b.status === 'REJECTED'
            ) || all[0];
        if (found) {
          setSelectedBatchId(found.id);
          setCurrentBatch(found);
        }
      }
    });
  }, [initialBatchId]);

  const handleBatchSelect = (id: string) => {
    setSelectedBatchId(id);
    const b = batches.find((x) => x.id === id) || null;
    setCurrentBatch(b);
    setStatusMessage(null);
  };

  const handleSchedule = async (scheduleData: HandoverScheduleData) => {
    if (!currentBatch) return;
    setIsProcessing(true);
    setStatusMessage(null);
    try {
      const res = handoverService.scheduleHandover(
        currentBatch,
        scheduleData,
        activeUser?.name || 'Dispatcher'
      );
      if (res.success && res.batch) {
        await batchService.updateBatch(res.batch);
        setCurrentBatch(res.batch);
        setBatches((prev) => prev.map((b) => (b.id === res.batch!.id ? res.batch! : b)));
        setStatusMessage('Handover successfully scheduled and logged in timeline.');
      } else {
        setStatusMessage(res.error || 'Failed to schedule handover.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkHandedOver = async () => {
    if (!currentBatch) return;
    setIsProcessing(true);
    setStatusMessage(null);
    try {
      if (activeUser?.role === 'generator') {
        const res = handoverService.confirmGeneratorHandover(currentBatch, activeUser);
        if (res.success && res.batch) {
          // If scheduled, mark in transit / picked up
          const pickupRes = handoverService.markPickedUp(
            res.batch,
            activeUser.name + ' (Generator Custody Release)'
          );
          const finalBatch = pickupRes.batch || res.batch;
          await batchService.updateBatch(finalBatch);
          setCurrentBatch(finalBatch);
          setBatches((prev) => prev.map((b) => (b.id === finalBatch.id ? finalBatch : b)));
          setStatusMessage('Physical handover confirmed. Waste is now in transit to the recipient.');
        }
      } else {
        const res = handoverService.markHandedOver(
          currentBatch,
          activeUser?.name || 'Driver'
        );
        if (res.success && res.batch) {
          await batchService.updateBatch(res.batch);
          setCurrentBatch(res.batch);
          setBatches((prev) => prev.map((b) => (b.id === res.batch!.id ? res.batch! : b)));
          setStatusMessage('Batch marked in transit / staged at recipient facility.');
        }
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRecordOutcome = async (outcomeData: HandoverOutcomeData) => {
    if (!currentBatch) return;
    setIsProcessing(true);
    setStatusMessage(null);
    try {
      const res = handoverService.recordOutcome(
        currentBatch,
        outcomeData,
        activeUser?.name || 'Intake Officer'
      );
      if (res.success && res.batch) {
        await batchService.updateBatch(res.batch);
        setCurrentBatch(res.batch);
        setBatches((prev) => prev.map((b) => (b.id === res.batch!.id ? res.batch! : b)));
        setStatusMessage(
          outcomeData.outcome === 'RECEIVED'
            ? 'Intake recorded: Batch successfully received and recovered.'
            : 'Rejection recorded with mandatory reason and corrective feedback.'
        );
      } else {
        setStatusMessage(res.error || 'Failed to record outcome.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReopenRejected = async (batchId: string) => {
    setIsProcessing(true);
    try {
      const updated = await batchService.reopenRejectedBatch(
        batchId,
        activeUser?.name || 'Generator'
      );
      if (updated) {
        setCurrentBatch(updated);
        setBatches((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
        setStatusMessage(
          'Batch reopened for corrective sorting. Redirecting to Readiness Quality Gate...'
        );
        setTimeout(() => {
          onNavigate(`/readiness?batchId=${batchId}`);
        }, 800);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Handover Dispatch & Intake Outcomes
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Log dispatch schedule, vehicle transport, and recipient gate inspection outcomes
          </p>
        </div>

        {/* Batch Selector */}
        {batches.length > 0 && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-semibold text-slate-600 shrink-0">Inspecting Batch:</span>
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

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs font-medium shadow-2xs">
          {statusMessage}
        </div>
      )}

      {currentBatch ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left 2 Cols: Handover Form and Outcome Management */}
          <div className="lg:col-span-2 space-y-6">
            {/* Batch Status Header */}
            <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-slate-400 block">
                  {currentBatch.id} · {currentBatch.generatorName}
                </span>
                <div className="text-base font-bold text-slate-900 mt-0.5">
                  {currentBatch.quantity} {currentBatch.unit} of {currentBatch.materialCategory}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block font-mono">Current Status</span>
                <span className="font-mono font-bold text-sm text-emerald-900">
                  {currentBatch.status}
                </span>
              </div>
            </div>

            {/* Handover Form */}
            <HandoverForm
              batch={currentBatch}
              recipients={recipients}
              activeUser={activeUser}
              onSchedule={handleSchedule}
              onMarkHandedOver={handleMarkHandedOver}
              onRecordOutcome={handleRecordOutcome}
              onReopenRejected={handleReopenRejected}
              onNavigate={onNavigate}
              isProcessing={isProcessing}
            />
          </div>

          {/* Right Col: Timeline */}
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
              <div className="border-b border-slate-100 pb-2.5">
                <h3 className="text-sm font-bold text-slate-900">Chain of Custody Timeline</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Audit events recorded at each stage
                </p>
              </div>
              <BatchTimeline events={currentBatch.statusHistory} />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-3">
          <PackageCheck className="w-10 h-10 mx-auto text-slate-400" />
          <h3 className="text-sm font-bold text-slate-800">No Batches Available</h3>
          <p className="text-xs text-slate-500">
            Register or load a waste batch to manage handover workflows.
          </p>
        </div>
      )}
    </div>
  );
};
