import React, { useState } from 'react';
import {
  LayoutDashboard,
  PackageCheck,
  PlusCircle,
  CheckSquare,
  Building2,
  Truck,
  History,
  Sliders,
  Sparkles,
  Inbox,
  Calendar,
  Scale,
  AlertTriangle,
  Building,
  ShieldCheck,
  AlertCircle,
  Bell,
  ChevronLeft,
  ChevronRight,
  Leaf,
} from 'lucide-react';
import { getNavigationForRole } from '../../app/navigation';
import { DemoUser } from '../../types/user';

interface SidebarProps {
  currentPath: string;
  activeUser: DemoUser;
  onNavigate: (path: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  activeUser,
  onNavigate,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const navItems = getNavigationForRole(activeUser.role);

  const getIcon = (iconName: string) => {
    const iconClass = 'w-4 h-4 shrink-0 transition-transform duration-150';
    switch (iconName) {
      case 'LayoutDashboard':
        return <LayoutDashboard className={iconClass} />;
      case 'PackageCheck':
        return <PackageCheck className={iconClass} />;
      case 'PlusCircle':
        return <PlusCircle className={iconClass} />;
      case 'CheckSquare':
        return <CheckSquare className={iconClass} />;
      case 'Building2':
        return <Building2 className={iconClass} />;
      case 'Truck':
        return <Truck className={iconClass} />;
      case 'History':
        return <History className={iconClass} />;
      case 'Sliders':
        return <Sliders className={iconClass} />;
      case 'Sparkles':
        return <Sparkles className={iconClass} />;
      case 'Inbox':
        return <Inbox className={iconClass} />;
      case 'Calendar':
        return <Calendar className={iconClass} />;
      case 'Scale':
        return <Scale className={iconClass} />;
      case 'AlertTriangle':
        return <AlertTriangle className={iconClass} />;
      case 'Building':
        return <Building className={iconClass} />;
      case 'ShieldCheck':
        return <ShieldCheck className={iconClass} />;
      case 'AlertCircle':
        return <AlertCircle className={iconClass} />;
      case 'Bell':
        return <Bell className={iconClass} />;
      default:
        return <PackageCheck className={iconClass} />;
    }
  };

  const getRoleBadgeLabel = () => {
    switch (activeUser.role) {
      case 'generator':
        return 'Generator';
      case 'recipient':
        return 'Recipient';
      case 'operator':
        return 'Logistics';
      case 'admin':
        return 'Admin';
    }
  };

  return (
    <aside
      className={`hidden lg:flex flex-col bg-[#0B1120] border-r border-slate-800/90 text-slate-300 shrink-0 select-none transition-all duration-200 z-30 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80">
        <button
          onClick={() => onNavigate('/')}
          className="flex items-center gap-3 text-left group w-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg p-1"
          title="RejectLess Home"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-700 to-teal-900 text-emerald-200 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
            <Leaf className="w-4.5 h-4.5 text-emerald-300" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-sm font-bold tracking-tight text-white group-hover:text-emerald-300 transition-colors flex items-center gap-2">
                <span>RejectLess</span>
                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/40">
                  Ready
                </span>
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {getRoleBadgeLabel()} Workspace
              </div>
            </div>
          )}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-3.5 space-y-1 overflow-y-auto">
        {!collapsed && (
          <div className="px-2.5 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
            {activeUser.role} workflows
          </div>
        )}
        {navItems.map((item) => {
          const isActive =
            currentPath === item.path ||
            (item.path !== '/' && currentPath.startsWith(item.path));
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.path)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 group ${
                isActive
                  ? 'bg-emerald-950/80 text-emerald-200 font-semibold border border-emerald-700/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              } ${collapsed ? 'justify-center px-0' : ''}`}
            >
              <span
                className={`${
                  isActive
                    ? 'text-emerald-400'
                    : 'text-slate-400 group-hover:text-slate-200'
                }`}
              >
                {getIcon(item.iconName)}
              </span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer & User Profile */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/50">
        {!collapsed ? (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-700/40 font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                {activeUser.avatarInitial}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-200 truncate">
                  {activeUser.name.split(' ')[0]}
                </div>
                <div className="text-[10px] text-slate-500 truncate capitalize">
                  {activeUser.role} role
                </div>
              </div>
            </div>
            <button
              onClick={() => setCollapsed(true)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={() => setCollapsed(false)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
