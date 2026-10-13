import { AppNotification } from '../types/notification';
import { UserRole } from '../types/user';
import { storageService } from './storageService';

class NotificationService {
  public async getForRole(role: UserRole, recipientFacilityId?: string): Promise<AppNotification[]> {
    const all = await storageService.getNotifications();
    return all.filter((n) => {
      if (n.targetRole === 'all') return true;
      if (n.targetRole !== role) return false;
      if (role === 'recipient' && recipientFacilityId && n.targetRecipientId) {
        return n.targetRecipientId === recipientFacilityId;
      }
      return true;
    });
  }

  public async getUnreadCount(role: UserRole, recipientFacilityId?: string): Promise<number> {
    const notifs = await this.getForRole(role, recipientFacilityId);
    return notifs.filter((n) => !n.isRead).length;
  }

  public async markAsRead(id: string): Promise<void> {
    await storageService.markNotificationRead(id);
  }

  public async markAllAsRead(role: UserRole, recipientFacilityId?: string): Promise<void> {
    const notifs = await storageService.getNotifications();
    for (const n of notifs) {
      if (n.targetRole === role || n.targetRole === 'all') {
        if (!recipientFacilityId || !n.targetRecipientId || n.targetRecipientId === recipientFacilityId) {
          n.isRead = true;
        }
      }
    }
    await storageService.saveNotifications(notifs);
  }
}

export const notificationService = new NotificationService();
