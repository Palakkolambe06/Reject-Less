import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { DemoUser } from '../../types/user';

interface AppLayoutProps {
  children: React.ReactNode;
  currentPath: string;
  activeUser: DemoUser | null;
  isAuthenticated: boolean;
  onSelectUser: (user: DemoUser) => void;
  onNavigate: (path: string) => void;
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
  onSignOut: () => void;
  onRefreshData?: () => void;
  showDemoNotice?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  currentPath,
  activeUser,
  isAuthenticated,
  onSelectUser,
  onNavigate,
  onOpenAuth,
  onSignOut,
  showDemoNotice = true,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 antialiased selection:bg-emerald-500/20 selection:text-emerald-950">
      {/* Horizontal Top Navbar */}
      <Navbar
        currentPath={currentPath}
        activeUser={activeUser}
        isAuthenticated={isAuthenticated}
        onNavigate={onNavigate}
        onSelectUser={onSelectUser}
        onOpenAuth={onOpenAuth}
        onSignOut={onSignOut}
      />

      {/* Unobtrusive Workspace / Demo Environment Sub-Banner */}
      {showDemoNotice && isAuthenticated && activeUser && (
        <div className="bg-emerald-50/80 border-b border-emerald-200/60 px-4 sm:px-6 py-2 text-xs text-emerald-950 flex items-center justify-between shrink-0">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-[11px] leading-tight truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0 animate-pulse" />
              <span className="truncate">
                <strong className="font-bold uppercase tracking-wider text-[10px] text-emerald-900 font-mono">
                  {activeUser.role} Workspace:
                </strong>{' '}
                {activeUser.name} · {activeUser.organization}
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => onNavigate('/settings')}
                className="text-emerald-800 hover:text-emerald-950 font-semibold underline text-[11px] cursor-pointer"
              >
                Inference Config
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Viewport Content Canvas */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {children}
      </main>

      {/* Clean Platform Footer */}
      <Footer onNavigate={onNavigate} />
    </div>
  );
};
