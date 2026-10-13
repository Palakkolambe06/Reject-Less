import React from 'react';
import { Building2, Package, Radio, Minus } from 'lucide-react';

interface MapLegendProps {
  showRadius: boolean;
  onToggleRadius: (val: boolean) => void;
  hasConnection: boolean;
}

export const MapLegend: React.FC<MapLegendProps> = ({
  showRadius,
  onToggleRadius,
  hasConnection,
}) => {
  return (
    <div className="bg-white/95 backdrop-blur-md rounded-xl border border-slate-200/90 p-3 shadow-md text-xs space-y-2">
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
        Map Legend
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Building2 className="w-3 h-3 text-emerald-100" />
          </div>
          <span className="text-slate-800 text-[11px] font-medium">
            Recipient Facility (Paper Mill / Reprocessor)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Package className="w-3 h-3 text-amber-100" />
          </div>
          <span className="text-slate-800 text-[11px] font-medium">
            Waste Batch Pickup Bay
          </span>
        </div>

        <label className="flex items-center gap-2 pt-1 border-t border-slate-100 cursor-pointer text-[11px] text-slate-700 select-none">
          <input
            type="checkbox"
            checked={showRadius}
            onChange={(e) => onToggleRadius(e.target.checked)}
            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
          />
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-700" />
            <span>Show Recipient Service Radii (km)</span>
          </div>
        </label>

        {hasConnection && (
          <div className="flex items-center gap-2 text-[10px] text-slate-500 pt-1 border-t border-slate-100">
            <Minus className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
            <span>Straight-line distance connection</span>
          </div>
        )}
      </div>
    </div>
  );
};
