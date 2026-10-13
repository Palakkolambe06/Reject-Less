import React from 'react';
import { X, Leaf } from 'lucide-react';
import { getNavigationForRole } from '../../app/navigation';
import { DemoUser } from '../../types/user';

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
  activeUser: DemoUser;
  onNavigate: (path: string) => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  isOpen,
  onClose,
  currentPath,
  activeUser,
  onNavigate,
}) => {
  if (!isOpen) return null;
  const navItems = getNavigationForRole(activeUser.role);

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-72 bg-[#0B1120] text-slate-200 shadow-2xl flex flex-col z-50 border-r border-slate-800">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-700 to-teal-900 text-emerald-200 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Leaf className="w-4.5 h-4.5 text-emerald-300" />
            </div>
            <div>
              <span className="font-bold text-white text-sm block">RejectLess</span>
              <span className="text-[10px] text-teal-400 font-bold uppercase font-mono">
                {activeUser.role} Workspace
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer hover:bg-slate-800"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              currentPath === item.path ||
              (item.path !== '/' && currentPath.startsWith(item.path));
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.path);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-700/40 font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                }`}
              >
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400 font-mono">
          RejectLess · Sustainable Circular Logistics
        </div>
      </div>
    </div>
  );
};
