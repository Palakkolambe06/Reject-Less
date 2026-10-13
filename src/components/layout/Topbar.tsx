import React, { useState, useEffect, useRef } from 'react';
import { DemoUser, DEMO_USERS, UserRole } from '../../types/user';
import { AppNotification } from '../../types/notification';
import { notificationService } from '../../services/notificationService';
import { Button } from '../ui/Button';
import {
  PlusCircle,
  Menu,
  Bell,
  User,
  Building2,
  Truck,
  ShieldAlert,
  Check,
  ChevronDown,
  X,
  Sliders,
  CheckCheck,
} from 'lucide-react';

interface TopbarProps {
  currentPath: string;
  activeUser: DemoUser;
  onSelectUser: (user: DemoUser) => void;
  onNavigate: (path: string) => void;
  onToggleMobileMenu: () => void;
  onRefreshData?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  currentPath,
  activeUser,
  onSelectUser,
  onNavigate,
  onToggleMobileMenu,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const roleMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadNotifs = async () => {
      const list = await notificationService.getForRole(
        activeUser.role,
        activeUser.recipientFacilityId
      );
      setNotifications(list);
      setUnreadCount(list.filter((n) => !n.isRead).length);
    };
    loadNotifs();
  }, [activeUser, currentPath]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        roleMenuRef.current &&
        !roleMenuRef.current.contains(e.target as Node)
      ) {
        setShowRoleMenu(false);
      }
      if (
        notifMenuRef.current &&
        !notifMenuRef.current.contains(e.target as Node)
      ) {
        setShowNotifMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead(
      activeUser.role,
      activeUser.recipientFacilityId
    );
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const getBreadcrumbTitle = (path: string) => {
    if (path === '/' || path === '') {
      if (activeUser.role === 'generator') return 'Generator Dashboard';
      if (activeUser.role === 'recipient') return 'Recipient Dashboard';
      if (activeUser.role === 'operator') return 'Logistics Fleet Dashboard';
      return 'System Audit Dashboard';
    }
    if (path.startsWith('/batches')) return 'Waste Batches';
    if (path.startsWith('/create-batch')) return 'Register Waste Batch';
    if (path.startsWith('/ai-triage')) return 'AI Material Triage';
    if (path.startsWith('/readiness')) return 'Readiness Gate';
    if (path.startsWith('/recipients')) return 'Recipient Directory & Matching';
    if (path.startsWith('/handovers')) return 'Handover Tracking';
    if (path.startsWith('/history')) return 'Audit Trail & Outcomes';
    if (path.startsWith('/notifications')) return 'Notifications';
    if (path.startsWith('/settings')) return 'Settings & Model Config';
    if (path.startsWith('/recipient/offers')) return 'Incoming Offers';
    if (path.startsWith('/recipient/accepted')) return 'Accepted Offers';
    if (path.startsWith('/recipient/schedule')) return 'Collection Schedule';
    if (path.startsWith('/recipient/requirements')) return 'Material Requirements';
    if (path.startsWith('/recipient/receipt-confirmation')) return 'Receipt Confirmation';
    if (path.startsWith('/recipient/rejected')) return 'Rejected Loads';
    if (path.startsWith('/operator/pickup-queue')) return 'Pickup Queue';
    if (path.startsWith('/operator/schedule')) return 'Dispatch Schedule';
    if (path.startsWith('/operator/active')) return 'Active Handovers';
    if (path.startsWith('/operator/evidence')) return 'Verification & Receipts';
    if (path.startsWith('/operator/exceptions')) return 'Exceptions & Delays';
    if (path.startsWith('/operator/completed')) return 'Completed Deliveries';
    return 'Operations';
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'generator':
        return <User className="w-3.5 h-3.5 text-emerald-800" />;
      case 'recipient':
        return <Building2 className="w-3.5 h-3.5 text-teal-700" />;
      case 'operator':
        return <Truck className="w-3.5 h-3.5 text-amber-700" />;
      case 'admin':
        return <ShieldAlert className="w-3.5 h-3.5 text-purple-700" />;
    }
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 z-20">
      {/* Zone 1: Mobile toggle + Breadcrumb trail */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer"
          aria-label="Toggle mobile navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 text-xs text-slate-500 truncate">
          <span className="font-bold text-slate-900 tracking-tight">RejectLess</span>
          <span aria-hidden="true" className="text-slate-300">
            /
          </span>
          <span className="text-slate-700 font-semibold truncate">
            {getBreadcrumbTitle(currentPath)}
          </span>
        </div>
      </div>

      {/* Zone 2: Role Switcher, Notifications & Single Primary Action */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Role Switcher */}
        <div className="relative" ref={roleMenuRef}>
          <button
            onClick={() => {
              setShowRoleMenu(!showRoleMenu);
              setShowNotifMenu(false);
            }}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50/80 hover:bg-slate-100 text-xs font-medium cursor-pointer transition-colors shadow-2xs text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
            title="Switch demo workspace role"
          >
            {getRoleIcon(activeUser.role)}
            <div className="text-left hidden sm:block">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block leading-tight font-mono">
                {activeUser.role}
              </span>
              <span className="text-[11px] font-semibold text-slate-800 block truncate max-w-[130px]">
                {activeUser.name.split(' ')[0]}
              </span>
            </div>
            <span className="sm:hidden font-bold uppercase text-[10px] text-slate-800">
              {activeUser.role}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
          </button>

          {/* Role Dropdown Menu */}
          {showRoleMenu && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200/90 py-2 z-50 text-slate-800 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 font-mono">
                    Workspace Role Switching
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Switch user perspectives to test circular workflows
                  </div>
                </div>
                <button
                  onClick={() => setShowRoleMenu(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer rounded-lg hover:bg-slate-100"
                  aria-label="Close role menu"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto py-1 divide-y divide-slate-100">
                {DEMO_USERS.map((user) => {
                  const isSelected = user.id === activeUser.id;
                  return (
                    <button
                      key={user.id}
                      onClick={() => {
                        onSelectUser(user);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full p-2.5 text-left text-xs flex items-start gap-2.5 transition-colors cursor-pointer hover:bg-slate-50 ${
                        isSelected ? 'bg-emerald-50/70 font-semibold' : ''
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-mono text-[11px] font-bold text-slate-700 shrink-0 mt-0.5">
                        {user.avatarInitial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 truncate">
                            {user.name}
                          </span>
                          <span className="font-mono text-[10px] uppercase px-1.5 py-0.2 rounded border border-slate-200 text-slate-600 bg-white">
                            {user.role}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {user.organization}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                          {user.description}
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-emerald-700 shrink-0 self-center" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <div className="relative" ref={notifMenuRef}>
          <button
            onClick={() => {
              setShowNotifMenu(!showNotifMenu);
              setShowRoleMenu(false);
            }}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer relative focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
            title="Notifications"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-600 rounded-full ring-2 ring-white" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifMenu && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200/90 py-2 z-50 text-slate-800 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Notifications
                  </h4>
                  <div className="text-[10px] text-slate-500">
                    Role-specific alerts for {activeUser.role}
                  </div>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-teal-700 hover:text-teal-900 font-semibold cursor-pointer flex items-center gap-1"
                  >
                    <CheckCheck className="w-3 h-3" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No notifications for this role.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        notificationService.markAsRead(n.id);
                        if (n.actionPath) onNavigate(n.actionPath);
                        setShowNotifMenu(false);
                      }}
                      className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition-colors ${
                        !n.isRead ? 'bg-emerald-50/40 font-medium' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-900 text-xs">
                          {n.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(n.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* ONE Primary Action based on Role */}
        {activeUser.role === 'generator' && (
          <Button
            size="sm"
            variant="primary"
            onClick={() => onNavigate('/create-batch')}
            icon={<PlusCircle className="w-3.5 h-3.5" />}
          >
            <span className="hidden sm:inline">Register Batch</span>
            <span className="sm:hidden">New</span>
          </Button>
        )}
        {activeUser.role === 'recipient' && (
          <Button
            size="sm"
            variant="accent"
            onClick={() => onNavigate('/recipient/offers')}
            icon={<Building2 className="w-3.5 h-3.5" />}
          >
            <span className="hidden sm:inline">Incoming Offers</span>
            <span className="sm:hidden">Offers</span>
          </Button>
        )}
        {activeUser.role === 'operator' && (
          <Button
            size="sm"
            variant="accent"
            onClick={() => onNavigate('/operator/pickup-queue')}
            icon={<Truck className="w-3.5 h-3.5" />}
          >
            <span className="hidden sm:inline">Pickup Queue</span>
            <span className="sm:hidden">Queue</span>
          </Button>
        )}
        {activeUser.role === 'admin' && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onNavigate('/settings')}
            icon={<Sliders className="w-3.5 h-3.5" />}
          >
            <span className="hidden sm:inline">Configuration</span>
            <span className="sm:hidden">Config</span>
          </Button>
        )}
      </div>
    </header>
  );
};
