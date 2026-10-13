import React from 'react';

interface KpiCardProps {
  label: string;
  value: number | string;
  unit?: string;
  description: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  onClick?: () => void;
  className?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  unit,
  description,
  icon,
  trend,
  onClick,
  className = '',
}) => {
  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      onClick={onClick}
      className={`bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 text-left transition-all duration-150 w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700/40 shadow-2xs group relative overflow-hidden ${
        onClick
          ? 'cursor-pointer hover:border-slate-300 hover:shadow-xs active:scale-[0.99]'
          : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between text-slate-500 mb-2.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">
          {label}
        </span>
        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 shrink-0 group-hover:text-emerald-800 group-hover:bg-emerald-50/60 group-hover:border-emerald-200 transition-colors">
          {icon}
        </div>
      </div>
      <div className="flex items-baseline gap-1.5 mb-1">
        <span className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums tracking-tight">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-medium text-slate-500 font-mono">
            {unit}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
        <p className="text-[11px] text-slate-500 truncate leading-snug">
          {description}
        </p>
        {trend && (
          <span
            className={`text-[10px] font-mono font-bold shrink-0 ml-1 ${
              trend.isPositive ? 'text-emerald-700' : 'text-slate-500'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>
    </Component>
  );
};
