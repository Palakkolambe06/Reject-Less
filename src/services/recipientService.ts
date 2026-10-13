import { Recipient } from '../types/recipient';
import { storageService } from './storageService';

class RecipientService {
  public async getAll(): Promise<Recipient[]> {
    return storageService.getRecipients();
  }

  public async getActive(): Promise<Recipient[]> {
    const all = await this.getAll();
    return all.filter((r) => r.isActive);
  }

  public async getById(id: string): Promise<Recipient | null> {
    return storageService.getRecipientById(id);
  }

  public async save(recipient: Recipient): Promise<Recipient> {
    const all = await this.getAll();
    const idx = all.findIndex((r) => r.id === recipient.id);
    if (idx >= 0) {
      all[idx] = recipient;
    } else {
      all.push(recipient);
    }
    await storageService.saveRecipients(all);
    return recipient;
  }
}

export const recipientService = new RecipientService();
