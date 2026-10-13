import React from 'react';
import { MapMarkerItem } from '../../services/mapService';
import { StatusBadge } from '../ui/StatusBadge';
import { Button } from '../ui/Button';
import {
  X,
  MapPin,
  Building2,
  Package,
  Phone,
  Mail,
  User,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface LocationDetailsProps {
  item: MapMarkerItem | null;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export const LocationDetails: React.FC<LocationDetailsProps> = ({
  item,
  onClose,
  onNavigate,
}) => {
  if (!item) return null;

  const isRecipient = item.type === 'recipient';
  const recipient = item.recipientData;
  const batch = item.batchData;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl p-5 space-y-4 max-w-sm w-full animate-in fade-in zoom-in-95 duration-100">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
              isRecipient ? 'bg-emerald-800 text-white' : 'bg-amber-600 text-white'
            }`}
          >
            {isRecipient ? (
              <Building2 className="w-5 h-5 text-emerald-100" />
            ) : (
              <Package className="w-5 h-5 text-amber-100" />
            )}
          </div>
          <div>
            <span
              className={`text-[10px] font-mono uppercase font-bold tracking-wider block ${
                isRecipient ? 'text-emerald-800' : 'text-amber-800'
              }`}
            >
              {isRecipient ? 'Verified Recipient Facility' : 'Waste Batch Pickup Bay'}
            </span>
            <h3 className="text-sm font-bold text-slate-900 leading-tight">
              {item.title}
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
          title="Close details"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Subtitle & Address */}
      <div className="text-xs space-y-1.5">
        <div className="flex items-start gap-1.5 text-slate-600">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <span className="leading-snug">
            {isRecipient ? recipient?.location.address : batch?.pickupLocation.address}
          </span>
        </div>

        <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2 pl-5">
          <span>
            {item.lat.toFixed(4)}° N, {item.lng.toFixed(4)}° E
          </span>
          {isRecipient && recipient?.location.maxServiceRadiusKm && (
            <span>· Max Radius: {recipient.location.maxServiceRadiusKm} km</span>
          )}
        </div>
      </div>

      {/* Content for Recipient */}
      {isRecipient && recipient && (
        <div className="space-y-3 pt-1 border-t border-slate-100 text-xs">
          <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-100 space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-900 font-mono block">
              Accepted Material Streams:
            </span>
            <div className="flex flex-wrap gap-1">
              {recipient.acceptedMaterials.map((mat, i) => (
                <span
                  key={i}
                  className="bg-white px-2 py-0.5 rounded text-[11px] font-bold text-emerald-900 border border-emerald-200"
                >
                  {mat}
                </span>
              ))}
            </div>
            <div className="text-[11px] text-slate-600 pt-1">
              Intake Bounds: {recipient.minQuantityKg} kg – {recipient.maxQuantityKg.toLocaleString()} kg
            </div>
          </div>

          <div className="space-y-1 text-slate-600 text-[11px]">
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Contact: {recipient.contactPerson}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{recipient.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{recipient.email}</span>
            </div>
          </div>

          <Button
            size="sm"
            variant="primary"
            className="w-full"
            onClick={() => onNavigate(`/recipients?batchId=`)}
          >
            <span>Match Batches With Facility</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      )}

      {/* Content for Batch */}
      {!isRecipient && batch && (
        <div className="space-y-3 pt-1 border-t border-slate-100 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-mono text-[11px]">{batch.id}</span>
            <StatusBadge status={batch.status} size="sm" />
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Material Stream:</span>
              <strong className="text-slate-900">{batch.materialCategory}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Quantity:</span>
              <strong className="text-slate-900 font-mono">
                {batch.quantity} {batch.unit}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Packaging Format:</span>
              <span className="text-slate-700">{batch.packagingType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Readiness Gate:</span>
              <span
                className={`font-semibold ${
                  batch.isReadyForMatching ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {batch.isReadyForMatching ? 'Certified Ready' : 'In Preparation'}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => onNavigate(`/readiness?batchId=${batch.id}`)}
            >
              Readiness Check
            </Button>
            <Button
              size="sm"
              variant="primary"
              className="flex-1"
              onClick={() => onNavigate(`/batches/${batch.id}`)}
            >
              Inspect Batch
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
