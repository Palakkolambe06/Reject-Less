import { RecipientOffer, RejectionReasonOption } from '../types/offer';
import { WasteBatch, StatusHistoryEvent } from '../types/batch';
import { Recipient } from '../types/recipient';
import { DemoUser } from '../types/user';
import { storageService } from './storageService';
import { batchService } from './batchService';
import { AppNotification } from '../types/notification';

class OfferService {
  public async getAll(): Promise<RecipientOffer[]> {
    return storageService.getOffers();
  }

  public async getById(id: string): Promise<RecipientOffer | null> {
    const offers = await this.getAll();
    return offers.find((o) => o.id === id) || null;
  }

  public async getForRecipient(recipientId: string): Promise<RecipientOffer[]> {
    const offers = await this.getAll();
    return offers.filter((o) => o.recipientId === recipientId);
  }

  public async getForBatch(batchId: string): Promise<RecipientOffer[]> {
    const offers = await this.getAll();
    return offers.filter((o) => o.batchId === batchId);
  }

  /**
   * Generator submits an offer to an eligible recipient
   */
  public async submitOffer(
    batch: WasteBatch,
    recipient: Recipient,
    notes?: string,
    operator: string = 'Generator'
  ): Promise<{ success: boolean; offer?: RecipientOffer; error?: string }> {
    if (batch.status !== 'READY') {
      return {
        success: false,
        error: `Batch must be in 'READY' status to send an offer. Currently '${batch.status}'.`,
      };
    }

    const offerId = `OFFER-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const offer: RecipientOffer = {
      id: offerId,
      batchId: batch.id,
      recipientId: recipient.id,
      recipientName: recipient.name,
      generatorName: batch.generatorName,
      materialCategory: batch.materialCategory,
      quantity: batch.quantity,
      unit: batch.unit,
      offeredAt: now,
      status: 'PENDING',
      notes: notes || undefined,
    };

    await storageService.saveOffer(offer);

    // Update batch to OFFERED
    const historyEvent: StatusHistoryEvent = {
      id: `EVT-${Date.now()}`,
      status: 'OFFERED',
      timestamp: now,
      performedBy: operator,
      role: 'generator',
      notes: `Offer ${offerId} submitted to ${recipient.name}. Awaiting recipient response.`,
    };

    const updatedBatch: WasteBatch = {
      ...batch,
      status: 'OFFERED',
      activeOfferId: offerId,
      matchedRecipientId: recipient.id,
      statusHistory: [...batch.statusHistory, historyEvent],
      updatedAt: now,
    };

    await batchService.updateBatch(updatedBatch);

    // Create notification for recipient
    const notif: AppNotification = {
      id: `NOTIF-${Date.now()}`,
      targetRole: 'recipient',
      targetRecipientId: recipient.id,
      targetBatchId: batch.id,
      title: 'New Recyclable Waste Offer',
      message: `${batch.generatorName} sent an offer for ${batch.quantity} ${batch.unit} of ${batch.materialCategory}.`,
      type: 'offer',
      timestamp: now,
      isRead: false,
      actionPath: '/recipient/offers',
    };

    await storageService.addNotification(notif);

    return { success: true, offer };
  }

  /**
   * Recipient accepts an incoming offer
   */
  public async acceptOffer(
    offerId: string,
    recipientUser: DemoUser,
    proposedPickupDate?: string
  ): Promise<{ success: boolean; offer?: RecipientOffer; error?: string }> {
    const offer = await this.getById(offerId);
    if (!offer) {
      return { success: false, error: 'Offer not found.' };
    }
    if (offer.status !== 'PENDING') {
      return { success: false, error: `Offer is already ${offer.status}.` };
    }

    // Role security check
    if (recipientUser.role === 'recipient' && recipientUser.recipientFacilityId) {
      if (recipientUser.recipientFacilityId !== offer.recipientId) {
        return {
          success: false,
          error: `Permission Denied: Offer is addressed to ${offer.recipientName}, not your active facility.`,
        };
      }
    }

    const now = new Date().toISOString();
    const updatedOffer: RecipientOffer = {
      ...offer,
      status: 'ACCEPTED',
      respondedAt: now,
      respondedBy: recipientUser.name,
      proposedPickupDate: proposedPickupDate || undefined,
    };

    await storageService.saveOffer(updatedOffer);

    // Update batch to ACCEPTED
    const batch = await batchService.getById(offer.batchId);
    if (batch) {
      const historyEvent: StatusHistoryEvent = {
        id: `EVT-${Date.now()}`,
        status: 'ACCEPTED',
        timestamp: now,
        performedBy: recipientUser.name,
        role: 'recipient',
        notes: `Offer accepted by ${offer.recipientName}.${proposedPickupDate ? ` Proposed pickup: ${proposedPickupDate}` : ''}`,
      };

      const updatedBatch: WasteBatch = {
        ...batch,
        status: 'ACCEPTED',
        matchedRecipientId: offer.recipientId,
        scheduledHandoverDate: proposedPickupDate || batch.scheduledHandoverDate,
        statusHistory: [...batch.statusHistory, historyEvent],
        updatedAt: now,
      };

      await batchService.updateBatch(updatedBatch);

      // Notifications for generator and operator
      await storageService.addNotification({
        id: `NOTIF-${Date.now()}-1`,
        targetRole: 'generator',
        targetBatchId: batch.id,
        title: 'Offer Accepted by Recipient',
        message: `${offer.recipientName} accepted your offer for batch ${batch.id}.`,
        type: 'offer',
        timestamp: now,
        isRead: false,
        actionPath: '/handovers',
      });

      await storageService.addNotification({
        id: `NOTIF-${Date.now()}-2`,
        targetRole: 'operator',
        targetBatchId: batch.id,
        title: 'Accepted Load Ready for Dispatch',
        message: `Batch ${batch.id} (${batch.quantity} ${batch.unit} of ${batch.materialCategory}) accepted by ${offer.recipientName}. Coordination required.`,
        type: 'schedule',
        timestamp: now,
        isRead: false,
        actionPath: '/operator/pickup-queue',
      });
    }

    return { success: true, offer: updatedOffer };
  }

  /**
   * Recipient rejects an incoming offer BEFORE acceptance
   */
  public async rejectOffer(
    offerId: string,
    recipientUser: DemoUser,
    reason: RejectionReasonOption | string,
    explanation?: string
  ): Promise<{ success: boolean; offer?: RecipientOffer; error?: string }> {
    const offer = await this.getById(offerId);
    if (!offer) {
      return { success: false, error: 'Offer not found.' };
    }
    if (offer.status !== 'PENDING') {
      return { success: false, error: `Offer is already ${offer.status}.` };
    }

    if (!reason || reason.trim().length === 0) {
      return { success: false, error: 'Mandatory rejection reason is required.' };
    }

    // Role check
    if (recipientUser.role === 'recipient' && recipientUser.recipientFacilityId) {
      if (recipientUser.recipientFacilityId !== offer.recipientId) {
        return {
          success: false,
          error: `Permission Denied: Offer is addressed to ${offer.recipientName}, not your active facility.`,
        };
      }
    }

    const now = new Date().toISOString();
    const updatedOffer: RecipientOffer = {
      ...offer,
      status: 'REJECTED',
      respondedAt: now,
      respondedBy: recipientUser.name,
      rejectionReason: reason,
      rejectionExplanation: explanation || undefined,
      rejectionStage: 'BEFORE_ACCEPTANCE',
    };

    await storageService.saveOffer(updatedOffer);

    // Update batch to REJECTED (at BEFORE_ACCEPTANCE stage)
    const batch = await batchService.getById(offer.batchId);
    if (batch) {
      const historyEvent: StatusHistoryEvent = {
        id: `EVT-${Date.now()}`,
        status: 'REJECTED',
        timestamp: now,
        performedBy: recipientUser.name,
        role: 'recipient',
        stage: 'BEFORE_ACCEPTANCE',
        reason: `${reason}${explanation ? `: ${explanation}` : ''}`,
        notes: `Offer declined prior to collection. Reason: ${reason}.`,
      };

      const updatedBatch: WasteBatch = {
        ...batch,
        status: 'REJECTED',
        rejectionReason: reason,
        rejectionStage: 'BEFORE_ACCEPTANCE',
        correctiveFeedback: explanation || `Recipient declined due to: ${reason}. Review batch parameters and re-sort.`,
        statusHistory: [...batch.statusHistory, historyEvent],
        updatedAt: now,
      };

      await batchService.updateBatch(updatedBatch);

      // Notification for generator
      await storageService.addNotification({
        id: `NOTIF-${Date.now()}`,
        targetRole: 'generator',
        targetBatchId: batch.id,
        title: 'Offer Declined by Recipient',
        message: `${offer.recipientName} declined your offer for batch ${batch.id}. Reason: ${reason}.`,
        type: 'rejection',
        timestamp: now,
        isRead: false,
        actionPath: '/history',
      });
    }

    return { success: true, offer: updatedOffer };
  }
}

export const offerService = new OfferService();
