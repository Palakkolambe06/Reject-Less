import React, { useState, useEffect } from 'react';
import { Recipient } from '../../types/recipient';
import { DemoUser } from '../../types/user';
import { recipientService } from '../../services/recipientService';
import {
  Sliders,
  CheckCircle2,
  Save,
} from 'lucide-react';

interface MaterialRequirementsPageProps {
  activeUser: DemoUser;
}

export const MaterialRequirementsPage: React.FC<MaterialRequirementsPageProps> = ({
  activeUser,
}) => {
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [minQty, setMinQty] = useState('');
  const [maxQty, setMaxQty] = useState('');
  const [requiresDry, setRequiresDry] = useState(false);
  const [radiusKm, setRadiusKm] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      const facilityId = activeUser.recipientFacilityId || 'REC-PUN-001';
      const r = await recipientService.getById(facilityId);
      if (r) {
        setRecipient(r);
        setMinQty(r.minQuantityKg.toString());
        setMaxQty(r.maxQuantityKg.toString());
        setRequiresDry(r.requiresDry);
        setRadiusKm(r.location.maxServiceRadiusKm?.toString() || '45');
        setSpecialInstructions(r.specialInstructions || '');
        setIsActive(r.isActive);
      }
    };
    load();
  }, [activeUser]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient) return;
    const updated: Recipient = {
      ...recipient,
      minQuantityKg: parseFloat(minQty) || 50,
      maxQuantityKg: parseFloat(maxQty) || 50000,
      requiresDry,
      specialInstructions: specialInstructions.trim(),
      isActive,
      location: {
        ...recipient.location,
        maxServiceRadiusKm: parseFloat(radiusKm) || undefined,
      },
    };
    await recipientService.save(updated);
    setRecipient(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  if (!recipient) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Facility Material Intake Requirements
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Define intake specifications used by the deterministic matching engine to filter generator offers
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-xs text-teal-900 font-mono self-start sm:self-auto">
          Configuring: <span className="font-bold">{recipient.name}</span>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-teal-800" />
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Commercial & Quality Acceptance Rules</h3>
          </div>
          {saveSuccess && (
            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Intake rules updated in matching engine
            </span>
          )}
        </div>

        {/* Accepted materials */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Accepted Material Categories (Configured on Facility Registration)
          </label>
          <div className="flex flex-wrap gap-2 text-xs">
            {recipient.acceptedMaterials.map((mat) => (
              <span
                key={mat}
                className="px-3 py-1 bg-teal-50 text-teal-900 border border-teal-200 font-bold rounded-lg"
              >
                {mat}
              </span>
            ))}
          </div>
        </div>

        {/* Min / Max Capacity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Minimum Intake Threshold (kg) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              value={minQty}
              onChange={(e) => setMinQty(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Offers below this weight will be marked ineligible by the matching service.
            </p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Maximum Single Batch Intake Limit (kg) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              value={maxQty}
              onChange={(e) => setMaxQty(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
              required
            />
          </div>
        </div>

        {/* Packaging and moisture */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Maximum Service Radius (km)
            </label>
            <input
              type="number"
              value={radiusKm}
              onChange={(e) => setRadiusKm(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
            />
          </div>
          <div className="space-y-3 pt-4">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
              <input
                type="checkbox"
                checked={requiresDry}
                onChange={(e) => setRequiresDry(e.target.checked)}
                className="w-4 h-4 rounded text-teal-700 cursor-pointer"
              />
              <span>Strict Moisture Tolerance: Requires 100% Dry Material</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-teal-700 cursor-pointer"
              />
              <span>Facility Active: Currently accepting new offers & deliveries</span>
            </label>
          </div>
        </div>

        {/* Special instructions */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Special Operational Intake Instructions (Shown to Generators)
          </label>
          <textarea
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
          />
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-800 hover:bg-teal-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Intake Criteria</span>
          </button>
        </div>
      </form>
    </div>
  );
};
