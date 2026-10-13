import React from 'react';
import { WasteBatch, BatchStatus } from '../../types/batch';
import { Recipient } from '../../types/recipient';
import { formatDateTime, getRelativeTime } from '../../utils/dateFormat';
import { BatchTimeline } from '../handovers/BatchTimeline';
import {
  Building2,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  MapPin,
  ShieldCheck,
  FileText,
  Trash2,
  Check,
  History,
} from 'lucide-react';

interface BatchDetailsProps {
  batch: WasteBatch;
  matchedRecipient?: Recipient | null;
  onNavigateToReadiness: () => void;
  onNavigateToMatching: () => void;
  onNavigateToHandover: () => void;
  onDeleteBatch?: () => void;
}

export const BatchDetails: React.FC<BatchDetailsProps> = ({
  batch,
  matchedRecipient,
  onNavigateToReadiness,
  onNavigateToMatching,
  onNavigateToHandover,
  onDeleteBatch,
}) => {
  // Define canonical lifecycle progression steps for the visual stepper
  const lifecyclePipeline: {
    key: string;
    label: string;
    statuses: BatchStatus[];
    description: string;
  }[] = [
    {
      key: 'draft',
      label: 'Draft',
      statuses: ['DRAFT'],
      description: 'Registration & initial parameters',
    },
    {
      key: 'preparation',
      label: 'Preparation',
      statuses: ['PREPARATION'],
      description: 'AI triage & sorting',
    },
    {
      key: 'ready',
      label: 'Ready',
      statuses: ['READY'],
      description: 'Readiness checklist certified',
    },
    {
      key: 'offered',
      label: 'Offered',
      statuses: ['OFFERED', 'MATCHED'],
      description: 'Offer sent to recycler',
    },
    {
      key: 'accepted',
      label: 'Accepted',
      statuses: ['ACCEPTED'],
      description: 'Accepted by recipient',
    },
    {
      key: 'scheduled',
      label: 'Scheduled',
      statuses: ['SCHEDULED'],
      description: 'Pickup window reserved',
    },
    {
      key: 'transit',
      label: 'In Transit',
      statuses: ['PICKED UP', 'HANDED OVER'],
      description: 'Dispatch & physical handover',
    },
    {
      key: 'final',
      label: batch.status === 'REJECTED' ? 'Rejected' : 'Received',
      statuses: ['RECEIVED', 'REJECTED'],
      description:
        batch.status === 'REJECTED'
          ? 'Intake rejected with feedback'
          : 'Verified weighbridge intake',
    },
  ];

  // Helper to determine stage state
  const getStageState = (stageStatuses: BatchStatus[]) => {
    const isCurrent = stageStatuses.includes(batch.status);
    if (isCurrent) return 'CURRENT';

    const statusOrder: BatchStatus[] = [
      'DRAFT',
      'PREPARATION',
      'READY',
      'OFFERED',
      'ACCEPTED',
      'SCHEDULED',
      'PICKED UP',
      'HANDED OVER',
      'RECEIVED',
    ];
    const currentBatchIndex = statusOrder.indexOf(batch.status);
    const stageMaxIndex = Math.max(
      ...stageStatuses.map((s) => statusOrder.indexOf(s)).filter((idx) => idx !== -1),
      -1
    );

    if (batch.status === 'REJECTED') {
      if (stageStatuses.includes('REJECTED')) return 'ALERT';
    }

    if (currentBatchIndex > stageMaxIndex && stageMaxIndex !== -1) {
      return 'COMPLETED';
    }
    return 'PENDING';
  };

  return (
    <div className="space-y-6">
      {/* Header Profile */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
              {batch.id}
            </span>
            <span className="text-xs text-slate-500 font-medium">{batch.generatorName}</span>
            <span aria-hidden="true" className="text-slate-300">
              ·
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Created {formatDateTime(batch.createdAt)}
            </span>
            {batch.updatedAt && batch.updatedAt !== batch.createdAt && (
              <>
                <span aria-hidden="true" className="text-slate-300">
                  ·
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Updated {getRelativeTime(batch.updatedAt)}
                </span>
              </>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2 flex-wrap">
            <span>
              {batch.quantity} {batch.unit} of {batch.materialCategory}
            </span>
            {batch.isHumanConfirmed && (
              <span className="text-[11px] font-mono font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/90">
                Human Verified
              </span>
            )}
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              {batch.pickupLocation.address}, {batch.pickupLocation.city} -{' '}
              {batch.pickupLocation.pincode}
            </span>
          </div>
        </div>

        {/* Status & Delete */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              Lifecycle State
            </div>
            <div
              className={`font-mono font-bold text-xs sm:text-sm px-3 py-1 rounded-lg border inline-block mt-0.5 ${
                batch.status === 'RECEIVED'
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                  : batch.status === 'REJECTED'
                  ? 'border-rose-300 bg-rose-50 text-rose-800'
                  : batch.status === 'SCHEDULED' ||
                    batch.status === 'PICKED UP' ||
                    batch.status === 'HANDED OVER'
                  ? 'border-indigo-300 bg-indigo-50 text-indigo-900'
                  : batch.status === 'READY' ||
                    batch.status === 'ACCEPTED' ||
                    batch.status === 'OFFERED'
                  ? 'border-teal-300 bg-teal-50 text-teal-900'
                  : 'border-slate-300 bg-slate-100 text-slate-800'
              }`}
            >
              {batch.status}
            </div>
          </div>
          {batch.status === 'DRAFT' && onDeleteBatch && (
            <button
              onClick={onDeleteBatch}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="Delete draft batch"
              aria-label="Delete draft batch"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Visual Lifecycle Progression Pipeline Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-700" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
              Lifecycle Stage Pipeline
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            {batch.statusHistory?.length || 0} status change log entries recorded
          </span>
        </div>

        {/* Stepper Pipeline */}
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[640px] flex items-center justify-between relative">
            {lifecyclePipeline.map((step, idx) => {
              const state = getStageState(step.statuses);
              const isLast = idx === lifecyclePipeline.length - 1;
              return (
                <div key={step.key} className="flex-1 flex items-center relative">
                  {/* Step Node */}
                  <div className="flex flex-col items-center relative z-10 w-full group">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all shadow-2xs ${
                        state === 'CURRENT'
                          ? 'bg-emerald-800 text-white ring-4 ring-emerald-100 scale-105'
                          : state === 'COMPLETED'
                          ? 'bg-emerald-600 text-white'
                          : state === 'ALERT'
                          ? 'bg-rose-600 text-white ring-4 ring-rose-100'
                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}
                      title={`${step.label}: ${step.description}`}
                    >
                      {state === 'COMPLETED' ? (
                        <Check className="w-4 h-4" />
                      ) : state === 'ALERT' ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </div>
                    <span
                      className={`text-[11px] font-medium mt-1.5 text-center leading-tight ${
                        state === 'CURRENT'
                          ? 'text-emerald-900 font-bold'
                          : state === 'COMPLETED'
                          ? 'text-emerald-800 font-semibold'
                          : state === 'ALERT'
                          ? 'text-rose-700 font-bold'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {/* Connecting Bar */}
                  {!isLast && (
                    <div
                      className={`h-0.5 w-full -ml-[50%] -mr-[50%] absolute top-4 left-1/2 -z-0 transition-colors ${
                        state === 'COMPLETED'
                          ? 'bg-emerald-500'
                          : state === 'CURRENT'
                          ? 'bg-emerald-300'
                          : 'bg-slate-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid: Details, Physical Parameters & Lifecycle Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Image, AI Triage, Parameters, and Quick Action Gates */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Action Navigation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Stage 1: Readiness */}
            <button
              onClick={onNavigateToReadiness}
              className="bg-white p-4 rounded-xl border border-slate-200/90 text-left hover:border-emerald-600 hover:shadow-xs transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-slate-700 group-hover:text-emerald-800">
                  1. Readiness Gate
                </span>
                {batch.isReadyForMatching ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Clock className="w-4 h-4 text-amber-500" />
                )}
              </div>
              <div className="text-xs font-semibold text-slate-900">
                {batch.isReadyForMatching ? '100% Certified' : 'Checklist Incomplete'}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {batch.isReadyForMatching
                  ? 'All 6 quality requirements verified'
                  : 'Review cleanliness & packaging'}
              </p>
            </button>

            {/* Stage 2: Recipient Matching */}
            <button
              onClick={onNavigateToMatching}
              className="bg-white p-4 rounded-xl border border-slate-200/90 text-left hover:border-teal-600 hover:shadow-xs transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-slate-700 group-hover:text-teal-800">
                  2. Recipient Match
                </span>
                <Building2 className="w-4 h-4 text-teal-600" />
              </div>
              <div className="text-xs font-semibold text-slate-900 truncate">
                {matchedRecipient ? matchedRecipient.name : 'Run Rules Engine'}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 truncate">
                {matchedRecipient
                  ? `${matchedRecipient.facilityType}`
                  : 'Find eligible Pune recyclers'}
              </p>
            </button>

            {/* Stage 3: Handover & Outcome */}
            <button
              onClick={onNavigateToHandover}
              className="bg-white p-4 rounded-xl border border-slate-200/90 text-left hover:border-indigo-600 hover:shadow-xs transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-slate-700 group-hover:text-indigo-800">
                  3. Handover Tracking
                </span>
                <Truck className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-xs font-semibold text-slate-900">
                {batch.status === 'RECEIVED'
                  ? 'Received & Logged'
                  : batch.status === 'REJECTED'
                  ? 'Rejected (Feedback)'
                  : batch.status === 'SCHEDULED'
                  ? 'Pickup Scheduled'
                  : batch.status === 'PICKED UP' || batch.status === 'HANDED OVER'
                  ? 'In Transit'
                  : 'Awaiting Schedule'}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {batch.evidenceReference
                  ? `Slip: ${batch.evidenceReference}`
                  : 'Schedule pickup or track intake'}
              </p>
            </button>
          </div>

          {/* Handover & Chain of Custody Summary Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Handover & Chain of Custody Verification
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                {batch.scheduledHandoverDate ? 'Logistics Active' : 'Unscheduled'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {/* Generator Handover */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block font-mono">
                  Generator Handover
                </span>
                <div className="flex items-center gap-1.5">
                  {batch.generatorHandoverConfirmed ? (
                    <span className="inline-flex items-center gap-1 text-emerald-800 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Confirmed
                    </span>
                  ) : (
                    <span className="text-slate-500 font-medium">Pending Sign-off</span>
                  )}
                </div>
                {batch.generatorHandoverConfirmedAt && (
                  <p className="text-[10px] text-slate-400 font-mono">
                    {formatDateTime(batch.generatorHandoverConfirmedAt)}
                  </p>
                )}
              </div>

              {/* Logistics & Transit */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block font-mono">
                  Logistics & Pickup
                </span>
                <div className="font-semibold text-slate-800">
                  {batch.pickupTimestamp ? (
                    <span className="text-teal-800 font-medium">
                      Picked Up: {formatDateTime(batch.pickupTimestamp)}
                    </span>
                  ) : batch.scheduledHandoverDate ? (
                    `Scheduled: ${formatDateTime(batch.scheduledHandoverDate)}`
                  ) : (
                    'Not scheduled yet'
                  )}
                </div>
                {batch.assignedOperatorName && (
                  <p className="text-[10px] text-slate-500">
                    Operator: {batch.assignedOperatorName}
                  </p>
                )}
              </div>

              {/* Recipient Intake */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block font-mono">
                  Recipient Intake
                </span>
                <div className="font-semibold">
                  {batch.recipientReceivedConfirmed ? (
                    <span className="text-emerald-800 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Verified Received
                    </span>
                  ) : batch.status === 'REJECTED' ? (
                    <span className="text-rose-700 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Intake Rejected
                    </span>
                  ) : (
                    <span className="text-slate-500">Pending Dock Receipt</span>
                  )}
                </div>
                {batch.recipientReceivedConfirmedAt && (
                  <p className="text-[10px] text-slate-400 font-mono">
                    {formatDateTime(batch.recipientReceivedConfirmedAt)}
                  </p>
                )}
              </div>
            </div>

            {/* Evidence & Weighbridge Ref */}
            {batch.evidenceReference && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-teal-50/70 rounded-lg border border-teal-200/90 text-xs text-teal-950">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-700 shrink-0" />
                  <div>
                    <span className="font-bold">Weighbridge / Receipt Evidence: </span>
                    <span className="font-mono font-semibold">{batch.evidenceReference}</span>
                  </div>
                </div>
                {batch.actualReceivedQuantity && (
                  <div className="text-[11px] font-mono">
                    Logged: <strong>{batch.actualReceivedQuantity} kg</strong>
                    {batch.discrepancyKg && batch.discrepancyKg !== 0 ? (
                      <span className="text-amber-800 ml-1">
                        (Variance: {batch.discrepancyKg > 0 ? `+${batch.discrepancyKg}` : batch.discrepancyKg} kg)
                      </span>
                    ) : null}
                  </div>
                )}
              </div>
            )}

            {/* Rejection Feedback if Rejected */}
            {batch.status === 'REJECTED' && batch.rejectionReason && (
              <div className="p-3.5 bg-rose-50/80 rounded-lg border border-rose-200 text-xs text-rose-900 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-rose-800">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Rejection Feedback: {batch.rejectionReason}</span>
                </div>
                {batch.correctiveFeedback && (
                  <p className="text-rose-800 leading-relaxed">
                    <strong>Corrective Guidance: </strong>
                    {batch.correctiveFeedback}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Photo and AI Identification Metadata */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5 tracking-tight">
              Visual Evidence & Computer Vision Triage
            </h3>

            {batch.photoUrl ? (
              <div className="rounded-xl overflow-hidden bg-slate-900/5 border border-slate-200 aspect-video sm:aspect-21/9 flex items-center justify-center">
                <img
                  src={batch.photoUrl}
                  alt={batch.materialCategory}
                  className="w-full h-full object-contain max-h-72"
                />
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
                No visual photograph uploaded for this batch.
              </div>
            )}

            {/* AI Record Details */}
            {batch.aiPrediction && (
              <div className="p-4 rounded-xl bg-slate-900 text-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-teal-400 font-bold">
                    <Sparkles className="w-4 h-4" />
                    <span>AI Model Suggestion Record</span>
                  </div>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                    {batch.aiPrediction.isSimulation ? 'DEMO SIMULATION' : 'REAL OPEN-WEIGHT'}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Predicted Category:</span>
                    <strong className="text-white">{batch.aiPrediction.predictedCategory}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Confidence:</span>
                    <strong className="text-teal-400 tabular-nums">
                      {Math.round(batch.aiPrediction.confidence * 100)}%
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Model ID:</span>
                    <span className="text-slate-300 truncate block">
                      {batch.aiPrediction.modelIdentifier}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                  {batch.aiPrediction.disclaimer}
                </p>
              </div>
            )}
          </div>

          {/* Physical Specifications */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5 tracking-tight">
              Physical Preparation Parameters
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-[11px] text-slate-500 block">Packaging Format</span>
                <span className="font-semibold text-slate-800">{batch.packagingType}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Cleanliness State</span>
                <span className="font-semibold text-slate-800">{batch.contaminationLevel}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Quantity</span>
                <span className="font-mono font-bold text-slate-800 tabular-nums">
                  {batch.quantity} {batch.unit}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Weather Protection</span>
                <span className="font-semibold text-slate-800">
                  {batch.readinessChecklist?.isDryAndProtected ? 'Dry & Sheltered' : 'Unsheltered'}
                </span>
              </div>
            </div>
            {batch.description && (
              <div className="pt-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100">
                <strong>Generator Notes: </strong> {batch.description}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Visual Lifecycle Timeline Section */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-700" />
                  <span>Lifecycle Timeline</span>
                </h3>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {batch.statusHistory?.length || 0} Events
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-snug">
                Audit change log tracking every transition from DRAFT to final outcome with timestamps and verification actors.
              </p>
            </div>
            <BatchTimeline events={batch.statusHistory} batch={batch} />
          </div>
        </div>
      </div>
    </div>
  );
};
