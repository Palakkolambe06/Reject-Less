import React, { useState, useEffect, useRef } from 'react';
import { DemoUser, DEMO_USERS, UserRole } from '../../types/user';
import { AppNotification } from '../../types/notification';
import { notificationService } from '../../services/notificationService';
import { storageService } from '../../services/storageService';
import { Button } from '../ui/Button';
import {
  Leaf,
  Bell,
  Menu,
  X,
  ChevronDown,
  User,
  Building2,
  Truck,
  ShieldAlert,
  LogOut,
  Sparkles,
  PackageCheck,
  CheckSquare,
  History,
  Scale,
  CheckCircle2,
  CheckCheck,
  PlusCircle,
  Inbox,
  LogIn,
  UserPlus,
} from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  activeUser: DemoUser | null;
  isAuthenticated: boolean;
  onNavigate: (path: string) => void;
  onSelectUser: (user: DemoUser) => void;
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPath,
  activeUser,
  isAuthenticated,
  onNavigate,
  onSelectUser,
  onOpenAuth,
  onSignOut,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeUser && isAuthenticated) {
      const loadNotifs = async () => {
        const list = await notificationService.getForRole(
          activeUser.role,
          activeUser.recipientFacilityId
        );
        setNotifications(list);
        setUnreadCount(list.filter((n) => !n.isRead).length);
      };
      loadNotifs();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [activeUser, isAuthenticated, currentPath]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(e.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
      if (
        notifDropdownRef.current &&
        !notifDropdownRef.current.contains(e.target as Node)
      ) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    if (!activeUser) return;
    await notificationService.markAllAsRead(
      activeUser.role,
      activeUser.recipientFacilityId
    );
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'generator':
        return <Leaf className="w-3.5 h-3.5 text-emerald-700" />;
      case 'recipient':
        return <Building2 className="w-3.5 h-3.5 text-teal-700" />;
      case 'operator':
        return <Truck className="w-3.5 h-3.5 text-indigo-700" />;
      case 'admin':
        return <ShieldAlert className="w-3.5 h-3.5 text-purple-700" />;
    }
  };

  // Nav links for horizontal bar
  const navLinks = [
    { label: 'Home', path: '/home', isPublic: true },
    { label: 'Dashboard', path: '/', isPublic: false },
    { label: 'Identify Waste', path: '/ai-triage', isPublic: true },
    { label: 'Waste Batches', path: '/batches', isPublic: false },
    { label: 'Recipients', path: '/recipients', isPublic: false },
    { label: 'Handover Tracking', path: '/handovers', isPublic: false },
    { label: 'Map View', path: '/map', isPublic: true },
    { label: 'AI Assistant', path: '/assistant', isPublic: true },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Lockup */}
        <div className="flex items-center gap-8 min-w-0">
          <button
            onClick={() => onNavigate(isAuthenticated ? '/' : '/home')}
            className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 rounded-lg shrink-0"
            title="RejectLess — Turn Waste Into a Resource"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-700 to-teal-800 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Leaf className="w-5 h-5 text-emerald-200" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-slate-900 tracking-tight leading-none group-hover:text-emerald-800 transition-colors">
                RejectLess
              </span>
              <span className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
                Waste Readiness & Matching
              </span>
            </div>
          </button>

          {/* Desktop Horizontal Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              if (!link.isPublic && !isAuthenticated) return null;
              const isActive =
                link.path === '/'
                  ? currentPath === '/' || currentPath === ''
                  : currentPath.startsWith(link.path);

              return (
                <button
                  key={link.path}
                  onClick={() => onNavigate(link.path)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200/80 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}

            {/* Role specific quick jump tabs when logged in */}
            {isAuthenticated && activeUser?.role === 'generator' && (
              <button
                onClick={() => onNavigate('/readiness')}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  currentPath.startsWith('/readiness')
                    ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200/80'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Readiness Checks
              </button>
            )}
            {isAuthenticated && activeUser?.role === 'recipient' && (
              <button
                onClick={() => onNavigate('/recipient/offers')}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  currentPath.startsWith('/recipient/offers')
                    ? 'bg-teal-50 text-teal-900 font-bold border border-teal-200/80'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Incoming Offers
              </button>
            )}
            {isAuthenticated && activeUser?.role === 'operator' && (
              <button
                onClick={() => onNavigate('/operator/pickup-queue')}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  currentPath.startsWith('/operator/pickup-queue')
                    ? 'bg-indigo-50 text-indigo-900 font-bold border border-indigo-200/80'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Pickup Queue
              </button>
            )}
          </nav>
        </div>

        {/* Right Action Controls: Auth, Notifications, Profile & Primary CTA */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* When Logged Out: Sign In & Sign Up buttons */}
          {!isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenAuth('signin')}
                icon={<LogIn className="w-3.5 h-3.5" />}
              >
                Sign In
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onOpenAuth('signup')}
                icon={<UserPlus className="w-3.5 h-3.5" />}
              >
                Create Account
              </Button>
            </div>
          ) : (
            /* When Logged In: Notifications, Role Badge, User Avatar */
            <>
              {/* Notifications Menu */}
              <div className="relative" ref={notifDropdownRef}>
                <button
                  onClick={() => {
                    setNotifDropdownOpen(!notifDropdownOpen);
                    setUserDropdownOpen(false);
                  }}
                  className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer relative focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                  title="Notifications"
                  aria-label="View notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-600 rounded-full ring-2 ring-white" />
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notifDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 text-slate-800 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          Workspace Notifications
                        </h4>
                        <div className="text-[11px] text-slate-500">
                          Targeted alerts for {activeUser?.role} role
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
                              setNotifDropdownOpen(false);
                            }}
                            className={`p-3.5 text-xs hover:bg-slate-50 cursor-pointer transition-colors ${
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

              {/* User Profile & Role Switcher Menu */}
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => {
                    setUserDropdownOpen(!userDropdownOpen);
                    setNotifDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-xl border border-slate-200/90 bg-slate-50/80 hover:bg-slate-100 text-xs font-medium cursor-pointer transition-all shadow-2xs text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                  title="Account and role switcher"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-900 text-emerald-200 font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                    {activeUser?.avatarInitial || 'US'}
                  </div>
                  <div className="text-left hidden sm:block">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 block leading-tight font-mono">
                      {activeUser?.role}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-900 block truncate max-w-[110px]">
                      {activeUser?.name.split(' ')[0]}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
                </button>

                {/* Profile Dropdown */}
                {userDropdownOpen && activeUser && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 text-slate-800 animate-in fade-in zoom-in-95 duration-100">
                    {/* User Profile Header */}
                    <div className="px-4 py-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-900 text-emerald-100 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                          {activeUser.avatarInitial}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-slate-900 truncate">
                            {activeUser.name}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">
                            {activeUser.email || `${activeUser.role}@rejectless.demo`}
                          </div>
                          <div className="text-[10px] text-emerald-800 font-medium truncate mt-0.5">
                            {activeUser.organization}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Switch Demo Roles Section */}
                    <div className="px-4 py-2 border-b border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                        Quick Demo Role Switching
                      </span>
                    </div>

                    <div className="max-h-60 overflow-y-auto py-1 divide-y divide-slate-50">
                      {DEMO_USERS.map((user) => {
                        const isSelected = user.id === activeUser.id;
                        return (
                          <button
                            key={user.id}
                            onClick={() => {
                              onSelectUser(user);
                              setUserDropdownOpen(false);
                            }}
                            className={`w-full px-4 py-2 text-left text-xs flex items-center justify-between transition-colors cursor-pointer hover:bg-slate-50 ${
                              isSelected ? 'bg-emerald-50/70 font-semibold' : ''
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {getRoleIcon(user.role)}
                              <div className="truncate">
                                <div className="text-slate-900 font-medium truncate text-xs">
                                  {user.name}
                                </div>
                                <div className="text-[10px] text-slate-500 truncate capitalize">
                                  {user.role} · {user.organization.split(' ')[0]}
                                </div>
                              </div>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Footer sign out action */}
                    <div className="pt-2 px-2 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onSignOut();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out of Session</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Primary Role Action */}
              {activeUser?.role === 'generator' && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => onNavigate('/create-batch')}
                  icon={<PlusCircle className="w-3.5 h-3.5" />}
                  className="hidden md:inline-flex"
                >
                  Create Batch
                </Button>
              )}
              {activeUser?.role === 'recipient' && (
                <Button
                  size="sm"
                  variant="accent"
                  onClick={() => onNavigate('/recipient/offers')}
                  icon={<Inbox className="w-3.5 h-3.5" />}
                  className="hidden md:inline-flex"
                >
                  Incoming Offers
                </Button>
              )}
              {activeUser?.role === 'operator' && (
                <Button
                  size="sm"
                  variant="accent"
                  onClick={() => onNavigate('/operator/pickup-queue')}
                  icon={<Truck className="w-3.5 h-3.5" />}
                  className="hidden md:inline-flex"
                >
                  Pickup Queue
                </Button>
              )}
            </>
          )}

          {/* Mobile Navigation Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 shadow-lg animate-in slide-in-from-top-2">
          <nav className="space-y-1">
            {navLinks.map((link) => {
              if (!link.isPublic && !isAuthenticated) return null;
              const isActive =
                link.path === '/'
                  ? currentPath === '/' || currentPath === ''
                  : currentPath.startsWith(link.path);
              return (
                <button
                  key={link.path}
                  onClick={() => {
                    onNavigate(link.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center px-3 py-2 text-xs font-semibold rounded-lg text-left transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Workspace specific routes in mobile */}
          {isAuthenticated && activeUser && (
            <div className="pt-2 border-t border-slate-100 space-y-1">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                {activeUser.role} shortcuts
              </div>
              {activeUser.role === 'generator' && (
                <>
                  <button
                    onClick={() => {
                      onNavigate('/create-batch');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded"
                  >
                    + Register Waste Batch
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('/readiness');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded"
                  >
                    Readiness Verification Gate
                  </button>
                </>
              )}
              {activeUser.role === 'recipient' && (
                <>
                  <button
                    onClick={() => {
                      onNavigate('/recipient/offers');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded"
                  >
                    Review Incoming Offers
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('/recipient/receipt-confirmation');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded"
                  >
                    Dock Receipt Confirmation
                  </button>
                </>
              )}
              {activeUser.role === 'operator' && (
                <button
                  onClick={() => {
                    onNavigate('/operator/pickup-queue');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded"
                >
                  Driver Pickup Queue
                </button>
              )}
            </div>
          )}

          {!isAuthenticated && (
            <div className="pt-2 border-t border-slate-100 flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth('signin');
                }}
              >
                Sign In
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth('signup');
                }}
              >
                Create Account
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
