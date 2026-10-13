import React, { useState } from 'react';
import { MaterialCategory } from '../../types/batch';
import { ClassifiedResult } from '../../types/ai';
import { imageClassificationService } from '../../services/ai/imageClassificationService';
import { storageService } from '../../services/storageService';
import { Sparkles, Check, AlertCircle, RefreshCw, ShieldCheck, HelpCircle } from 'lucide-react';

interface MaterialPredictionProps {
  photoFile?: File | null;
  photoUrl?: string | null;
  currentConfirmedCategory?: MaterialCategory;
  onConfirmCategory: (category: MaterialCategory, predictionData?: ClassifiedResult) => void;
  disabled?: boolean;
}

export const MaterialPrediction: React.FC<MaterialPredictionProps> = ({
  photoFile,
  photoUrl,
  currentConfirmedCategory,
  onConfirmCategory,
  disabled = false,
}) => {
  const [isInferring, setIsInferring] = useState(false);
  const [prediction, setPrediction] = useState<ClassifiedResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualOverrideCategory, setManualOverrideCategory] = useState<MaterialCategory>(
    currentConfirmedCategory || 'Cardboard'
  );

  const categories: MaterialCategory[] = [
    'Cardboard',
    'Paper',
    'Plastic',
    'Glass',
    'Metal',
    'Other / Uncertain',
  ];

  const handleRunInference = async () => {
    if (!photoFile && !photoUrl) {
      setError('Please upload or provide a waste photo before running AI identification.');
      return;
    }
    setIsInferring(true);
    setError(null);
    try {
      const settings = await storageService.getSettings();
      const source = photoFile || photoUrl!;
      const result = await imageClassificationService.classifyImage(source, settings.aiConfig);
      setPrediction(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Inference service unavailable.';
      setError(
        `Inference request failed: ${msg}. You can select the material category manually below.`
      );
    } finally {
      setIsInferring(false);
    }
  };

  const handleConfirmAiPrediction = () => {
    if (!prediction) return;
    onConfirmCategory(prediction.predictedCategory, prediction);
  };

  const handleConfirmManual = () => {
    onConfirmCategory(manualOverrideCategory, prediction || undefined);
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-xl p-5 border border-slate-800 shadow-md space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white tracking-wide uppercase font-mono">
              AI-Assisted Material Identification
            </h4>
            <p className="text-[11px] text-slate-400">
              Open-weight vision model suggests category. Operational human confirmation required.
            </p>
          </div>
        </div>

        {/* Trigger Button */}
        <button
          type="button"
          onClick={handleRunInference}
          disabled={isInferring || disabled || (!photoFile && !photoUrl)}
          className={`flex items-center justify-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            isInferring || disabled || (!photoFile && !photoUrl)
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold shadow-sm active:scale-98'
          }`}
        >
          {isInferring ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing Image...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>{prediction ? 'Re-analyze Photo' : 'Identify Material'}</span>
            </>
          )}
        </button>
      </div>

      {/* When no photo uploaded yet */}
      {!photoFile && !photoUrl && (
        <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs text-slate-400 flex items-center gap-2.5">
          <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
          <span>Upload a photo above to enable automated computer-vision material suggestion.</span>
        </div>
      )}

      {/* Error state with honest manual fallback */}
      {error && (
        <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-800/80 text-xs text-rose-300 space-y-1.5">
          <div className="flex items-center gap-2 font-semibold text-rose-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>AI Inference Notice</span>
          </div>
          <p className="text-[11px] leading-relaxed">{error}</p>
        </div>
      )}

      {/* Active Prediction Display */}
      {prediction && (
        <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-3">
          {/* Simulation vs Real Flag */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <span
              className={`font-mono px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                prediction.isSimulation
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              {prediction.isSimulation ? 'DEMO SIMULATION' : 'REAL OPEN-WEIGHT INFERENCE'}
            </span>
            <span className="text-slate-400 font-mono text-[10px] truncate max-w-xs">
              Model: {prediction.modelIdentifier}
            </span>
          </div>

          {/* Main Candidate Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-900/90 rounded-lg border border-slate-800">
            <div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold font-mono">
                Suggested Material Category
              </div>
              <div className="text-lg font-bold text-white flex items-center gap-2 mt-0.5">
                <span>{prediction.predictedCategory}</span>
                <span className="text-xs font-mono font-medium text-teal-400 tabular-nums">
                  ({Math.round(prediction.confidence * 100)}% confidence)
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                Raw label: <code className="text-slate-300 font-mono bg-slate-800 px-1 py-0.2 rounded">{prediction.rawLabel}</code>
              </div>
            </div>

            {/* Confirm AI Button */}
            <button
              type="button"
              onClick={handleConfirmAiPrediction}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer shrink-0 active:scale-98"
            >
              <Check className="w-4 h-4" />
              <span>Confirm AI Suggestion</span>
            </button>
          </div>

          {/* Secondary predictions */}
          {prediction.allPredictions.length > 1 && (
            <div className="text-[11px] text-slate-400 pt-1">
              <span className="text-slate-400 font-medium">Alternative probabilities: </span>
              {prediction.allPredictions.slice(1).map((p, idx) => (
                <span key={idx} className="mr-3 font-mono">
                  {p.category} ({Math.round(p.confidence * 100)}%)
                </span>
              ))}
            </div>
          )}

          {/* Mandatory Disclaimers */}
          <div className="text-[11px] text-slate-400 bg-slate-900/70 p-3 rounded-lg border border-slate-800 leading-relaxed">
            <span className="font-semibold text-slate-300">Operational Principle: </span>
            {prediction.disclaimer}
          </div>
        </div>
      )}

      {/* Manual Selection Fallback & Current Confirmed Category */}
      <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-slate-300 font-medium">
            Confirmed Category:{' '}
            <strong className="text-emerald-300 font-bold">
              {currentConfirmedCategory || 'None (Requires human verification)'}
            </strong>
          </span>
        </div>

        {/* Manual selector */}
        <div className="flex items-center gap-2">
          <select
            value={manualOverrideCategory}
            onChange={(e) => setManualOverrideCategory(e.target.value as MaterialCategory)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-400"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleConfirmManual}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-lg border border-slate-700 transition-colors cursor-pointer"
          >
            Set Confirmed
          </button>
        </div>
      </div>
    </div>
  );
};
