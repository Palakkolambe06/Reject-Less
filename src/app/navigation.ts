import { UserRole } from '../types/user';

export interface NavItem {
  id: string;
  label: string;
  path: string;
  iconName: string;
  badgeCount?: number;
}

export function getNavigationForRole(role: UserRole): NavItem[] {
  switch (role) {
    case 'generator':
      return [
        { id: 'gen-dash', label: 'Dashboard', path: '/', iconName: 'LayoutDashboard' },
        { id: 'gen-create', label: 'Register Batch', path: '/create-batch', iconName: 'PlusCircle' },
        { id: 'gen-batches', label: 'Waste Batches', path: '/batches', iconName: 'PackageCheck' },
        { id: 'gen-ai', label: 'AI Material Triage', path: '/ai-triage', iconName: 'Sparkles' },
        { id: 'gen-readiness', label: 'Readiness Gate', path: '/readiness', iconName: 'CheckSquare' },
        { id: 'gen-matches', label: 'Recipient Matches', path: '/recipients', iconName: 'Building2' },
        { id: 'gen-handovers', label: 'Handover Tracking', path: '/handovers', iconName: 'Truck' },
        { id: 'gen-notifs', label: 'Notifications', path: '/notifications', iconName: 'Bell' },
        { id: 'gen-history', label: 'History & Rejections', path: '/history', iconName: 'History' },
      ];
    case 'recipient':
      return [
        { id: 'rec-dash', label: 'Dashboard', path: '/', iconName: 'LayoutDashboard' },
        { id: 'rec-offers', label: 'Incoming Offers', path: '/recipient/offers', iconName: 'Inbox' },
        { id: 'rec-accepted', label: 'Accepted Offers', path: '/recipient/accepted', iconName: 'CheckCircle2' },
        { id: 'rec-schedule', label: 'Collection Schedule', path: '/recipient/schedule', iconName: 'Calendar' },
        { id: 'rec-requirements', label: 'Intake Criteria', path: '/recipient/requirements', iconName: 'Sliders' },
        { id: 'rec-receipt', label: 'Receipt Confirmation', path: '/recipient/receipt-confirmation', iconName: 'Scale' },
        { id: 'rec-rejected', label: 'Rejected Loads', path: '/recipient/rejected', iconName: 'AlertTriangle' },
        { id: 'rec-history', label: 'Decision History', path: '/history', iconName: 'History' },
        { id: 'rec-profile', label: 'Settings', path: '/settings', iconName: 'Building' },
      ];
    case 'operator':
      return [
        { id: 'op-dash', label: 'Fleet Dashboard', path: '/', iconName: 'LayoutDashboard' },
        { id: 'op-queue', label: 'Pickup Queue', path: '/operator/pickup-queue', iconName: 'Inbox' },
        { id: 'op-schedule', label: 'Dispatch Schedule', path: '/operator/schedule', iconName: 'Calendar' },
        { id: 'op-active', label: 'Active Handovers', path: '/operator/active', iconName: 'Truck' },
        { id: 'op-evidence', label: 'Verification & Receipts', path: '/operator/evidence', iconName: 'ShieldCheck' },
        { id: 'op-exceptions', label: 'Exceptions & Delays', path: '/operator/exceptions', iconName: 'AlertCircle' },
        { id: 'op-completed', label: 'Completed Deliveries', path: '/operator/completed', iconName: 'CheckSquare' },
        { id: 'op-audit', label: 'Audit Trail', path: '/history', iconName: 'History' },
      ];
    case 'admin':
      return [
        { id: 'adm-dash', label: 'Operations Overview', path: '/', iconName: 'LayoutDashboard' },
        { id: 'adm-batches', label: 'All Batches', path: '/batches', iconName: 'PackageCheck' },
        { id: 'adm-recipients', label: 'Recipient Directory', path: '/recipients', iconName: 'Building2' },
        { id: 'adm-offers', label: 'All Offers', path: '/recipient/offers', iconName: 'Inbox' },
        { id: 'adm-handovers', label: 'All Handovers', path: '/handovers', iconName: 'Truck' },
        { id: 'adm-history', label: 'Audit Trail', path: '/history', iconName: 'History' },
        { id: 'adm-settings', label: 'System Configuration', path: '/settings', iconName: 'Sliders' },
      ];
  }
}
