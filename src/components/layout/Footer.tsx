import React from 'react';
import { Leaf, ShieldCheck, Sparkles, Github, ExternalLink } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-900 text-white flex items-center justify-center">
                <Leaf className="w-4 h-4 text-emerald-300" />
              </div>
              <span className="font-bold text-sm text-slate-900 tracking-tight">RejectLess</span>
            </div>
            <p className="text-xs text-slate-600 max-w-sm leading-relaxed">
              Turn Waste Into a Resource. AI-assisted recyclable waste readiness certification, explainable recycler matching, and end-to-end chain-of-custody tracking.
            </p>
            <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400 font-mono">
              <span>Open-Source Platform</span>
              <span>·</span>
              <span>MIT License</span>
              <span>·</span>
              <span>HackStorm 2026</span>
            </div>
          </div>

          {/* Platform Workflows */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 font-mono">
              Circular Pipelines
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('/ai-triage')}
                  className="hover:text-emerald-800 transition-colors cursor-pointer text-left"
                >
                  AI Computer Vision Triage
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/readiness')}
                  className="hover:text-emerald-800 transition-colors cursor-pointer text-left"
                >
                  6-Point Readiness Gate
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/recipients')}
                  className="hover:text-emerald-800 transition-colors cursor-pointer text-left"
                >
                  Explainable Recipient Engine
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/handovers')}
                  className="hover:text-emerald-800 transition-colors cursor-pointer text-left"
                >
                  Chain of Custody Tracking
                </button>
              </li>
            </ul>
          </div>

          {/* Ethics & Trust */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 font-mono">
              Core Principles
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5 text-slate-600">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>AI suggests, humans confirm</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-600">
                <Sparkles className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                <span>Deterministic rules explain</span>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/settings')}
                  className="hover:text-emerald-800 transition-colors cursor-pointer text-left flex items-center gap-1"
                >
                  <span>Model Cards & Licenses</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/history')}
                  className="hover:text-emerald-800 transition-colors cursor-pointer text-left"
                >
                  Immutable Audit Analytics
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>
            © 2026 RejectLess Contributors. Built for sustainable municipal and industrial circular resource recovery.
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('/settings')}
              className="hover:text-slate-800 cursor-pointer"
            >
              Persistence Architecture
            </button>
            <button
              onClick={() => onNavigate('/home')}
              className="hover:text-slate-800 cursor-pointer"
            >
              Public Overview
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
