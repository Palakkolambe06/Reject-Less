import { UserRole } from './user';

export type NotificationType = 'offer' | 'schedule' | 'handover' | 'outcome' | 'rejection' | 'system';

export interface AppNotification {
  id: string;
  targetRole: UserRole | 'all';
  targetRecipientId?: string; // If targeting a specific recipient
  targetBatchId?: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  isRead: boolean;
  actionPath?: string;
}
