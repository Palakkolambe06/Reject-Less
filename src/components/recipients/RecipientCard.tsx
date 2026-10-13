import React from 'react';
import { Recipient } from '../../types/recipient';
import { Building2, MapPin, Scale, Package, Shield, Phone, Mail, CheckCircle2, XCircle } from 'lucide-react';

interface RecipientCardProps {
  recipient: Recipient;
  onSelect?: () => void;
  actionButtonLabel?: string;
  isActionDisabled?: boolean;
}

export const RecipientCard: React.FC<RecipientCardProps> = ({
  recipient,
  onSelect,
  actionButtonLabel,
  isActionDisabled = false,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4 hover:border-slate-300 transition-all card-hover">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900 tracking-tight">{recipient.name}</h4>
              {recipient.isDemoData && (
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                  DEMO DATA
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500 font-medium">
              {recipient.facilityType} · {recipient.location.city}
            </div>
          </div>
        </div>
        <span
          className={`text-[11px] font-semibold flex items-center gap-1 ${
            recipient.isActive ? 'text-emerald-700' : 'text-slate-400'
          }`}
        >
          {recipient.isActive ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Active Partner
            </>
          ) : (
            <>
              <XCircle className="w-3.5 h-3.5 text-slate-400" />
              Inactive
            </>
          )}
        </span>
      </div>

      {/* Accepted Materials */}
      <div>
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
          Accepted Material Streams
        </div>
        <div className="flex flex-wrap gap-1.5 text-xs">
          {recipient.acceptedMaterials.map((mat) => (
            <span
              key={mat}
              className="px-2.5 py-0.5 bg-teal-50 text-teal-900 border border-teal-200/90 rounded-md font-medium"
            >
              {mat}
            </span>
          ))}
        </div>
      </div>

      {/* Key Operational Constraints Grid */}
      <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50/80 p-3.5 rounded-lg border border-slate-100">
        <div className="flex items-start gap-2">
          <Scale className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
          <div>
            <span className="text-[11px] text-slate-500 block">Intake Capacity</span>
            <span className="font-mono font-semibold text-slate-800 tabular-nums">
              {recipient.minQuantityKg.toLocaleString()} – {recipient.maxQuantityKg.toLocaleString()} kg
            </span>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Package className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
          <div>
            <span className="text-[11px] text-slate-500 block">Required Packaging</span>
            <span className="font-medium text-slate-800 truncate block">
              {recipient.requiredPackaging.join(', ')}
            </span>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
          <div>
            <span className="text-[11px] text-slate-500 block">Service Radius</span>
            <span className="font-mono font-semibold text-slate-800 tabular-nums">
              {recipient.location.maxServiceRadiusKm
                ? `Max ${recipient.location.maxServiceRadiusKm} km`
                : 'Regional (No Cap)'}
            </span>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Shield className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
          <div>
            <span className="text-[11px] text-slate-500 block">Weather Protection</span>
            <span className="font-medium text-slate-800">
              {recipient.requiresDry ? 'Requires 100% Dry' : 'Moisture Tolerant'}
            </span>
          </div>
        </div>
      </div>

      {/* Special Instructions */}
      {recipient.specialInstructions && (
        <p className="text-xs text-slate-600 bg-slate-50/60 p-3 rounded-lg border border-slate-200/70 leading-relaxed italic">
          "{recipient.specialInstructions}"
        </p>
      )}

      {/* Contact & Footer Action */}
      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="text-slate-500 flex items-center gap-3">
          <span className="flex items-center gap-1 font-mono text-[11px]">
            <Phone className="w-3 h-3 text-slate-400" />
            {recipient.phone}
          </span>
          <span className="flex items-center gap-1 font-mono text-[11px] truncate">
            <Mail className="w-3 h-3 text-slate-400" />
            {recipient.email}
          </span>
        </div>
        {onSelect && (
          <button
            type="button"
            onClick={onSelect}
            disabled={isActionDisabled}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 ${
              isActionDisabled
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-900 hover:bg-emerald-800 text-white shadow-xs'
            }`}
          >
            {actionButtonLabel || 'Select Recipient'}
          </button>
        )}
      </div>
    </div>
  );
};
