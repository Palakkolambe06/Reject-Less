import React from 'react';
import { Button } from '../components/ui/Button';
import {
  Sparkles,
  CheckCircle2,
  Building2,
  Truck,
  ArrowRight,
  ShieldCheck,
  FileCheck,
  Layers,
  Leaf,
  Scan,
  Package,
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (path: string) => void;
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
  isAuthenticated: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onOpenAuth,
  isAuthenticated,
}) => {
  return (
    <div className="space-y-16 py-4">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-emerald-50/60 via-slate-50/40 to-white border border-emerald-100/80 p-8 sm:p-12 lg:p-16 shadow-xs">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-900 border border-emerald-200 text-xs font-semibold">
            <Leaf className="w-3.5 h-3.5 text-emerald-700" />
            <span>AI-Assisted Circular Resource Recovery</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Turn Waste Into a Resource.
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
            Identify useful waste, prepare it for recovery, and connect it with suitable recipients through AI-assisted identification and transparent matching.
          </p>

          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <Button
              size="lg"
              variant="primary"
              onClick={() => onNavigate('/ai-triage')}
              icon={<Sparkles className="w-4 h-4 text-emerald-300" />}
            >
              Identify Waste
            </Button>

            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center font-semibold text-xs sm:text-sm px-4.5 py-2.5 h-10 rounded-lg text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-2xs transition-colors"
            >
              Explore How It Works
            </a>

            {!isAuthenticated && (
              <Button
                size="lg"
                variant="accent"
                onClick={() => onOpenAuth('signin')}
              >
                Sign In to Workspace
              </Button>
            )}
          </div>

          {/* Verification pill indicator */}
          <div className="pt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>AI suggests, humans confirm</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Deterministic explainable matching</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Immutable chain-of-custody tracking</span>
            </div>
          </div>
        </div>

        {/* Visual Showcase Card on Right */}
        <div className="mt-8 lg:mt-0 lg:absolute lg:right-12 lg:top-1/2 lg:-translate-y-1/2 w-full lg:w-96">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Scan className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-bold text-slate-900">Live AI Vision Triage</span>
              </div>
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                ViT MODEL
              </span>
            </div>

            <div className="aspect-16/10 rounded-xl bg-slate-900/5 border border-slate-200 flex flex-col items-center justify-center p-4 text-center">
              <Package className="w-10 h-10 text-emerald-700 mb-2" />
              <div className="text-xs font-bold text-slate-800">Cardboard Packaging</div>
              <div className="text-[11px] text-emerald-700 font-mono font-semibold">94% candidate match</div>
              <p className="text-[10px] text-slate-400 mt-1 max-w-xs">
                AI proposes category from single photo. Human operator verifies cleanliness before matching.
              </p>
            </div>

            <button
              onClick={() => onNavigate('/ai-triage')}
              className="w-full py-2 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Test Material Identification</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. Three-Step "How It Works" Section */}
      <section id="how-it-works" className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 font-mono">
            Structured Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            How RejectLess Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            A reliable 3-stage loop that eliminates gate rejections before waste travels
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 relative group hover:border-emerald-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-sm font-mono">
              01
            </div>
            <h3 className="text-base font-bold text-slate-900">1. Identify</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Upload a waste bay photo. Open-weight Vision Transformers analyze the visual features and propose candidate streams (Cardboard, Paper, Plastic, Glass, Metal).
            </p>
            <div className="pt-2 text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
              <span>Human verification required</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 relative group hover:border-teal-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center font-bold text-sm font-mono">
              02
            </div>
            <h3 className="text-base font-bold text-slate-900">2. Prepare</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Complete the 6-point physical readiness checklist: single-stream segregation, moisture sheltering, contamination check, and packaging format.
            </p>
            <div className="pt-2 text-[11px] text-teal-800 font-semibold flex items-center gap-1">
              <span>Quality gate certified</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 relative group hover:border-indigo-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 flex items-center justify-center font-bold text-sm font-mono">
              03
            </div>
            <h3 className="text-base font-bold text-slate-900">3. Recover</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Deterministic matching connects certified batches with verified regional paper mills, polymer reprocessors, and aggregators. Drivers log custody and recyclers record weighbridge yield.
            </p>
            <div className="pt-2 text-[11px] text-indigo-800 font-semibold flex items-center gap-1">
              <span>Chain of custody locked</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Capabilities Grid */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 font-mono">
            Platform Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Built to End Recyclable Rejections
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">AI Material Triage</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Open-weight ViT classification proposes material category. Eliminates guesswork without replacing operator oversight.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 text-teal-800 flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Readiness Gate</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Enforces physical checks before dispatch: single-stream purity, moisture tolerance, and baled/palletized packaging.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 text-sky-800 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Explainable Recipient Matching</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Deterministic rules compare batch weight, material stream, and collection radius against facility constraints.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-800 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Traceable Handover</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Immutable transition logs capture driver pickup, recipient dock inspection, weighbridge slips, and mandatory rejection feedback.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Quick Demo Switcher Strip for Reviewers */}
      <section className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Test Role Workspaces Instantly
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Switch perspective across Waste Generator, Recipient Mill, Logistics Carrier, or System Administrator
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onNavigate('/settings')}
          >
            System Settings & Architecture
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => {
              onNavigate('/');
            }}
            className="p-3.5 rounded-xl border border-slate-200 text-left hover:border-emerald-600 hover:bg-emerald-50/30 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs font-bold text-emerald-800 mb-1">
              <span>Waste Generator</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-800 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-[11px] text-slate-500">
              Palak Kolambe (MIT-ADT) · Register waste, AI triage & readiness
            </p>
          </button>

          <button
            onClick={() => {
              onNavigate('/recipient/offers');
            }}
            className="p-3.5 rounded-xl border border-slate-200 text-left hover:border-teal-600 hover:bg-teal-50/30 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs font-bold text-teal-800 mb-1">
              <span>Recipient Mill</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-800 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-[11px] text-slate-500">
              Sunil Deshmukh (Hadapsar Kraft) · Review offers & weighbridge slips
            </p>
          </button>

          <button
            onClick={() => {
              onNavigate('/operator/pickup-queue');
            }}
            className="p-3.5 rounded-xl border border-slate-200 text-left hover:border-indigo-600 hover:bg-indigo-50/30 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs font-bold text-indigo-800 mb-1">
              <span>Logistics Fleet</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-800 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-[11px] text-slate-500">
              Vikram Shinde · Coordinate dispatch, drivers & loading
            </p>
          </button>

          <button
            onClick={() => {
              onNavigate('/history');
            }}
            className="p-3.5 rounded-xl border border-slate-200 text-left hover:border-slate-400 hover:bg-slate-50 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
              <span>Audit Trail</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-800 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-[11px] text-slate-500">
              Complete status transition timeline, receipts & rejections
            </p>
          </button>
        </div>
      </section>
    </div>
  );
};
