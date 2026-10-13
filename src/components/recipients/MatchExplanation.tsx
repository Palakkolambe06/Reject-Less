import React from 'react';
import { MatchResult } from '../../types/matching';
import { CheckCircle2, XCircle, AlertTriangle, ArrowRight, Building2 } from 'lucide-react';

interface MatchExplanationProps {
  matchResult: MatchResult;
  onSelectRecipient?: () => void;
  isSelected?: boolean;
}

export const MatchExplanation: React.FC<MatchExplanationProps> = ({
  matchResult,
  onSelectRecipient,
  isSelected = false,
}) => {
  const { recipient, isEligible, score, evaluations, summaryExplanation, distanceKm, missingInfo } =
    matchResult;

  return (
    <div
      className={`rounded-xl border p-5 sm:p-6 transition-all ${
        isEligible
          ? isSelected
            ? 'bg-emerald-50/40 border-emerald-600 ring-2 ring-emerald-600/20'
            : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs'
          : 'bg-slate-50/70 border-slate-200/90 opacity-95'
      }`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3.5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isEligible
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900 tracking-tight">{recipient.name}</h4>
              <span className="font-mono text-[10px] text-slate-500 font-medium">({recipient.facilityType})</span>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
              <span>{recipient.location.address}, {recipient.location.city}</span>
              {distanceKm !== null ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums text-slate-700 font-semibold">
                    ~{distanceKm} km away
                  </span>
                </>
              ) : (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-slate-400 italic">Distance unavailable</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Eligibility Pill Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span
            className={`font-mono text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 ${
              isEligible
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                : 'bg-rose-100 text-rose-900 border border-rose-300'
            }`}
          >
            {isEligible ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                ELIGIBLE ({score}%)
              </>
            ) : (
              <>
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                INELIGIBLE ({score}%)
              </>
            )}
          </span>
        </div>
      </div>

      {/* Summary Natural Language Explanation */}
      <div
        className={`p-3.5 rounded-lg text-xs leading-relaxed mb-4 border ${
          isEligible
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
            : 'bg-rose-50/70 border-rose-200 text-rose-950'
        }`}
      >
        <span className="font-bold">Rules Engine Decision: </span>
        {summaryExplanation}
      </div>

      {/* Criteria Breakdown Grid */}
      <div className="space-y-2 border-t border-slate-100 pt-3">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">
          Detailed Criteria Verification ({evaluations.filter((e) => e.passed).length}/{evaluations.length} passed)
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          {evaluations.map((ev, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-lg border flex items-start gap-2 ${
                ev.passed
                  ? 'bg-white border-slate-200/90 text-slate-700'
                  : 'bg-rose-50/60 border-rose-200 text-rose-900'
              }`}
            >
              {ev.passed ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="min-w-0 flex-1">
                <div className="font-bold flex items-center justify-between text-[11px]">
                  <span>{ev.title}</span>
                  <span className="font-mono text-[10px] text-slate-400">
                    {ev.passed ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
                <p className="text-[11px] mt-0.5 leading-snug">{ev.explanation}</p>
                <div className="text-[10px] text-slate-400 font-mono mt-1">
                  Req: <span className="text-slate-600">{ev.requiredValue}</span> | Act:{' '}
                  <span className="text-slate-600">{ev.actualValue}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Missing Information Cautions */}
      {missingInfo.length > 0 && (
        <div className="mt-3 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>Note: {missingInfo.join(' ')}</span>
        </div>
      )}

      {/* Select CTA */}
      {isEligible && onSelectRecipient && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onSelectRecipient}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isSelected
                ? 'bg-emerald-900 text-white shadow-xs'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            <span>{isSelected ? 'Recipient Selected' : 'Propose Handover to this Recipient'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
