import React from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  unit?: string;
  subtitle: string;
  icon: React.ReactNode;
  accentColor?: 'teal' | 'emerald' | 'amber' | 'rose' | 'slate' | 'cyan';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  icon,
  accentColor = 'slate',
  onClick,
}) => {
  const getAccentBorder = () => {
    switch (accentColor) {
      case 'teal':
        return 'hover:border-teal-400 group-hover:text-teal-700';
      case 'emerald':
        return 'hover:border-emerald-400 group-hover:text-emerald-700';
      case 'amber':
        return 'hover:border-amber-400 group-hover:text-amber-700';
      case 'rose':
        return 'hover:border-rose-400 group-hover:text-rose-700';
      case 'cyan':
        return 'hover:border-cyan-400 group-hover:text-cyan-700';
      default:
        return 'hover:border-slate-300 group-hover:text-slate-800';
    }
  };

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      onClick={onClick}
      className={`bg-white p-5 rounded-xl border border-slate-200/90 text-left transition-all w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 shadow-2xs group ${
        onClick ? 'cursor-pointer hover:shadow-xs active:scale-[0.99]' : ''
      } ${getAccentBorder()}`}
    >
      <div className="flex items-center justify-between text-slate-500 mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-slate-600 transition-colors">
          {icon}
        </div>
      </div>
      <div className="flex items-baseline gap-1.5 mb-1">
        <span className="text-2xl lg:text-3xl font-bold text-slate-900 font-mono tabular-nums tracking-tight">
          {value}
        </span>
        {unit && <span className="text-xs font-medium text-slate-500">{unit}</span>}
      </div>
      <p className="text-xs text-slate-500 leading-snug">{subtitle}</p>
    </Component>
  );
};
