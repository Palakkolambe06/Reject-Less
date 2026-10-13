import React, { useState } from 'react';
import { MaterialCategory } from '../types/batch';
import { ClassifiedResult } from '../types/ai';
import { PhotoUploader } from '../components/batches/PhotoUploader';
import { MaterialPrediction } from '../components/batches/MaterialPrediction';
import { VERIFIED_OPEN_WEIGHT_MODEL } from '../services/ai/modelConfig';
import {
  Sparkles,
  ShieldCheck,
  ExternalLink,
  Package,
  Layers,
  Wine,
  Hammer,
  HelpCircle,
  FileText,
  ArrowRight,
} from 'lucide-react';

interface AiTriagePageProps {
  onNavigate: (path: string) => void;
}

export const AiTriagePage: React.FC<AiTriagePageProps> = ({ onNavigate }) => {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [confirmedCategory, setConfirmedCategory] = useState<MaterialCategory | null>(null);
  const [_predictionData, setPredictionData] = useState<ClassifiedResult | null>(null);

  const handleImageSelected = (file: File, previewUrl: string) => {
    setPhotoFile(file);
    setPhotoUrl(previewUrl);
    setConfirmedCategory(null);
    setPredictionData(null);
  };

  const handleImageRemoved = () => {
    setPhotoFile(null);
    setPhotoUrl(null);
    setConfirmedCategory(null);
    setPredictionData(null);
  };

  const handleConfirmCategory = (cat: MaterialCategory, pred?: ClassifiedResult) => {
    setConfirmedCategory(cat);
    if (pred) setPredictionData(pred);
  };

  const materialReferenceCards: Array<{
    name: MaterialCategory;
    icon: React.ReactNode;
    description: string;
    recyclabilityFactor: string;
    typicalContaminants: string;
  }> = [
    {
      name: 'Cardboard',
      icon: <Package className="w-5 h-5 text-amber-700" />,
      description: 'Corrugated shipping boxes, dry packaging cartons, kraft paper bags',
      recyclabilityFactor: 'High pulp yield if dry',
      typicalContaminants: 'Grease stains, tape, wax coatings',
    },
    {
      name: 'Paper',
      icon: <FileText className="w-5 h-5 text-sky-700" />,
      description: 'Office documents, newspapers, shredded bond, magazines, books',
      recyclabilityFactor: 'Bleached fiber re-pulping',
      typicalContaminants: 'Staples, lamination, liquid stains',
    },
    {
      name: 'Plastic',
      icon: <Layers className="w-5 h-5 text-teal-700" />,
      description: 'PET drink bottles, HDPE drums, PP containers, clean shrink film',
      recyclabilityFactor: 'Pelletized flaking & extrusion',
      typicalContaminants: 'Multi-layer packaging, organic oils',
    },
    {
      name: 'Glass',
      icon: <Wine className="w-5 h-5 text-emerald-700" />,
      description: 'Clear flint, amber and emerald beverage bottles, glass jars',
      recyclabilityFactor: '100% cullet remeltable',
      typicalContaminants: 'Pyrex, ceramics, metal caps',
    },
    {
      name: 'Metal',
      icon: <Hammer className="w-5 h-5 text-indigo-700" />,
      description: 'Aluminum beverage cans, steel scrap, offcuts, copper wirings',
      recyclabilityFactor: 'Foundry smelting & alloy ingot',
      typicalContaminants: 'Pressurized cans, heavy motor oil',
    },
    {
      name: 'Other / Uncertain',
      icon: <HelpCircle className="w-5 h-5 text-slate-600" />,
      description: 'Mixed municipal streams, unknown laminates, composites',
      recyclabilityFactor: 'Requires manual pre-sorting',
      typicalContaminants: 'Complex multi-material bonding',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            AI-Assisted Material Identification Laboratory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Open-weight computer vision visual triage for recyclable waste streams (ViT Garbage Classification)
          </p>
        </div>
        <button
          onClick={() => onNavigate('/settings')}
          className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors self-start sm:self-auto cursor-pointer"
        >
          Configure AI Inference Runtime
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Interactive Uploader & AI Triage Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                1. Upload Waste Photograph for Visual Triage
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Take or upload a high-contrast photograph of your collection bay or sorting bin
              </p>
            </div>

            <PhotoUploader
              onImageSelected={handleImageSelected}
              onImageRemoved={handleImageRemoved}
            />

            <MaterialPrediction
              photoFile={photoFile}
              photoUrl={photoUrl}
              currentConfirmedCategory={confirmedCategory || undefined}
              onConfirmCategory={handleConfirmCategory}
            />

            {confirmedCategory && (
              <div className="p-4 sm:p-5 bg-emerald-50/80 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
                <div>
                  <span className="font-bold text-emerald-950 block text-sm">
                    Material Confirmed as: {confirmedCategory}
                  </span>
                  <span className="text-emerald-800 text-[11px] mt-0.5 block leading-snug">
                    Human confirmation recorded. You can proceed directly to create a registered batch with this material.
                  </span>
                </div>
                <button
                  onClick={() => onNavigate('/create-batch')}
                  className="px-4 py-2 bg-emerald-900 hover:bg-emerald-800 text-white font-bold rounded-lg transition-colors cursor-pointer shrink-0 shadow-xs flex items-center gap-1.5"
                >
                  <span>Register Batch</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Model Card & Operational Boundary */}
        <div className="space-y-4">
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-3.5 text-xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-bold text-slate-900">Model Specifications</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Architecture:</span>
                <span className="font-mono text-slate-800">Vision Transformer (ViT-Base)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">License:</span>
                <span className="font-semibold text-emerald-800">MIT Open Source</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Classes (6):</span>
                <span className="text-slate-700 font-mono text-[11px]">Cardboard, Glass, Metal, Paper, Plastic, Trash</span>
              </div>
            </div>
            <div className="pt-1">
              <a
                href={VERIFIED_OPEN_WEIGHT_MODEL.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-emerald-800 font-semibold hover:underline"
              >
                <span>View on Hugging Face Hub</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="bg-amber-50/80 p-5 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-2 leading-relaxed shadow-2xs">
            <div className="flex items-center gap-2 font-bold text-amber-950">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Operational Boundary Principle</span>
            </div>
            <p>
              AI classification is strictly an indicative candidate suggestion. The computer vision model cannot detect moisture content, tensile degradation, or chemical contamination.
            </p>
            <p>
              A human operator must confirm or correct the material and physically complete the readiness checklist before any recipient offer is permitted.
            </p>
          </div>
        </div>
      </div>

      {/* Material Stream Reference Cards */}
      <div className="space-y-3 pt-2">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">
          Supported Recyclable Material Streams
        </h3>
        <p className="text-xs text-slate-500">
          Industrial processing standards and recovery characteristics across the RejectLess platform
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
          {materialReferenceCards.map((card) => (
            <div
              key={card.name}
              className={`bg-white p-4.5 rounded-xl border transition-all shadow-2xs space-y-2.5 ${
                confirmedCategory === card.name
                  ? 'border-emerald-600 ring-2 ring-emerald-600/20 bg-emerald-50/20'
                  : 'border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                    {card.icon}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">{card.name}</h4>
                </div>
                {confirmedCategory === card.name && (
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Selected
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                {card.description}
              </p>
              <div className="pt-2 border-t border-slate-100 text-[10px] space-y-1 font-mono">
                <div className="text-slate-600">
                  <span className="text-slate-400">Process: </span>
                  {card.recyclabilityFactor}
                </div>
                <div className="text-slate-600">
                  <span className="text-slate-400">Reject risks: </span>
                  {card.typicalContaminants}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
