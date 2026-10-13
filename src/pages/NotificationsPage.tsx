import React, { useState, useEffect } from 'react';
import { AppNotification } from '../types/notification';
import { DemoUser } from '../types/user';
import { notificationService } from '../services/notificationService';
import { formatDateTime } from '../utils/dateFormat';
import {
  Bell,
  CheckCircle2,
  Inbox,
  AlertTriangle,
  Calendar,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface NotificationsPageProps {
  activeUser: DemoUser;
  onNavigate: (path: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({
  activeUser,
  onNavigate,
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const loadNotifs = async () => {
    const list = await notificationService.getForRole(
      activeUser.role,
      activeUser.recipientFacilityId
    );
    setNotifications(list);
  };

  useEffect(() => {
    loadNotifs();
  }, [activeUser]);

  const handleMarkRead = async (id: string, actionPath?: string) => {
    await notificationService.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    if (actionPath) onNavigate(actionPath);
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead(
      activeUser.role,
      activeUser.recipientFacilityId
    );
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'offer':
        return <Inbox className="w-4 h-4 text-sky-600" />;
      case 'schedule':
        return <Calendar className="w-4 h-4 text-amber-600" />;
      case 'handover':
        return <Clock className="w-4 h-4 text-teal-600" />;
      case 'rejection':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'outcome':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Role Notifications Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time event alerts targeted to the active {activeUser.role} workspace ({activeUser.organization})
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllRead}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Mark All as Read
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            filter === 'all'
              ? 'border-emerald-800 text-emerald-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          All Alerts ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            filter === 'unread'
              ? 'border-emerald-800 text-emerald-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Unread Only ({notifications.filter((n) => !n.isRead).length})
        </button>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-2">
          <Bell className="w-8 h-8 mx-auto text-slate-300" />
          <h4 className="text-xs font-bold text-slate-700">No Notifications</h4>
          <p className="text-xs text-slate-400">
            {filter === 'unread' ? 'All notifications have been reviewed.' : 'No alerts logged yet for this role.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => (
            <div
              key={n.id}
              onClick={() => handleMarkRead(n.id, n.actionPath)}
              className={`bg-white p-4 sm:p-5 rounded-xl border transition-all cursor-pointer shadow-2xs flex items-start gap-3.5 group ${
                !n.isRead
                  ? 'border-emerald-300 bg-emerald-50/20 hover:bg-emerald-50/40 ring-1 ring-emerald-200'
                  : 'border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 mt-0.5 shrink-0">
                {getIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                    {n.title}
                  </h4>
                  <span className="font-mono text-[10px] text-slate-400 tabular-nums shrink-0">
                    {formatDateTime(n.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                {n.actionPath && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 mt-2 group-hover:underline">
                    <span>Take Action</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
