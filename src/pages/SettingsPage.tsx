import React, { useState, useEffect } from 'react';
import { storageService, AppSettings } from '../services/storageService';
import { VERIFIED_OPEN_WEIGHT_MODEL } from '../services/ai/modelConfig';
import {
  Database,
  Sparkles,
  Download,
  RotateCcw,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Info,
} from 'lucide-react';

interface SettingsPageProps {
  onDataReset: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onDataReset }) => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    storageService.getSettings().then(setSettings);
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    await storageService.saveSettings(settings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetDemoData = () => {
    const confirmReset = window.confirm(
      'Reset all batches and recipient profiles to default demo data for Pune?'
    );
    if (confirmReset) {
      storageService.resetToDemoData();
      onDataReset();
      window.location.reload();
    }
  };

  const handleClearAll = () => {
    const confirmClear = window.confirm('Clear all local data? This will leave the application empty.');
    if (confirmClear) {
      storageService.clearAllData();
      onDataReset();
      window.location.reload();
    }
  };

  const handleExportData = async () => {
    const json = await storageService.exportAllJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rejectless_export_${new Date().toISOString().substring(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!settings) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          System Settings & Open-Source AI Architecture
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure model inference endpoints, audit open-weight model licenses, and manage browser storage
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: AI Model Architecture & Open-Weight Details */}
        <div className="space-y-6">
          {/* Verified Model Card */}
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Verified Open-Weight Vision Model
                  </h3>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Track 2: Best Open-Source AI Project
                  </div>
                </div>
              </div>
              <a
                href={VERIFIED_OPEN_WEIGHT_MODEL.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs text-emerald-800 hover:text-emerald-950 font-semibold"
              >
                <span>Hugging Face Hub</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Model Name:</span>
                <span className="font-semibold text-slate-800">{VERIFIED_OPEN_WEIGHT_MODEL.name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Architecture:</span>
                <span className="font-mono text-slate-800">{VERIFIED_OPEN_WEIGHT_MODEL.architecture}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Open-Source License:</span>
                <span className="font-semibold text-emerald-800">{VERIFIED_OPEN_WEIGHT_MODEL.license}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Training Dataset:</span>
                <span className="text-slate-700 text-right">{VERIFIED_OPEN_WEIGHT_MODEL.dataset}</span>
              </div>
            </div>

            {/* Intended Use & Limitations */}
            <div className="space-y-2 pt-1 text-xs">
              <span className="font-bold text-slate-800 block">Operational Limitations:</span>
              <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[11px] leading-relaxed">
                {VERIFIED_OPEN_WEIGHT_MODEL.limitations.map((lim, i) => (
                  <li key={i}>{lim}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* AI Inference Endpoint Form */}
          <form
            onSubmit={handleSaveSettings}
            className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Inference Runtime Mode</h3>
              {saveSuccess && (
                <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Settings saved
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Inference Strategy
              </label>
              <select
                value={settings.aiConfig.mode}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    aiConfig: {
                      ...settings.aiConfig,
                      mode: e.target.value as any,
                    },
                  })
                }
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              >
                <option value="demo_simulation">
                  Demo Simulation (Default: ₹0 budget, honest simulated predictions)
                </option>
                <option value="open_weights_api">
                  Hugging Face Serverless Inference API (Requires HF User Token)
                </option>
                <option value="custom_endpoint">
                  Self-Hosted Triton / Flask ONNX Server Endpoint
                </option>
              </select>
            </div>

            {settings.aiConfig.mode === 'open_weights_api' && (
              <div className="space-y-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Hugging Face Model ID
                  </label>
                  <input
                    type="text"
                    value={settings.aiConfig.modelId}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        aiConfig: { ...settings.aiConfig, modelId: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Hugging Face Read Token (Stored only in local browser)
                  </label>
                  <input
                    type="password"
                    placeholder="hf_..."
                    value={settings.aiConfig.apiToken || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        aiConfig: { ...settings.aiConfig, apiToken: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 font-mono"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Get a free token from huggingface.co/settings/tokens. Never sent to third parties.
                  </p>
                </div>
              </div>
            )}

            {settings.aiConfig.mode === 'custom_endpoint' && (
              <div className="space-y-2 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Custom POST Inference Endpoint URL
                </label>
                <input
                  type="text"
                  placeholder="http://localhost:8000/predict"
                  value={settings.aiConfig.apiEndpoint || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      aiConfig: { ...settings.aiConfig, apiEndpoint: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 font-mono"
                />
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Save AI Configuration
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Persistence Architecture & Demo Controls */}
        <div className="space-y-6">
          {/* Storage Architecture Document Card */}
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Database className="w-4 h-4 text-slate-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Persistence Architecture Transparency
              </h3>
            </div>

            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-1.5 leading-relaxed">
              <div className="flex items-center gap-2 font-bold text-amber-950">
                <Info className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Notice on Data Scope: Local Storage vs Cloud Database</span>
              </div>
              <p>
                This MVP stores data in the browser's <code>localStorage</code> repository under the <code>storageService</code> abstraction.
              </p>
              <p>
                <strong>What this means:</strong> Your batches survive page refreshes in this browser, but data is NOT synchronized to a multi-tenant cloud database. A production migration replaces <code>storageService.ts</code> with a PostgreSQL or Supabase client without requiring UI changes.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={handleExportData}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export State as JSON</span>
              </button>
              <button
                type="button"
                onClick={handleResetDemoData}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reload Pune Demo Data</span>
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Records</span>
              </button>
            </div>
          </div>

          {/* HackStorm Track 2 Compliance Checklist Card */}
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-3.5">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5">
              HackStorm 2026 Track 2 Integrity Principles
            </h3>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>AI suggests, humans confirm: </strong> AI predictions never automatically write the confirmed material category.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Simulation honesty: </strong> Simulated predictions are prominently watermarked as DEMO SIMULATION.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Rules explain: </strong> Recipient matching decisions are calculated by deterministic code with explicit criteria explanations.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>₹0 software budget: </strong> Fully open-source stack (React, TypeScript, Vite, Tailwind CSS, MIT-licensed ViT).
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
