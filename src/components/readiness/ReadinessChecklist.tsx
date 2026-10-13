import React, { useState } from 'react';
import { ReadinessChecklist as IReadinessChecklist, WasteBatch } from '../../types/batch';
import {
  readinessService,
  CHECKLIST_DEFINITIONS,
  ReadinessEvaluation,
} from '../../services/readinessService';
import {
  CheckCircle2,
  AlertCircle,
  Save,
} from 'lucide-react';

interface ReadinessChecklistProps {
  batch: WasteBatch;
  onSaveChecklist: (updatedChecklist: IReadinessChecklist) => Promise<void>;
  isSaving?: boolean;
}

export const ReadinessChecklist: React.FC<ReadinessChecklistProps> = ({
  batch,
  onSaveChecklist,
  isSaving = false,
}) => {
  const [checklist, setChecklist] = useState<IReadinessChecklist>({
    ...batch.readinessChecklist,
  });
  const [notes, setNotes] = useState(batch.readinessChecklist?.notes || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Dynamic evaluation using readinessService
  const evaluation: ReadinessEvaluation = readinessService.evaluate(checklist);

  const handleToggle = (key: keyof Omit<IReadinessChecklist, 'notes' | 'lastEvaluatedAt'>) => {
    setChecklist((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setSavedSuccess(false);
  };

  const handleSave = async () => {
    setSavedSuccess(false);
    const updated: IReadinessChecklist = {
      ...checklist,
      notes: notes.trim() || undefined,
      lastEvaluatedAt: new Date().toISOString(),
    };
    await onSaveChecklist(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 border-b border-slate-200/90 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-200/70 text-slate-800">
              {batch.id}
            </span>
            <span aria-hidden="true" className="text-slate-300">
              ·
            </span>
            <span className="text-xs font-semibold text-slate-700">{batch.materialCategory}</span>
          </div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Waste Readiness Quality Gate
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Verify every physical attribute before recipient matching. AI triage does not certify cleanliness.
          </p>
        </div>

        {/* Progress Bar & Counter */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Verification Gate:</span>
            <span className="font-mono font-bold text-sm text-slate-900 tabular-nums">
              {evaluation.completedItemsCount} / {evaluation.totalItemsCount}
            </span>
            <span
              className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                evaluation.isFullyReady
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-100 text-amber-900 border border-amber-200'
              }`}
            >
              {evaluation.percentage}%
            </span>
          </div>
          <div className="w-36 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                evaluation.isFullyReady ? 'bg-emerald-600' : 'bg-teal-600'
              }`}
              style={{ width: `${evaluation.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Rejection / Corrective Alert Notice if batch was previously rejected */}
      {batch.status === 'REJECTED' && batch.rejectionReason && (
        <div className="m-5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1 shadow-2xs">
          <div className="flex items-center gap-2 font-bold text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Previous Handover Rejected: Corrective Re-Sorting Required</span>
          </div>
          <p className="leading-relaxed text-rose-800">
            <strong>Recipient Reason:</strong> {batch.rejectionReason}
          </p>
          {batch.correctiveFeedback && (
            <p className="leading-relaxed text-rose-700 pt-1">
              <strong>Corrective Action:</strong> {batch.correctiveFeedback}
            </p>
          )}
        </div>
      )}

      {/* Checklist items */}
      <div className="p-5 sm:p-6 divide-y divide-slate-100 space-y-3">
        {CHECKLIST_DEFINITIONS.map((def, idx) => {
          const isChecked = checklist[def.key];
          return (
            <div
              key={def.key}
              onClick={() => handleToggle(def.key)}
              className={`pt-3 first:pt-0 flex items-start gap-3.5 cursor-pointer group transition-colors p-3 rounded-xl ${
                isChecked
                  ? 'bg-emerald-50/40 hover:bg-emerald-50/70 border border-emerald-200/50'
                  : 'hover:bg-slate-50 border border-transparent'
              }`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => handleToggle(def.key)}
                className="mt-0.5 w-4 h-4 rounded text-emerald-800 focus:ring-emerald-700 border-slate-300 cursor-pointer shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-xs font-bold transition-colors ${
                      isChecked ? 'text-emerald-950' : 'text-slate-800 group-hover:text-slate-900'
                    }`}
                  >
                    {idx + 1}. {def.label}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 shrink-0">
                    {isChecked ? (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Verified
                      </span>
                    ) : (
                      'Pending Check'
                    )}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{def.guidance}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Operational Notes */}
      <div className="p-5 sm:p-6 border-t border-slate-100 bg-slate-50/40 space-y-3.5">
        <label className="block text-xs font-semibold text-slate-700">
          Inspector / Sorting Notes or Corrective Remarks
        </label>
        <textarea
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            setSavedSuccess(false);
          }}
          rows={2}
          placeholder="e.g. Cardboard boxes strapped with polypropylene tape removed; moisture meter read 9.2% (dry)."
          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
        />

        {/* Readiness Outcome Explanation Box */}
        <div
          className={`p-3.5 rounded-lg border text-xs leading-relaxed ${
            evaluation.isFullyReady
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-amber-50 border-amber-200 text-amber-950'
          }`}
        >
          <div className="font-bold flex items-center gap-2 mb-1">
            {evaluation.isFullyReady ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            <span>
              {evaluation.isFullyReady
                ? 'Batch Quality Certified: Ready for Recipient Matching'
                : 'Batch Incomplete: Preparation Required'}
            </span>
          </div>
          <p>{evaluation.summaryExplanation}</p>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          <div>
            {savedSuccess && (
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Readiness saved successfully
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-900 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Changes...' : 'Save Readiness Evaluation'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
