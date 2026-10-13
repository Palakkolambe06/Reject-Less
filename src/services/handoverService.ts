import { WasteBatch, BatchStatus, StatusHistoryEvent } from '../types/batch';
import { HandoverScheduleData, HandoverOutcomeData, DispatchProgressData } from '../types/handover';
import { DemoUser } from '../types/user';
import { convertQuantityToKg } from './matchingService';

const VALID_STATUS_TRANSITIONS: Record<BatchStatus, BatchStatus[]> = {
  DRAFT: ['PREPARATION', 'READY'],
  PREPARATION: ['READY', 'DRAFT'],
  READY: ['MATCHED', 'OFFERED', 'PREPARATION'],
  MATCHED: ['OFFERED', 'SCHEDULED', 'READY'],
  OFFERED: ['ACCEPTED', 'REJECTED'],
  ACCEPTED: ['SCHEDULED', 'OFFERED'],
  SCHEDULED: ['PICKED UP', 'HANDED OVER', 'ACCEPTED', 'REJECTED'],
  'PICKED UP': ['HANDED OVER', 'REJECTED'],
  'HANDED OVER': ['RECEIVED', 'REJECTED'],
  RECEIVED: [],
  REJECTED: ['PREPARATION'], // Re-open for re-sorting
};

class HandoverService {
  public canTransition(currentStatus: BatchStatus, targetStatus: BatchStatus): boolean {
    return VALID_STATUS_TRANSITIONS[currentStatus]?.includes(targetStatus) || false;
  }

  /**
   * Schedule handover / dispatch (called by logistics operator or agreed on offer accept)
   */
  public scheduleHandover(
    batch: WasteBatch,
    scheduleData: HandoverScheduleData,
    operator: string = 'Fleet Dispatcher'
  ): { success: boolean; batch?: WasteBatch; error?: string } {
    if (batch.status !== 'ACCEPTED' && batch.status !== 'READY') {
      return {
        success: false,
        error: `Cannot schedule handover for a batch in '${batch.status}' status. Offer must be ACCEPTED first.`,
      };
    }

    if (!scheduleData.scheduledDate) {
      return { success: false, error: 'Pickup / handover date is required.' };
    }

    const eventId = `EVT-${Date.now()}`;
    const newEvent: StatusHistoryEvent = {
      id: eventId,
      status: 'SCHEDULED',
      timestamp: new Date().toISOString(),
      performedBy: operator,
      role: 'operator',
      notes: scheduleData.handoverNotes || `Collection scheduled for ${scheduleData.scheduledDate}.`,
    };

    const updatedBatch: WasteBatch = {
      ...batch,
      status: 'SCHEDULED',
      matchedRecipientId: scheduleData.recipientId || batch.matchedRecipientId,
      assignedOperatorId: scheduleData.assignedOperatorId || batch.assignedOperatorId,
      assignedOperatorName: scheduleData.assignedOperatorName || batch.assignedOperatorName,
      scheduledHandoverDate: scheduleData.scheduledDate,
      handoverNotes: scheduleData.handoverNotes,
      statusHistory: [...batch.statusHistory, newEvent],
      updatedAt: new Date().toISOString(),
    };

    return { success: true, batch: updatedBatch };
  }

  /**
   * Logistics driver picks up batch from generator loading bay
   */
  public markPickedUp(
    batch: WasteBatch,
    driverName: string = 'Vikram Shinde',
    vehicleRef?: string,
    notes?: string
  ): { success: boolean; batch?: WasteBatch; error?: string } {
    if (batch.status !== 'SCHEDULED') {
      return {
        success: false,
        error: `Batch must be in 'SCHEDULED' state before driver pickup. Currently '${batch.status}'.`,
      };
    }

    const now = new Date().toISOString();
    const newEvent: StatusHistoryEvent = {
      id: `EVT-${Date.now()}`,
      status: 'PICKED UP',
      timestamp: now,
      performedBy: driverName,
      role: 'operator',
      notes: `Waste loaded onto vehicle ${vehicleRef || 'MH-12-FC-4491'}. Manifest signed by generator. ${notes || ''}`,
    };

    const updatedBatch: WasteBatch = {
      ...batch,
      status: 'PICKED UP',
      pickupTimestamp: now,
      generatorHandoverConfirmed: true,
      generatorHandoverConfirmedAt: now,
      statusHistory: [...batch.statusHistory, newEvent],
      updatedAt: now,
    };

    return { success: true, batch: updatedBatch };
  }

  /**
   * Driver arrives and unloads at recipient dock
   */
  public markHandedOver(
    batch: WasteBatch,
    driverName: string = 'Vikram Shinde',
    notes?: string
  ): { success: boolean; batch?: WasteBatch; error?: string } {
    if (batch.status !== 'PICKED UP' && batch.status !== 'SCHEDULED') {
      return {
        success: false,
        error: `Batch must be 'PICKED UP' before marking as handed over. Currently '${batch.status}'.`,
      };
    }

    const now = new Date().toISOString();
    const newEvent: StatusHistoryEvent = {
      id: `EVT-${Date.now()}`,
      status: 'HANDED OVER',
      timestamp: now,
      performedBy: driverName,
      role: 'operator',
      notes: `Delivered and physically staged at recipient intake dock. ${notes || 'Awaiting recipient quality inspection & weighbridge slip.'}`,
    };

    const updatedBatch: WasteBatch = {
      ...batch,
      status: 'HANDED OVER',
      handoverTimestamp: now,
      statusHistory: [...batch.statusHistory, newEvent],
      updatedAt: now,
    };

    return { success: true, batch: updatedBatch };
  }

  /**
   * Generator verifies physical transfer
   */
  public confirmGeneratorHandover(
    batch: WasteBatch,
    generatorUser: DemoUser
  ): { success: boolean; batch?: WasteBatch } {
    const now = new Date().toISOString();
    const event: StatusHistoryEvent = {
      id: `EVT-${Date.now()}`,
      status: batch.status,
      timestamp: now,
      performedBy: generatorUser.name,
      role: 'generator',
      notes: 'Waste generator confirmed physical transfer to logistics driver.',
    };

    const updated: WasteBatch = {
      ...batch,
      generatorHandoverConfirmed: true,
      generatorHandoverConfirmedAt: now,
      statusHistory: [...batch.statusHistory, event],
      updatedAt: now,
    };

    return { success: true, batch: updated };
  }

  /**
   * Recipient inspects physical delivery at receiving dock and confirms RECEIPT
   */
  public confirmRecipientReceipt(
    batch: WasteBatch,
    recipientUser: DemoUser,
    data: {
      actualQuantityKg: number;
      evidenceReference: string;
      notes?: string;
    }
  ): { success: boolean; batch?: WasteBatch; error?: string } {
    if (batch.status !== 'HANDED OVER') {
      return {
        success: false,
        error: `Batch must be in 'HANDED OVER' state before recipient receipt confirmation. Currently '${batch.status}'.`,
      };
    }

    // Role check: Only recipient can confirm receipt
    if (recipientUser.role === 'recipient' && recipientUser.recipientFacilityId) {
      if (batch.matchedRecipientId && recipientUser.recipientFacilityId !== batch.matchedRecipientId) {
        return {
          success: false,
          error: 'Permission Denied: Only the designated recipient can confirm receipt of this load.',
        };
      }
    }

    if (!data.evidenceReference || data.evidenceReference.trim().length === 0) {
      return { success: false, error: 'A weighbridge slip or gatepass reference is required.' };
    }

    const declaredKg = convertQuantityToKg(batch.quantity, batch.unit);
    const discrepancyKg = Math.round((data.actualQuantityKg - declaredKg) * 10) / 10;
    const now = new Date().toISOString();

    const newEvent: StatusHistoryEvent = {
      id: `EVT-${Date.now()}`,
      status: 'RECEIVED',
      timestamp: now,
      performedBy: recipientUser.name,
      role: 'recipient',
      notes: `Batch approved at weighbridge (${data.evidenceReference}). Verified net weight: ${data.actualQuantityKg} kg (declared: ${declaredKg} kg, delta: ${discrepancyKg > 0 ? `+${discrepancyKg}` : discrepancyKg} kg). ${data.notes || ''}`,
    };

    const updatedBatch: WasteBatch = {
      ...batch,
      status: 'RECEIVED',
      recipientReceivedConfirmed: true,
      recipientReceivedConfirmedAt: now,
      actualReceivedQuantity: data.actualQuantityKg,
      discrepancyKg,
      discrepancyNotes: discrepancyKg !== 0 ? `Scale variance of ${discrepancyKg} kg observed.` : undefined,
      evidenceReference: data.evidenceReference,
      statusHistory: [...batch.statusHistory, newEvent],
      updatedAt: now,
    };

    return { success: true, batch: updatedBatch };
  }

  /**
   * Recipient REJECTS load after physical dock inspection
   */
  public rejectPostInspection(
    batch: WasteBatch,
    recipientUser: DemoUser,
    data: {
      rejectionReason: string;
      correctiveFeedback: string;
      evidenceReference?: string;
      notes?: string;
    }
  ): { success: boolean; batch?: WasteBatch; error?: string } {
    if (batch.status !== 'HANDED OVER' && batch.status !== 'PICKED UP') {
      return {
        success: false,
        error: `Load can only be rejected post-inspection when handed over at dock. Current status: '${batch.status}'.`,
      };
    }

    if (!data.rejectionReason || data.rejectionReason.trim().length < 4) {
      return { success: false, error: 'A specific rejection reason is mandatory.' };
    }

    const now = new Date().toISOString();
    const newEvent: StatusHistoryEvent = {
      id: `EVT-${Date.now()}`,
      status: 'REJECTED',
      timestamp: now,
      performedBy: recipientUser.name,
      role: 'recipient',
      stage: 'POST_INSPECTION',
      reason: data.rejectionReason,
      notes: `Load declined upon physical receiving dock inspection. ${data.notes || ''}`,
    };

    // Uncheck relevant checklist items to force generator corrective action
    const updatedChecklist = { ...batch.readinessChecklist };
    updatedChecklist.noOrganicContamination = false;
    updatedChecklist.specialPreparationDone = false;
    if (data.rejectionReason.toLowerCase().includes('moisture') || data.rejectionReason.toLowerCase().includes('wet')) {
      updatedChecklist.isDryAndProtected = false;
    }
    if (data.rejectionReason.toLowerCase().includes('packag') || data.rejectionReason.toLowerCase().includes('bale')) {
      updatedChecklist.packagingMatchesRequirement = false;
    }

    const updatedBatch: WasteBatch = {
      ...batch,
      status: 'REJECTED',
      rejectionReason: data.rejectionReason,
      rejectionStage: 'POST_INSPECTION',
      correctiveFeedback: data.correctiveFeedback,
      evidenceReference: data.evidenceReference || batch.evidenceReference,
      readinessChecklist: updatedChecklist,
      isReadyForMatching: false,
      statusHistory: [...batch.statusHistory, newEvent],
      updatedAt: now,
    };

    return { success: true, batch: updatedBatch };
  }

  /**
   * Universal recordOutcome method (enforcing mandatory rejection reasons & receipt evidence)
   */
  public recordOutcome(
    batch: WasteBatch,
    data: HandoverOutcomeData,
    operator: string = 'Intake Officer'
  ): { success: boolean; batch?: WasteBatch; error?: string } {
    if (data.outcome === 'REJECTED') {
      if (!data.rejectionReason || data.rejectionReason.trim().length === 0) {
        return {
          success: false,
          error: 'A specific rejection reason is required when rejecting a batch.',
        };
      }

      const dummyRecipient: DemoUser = {
        id: 'USR-INSP',
        name: data.recordedBy || operator,
        role: 'recipient',
        organization: 'Receiving Facility Intake Dock',
        avatarInitial: 'RO',
        description: 'Receiving dock inspection supervisor',
      };

      return this.rejectPostInspection(batch, dummyRecipient, {
        rejectionReason: data.rejectionReason,
        correctiveFeedback: data.correctiveFeedback || 'Segregate and dry to meet quality standards before re-submitting.',
        evidenceReference: data.evidenceReference,
        notes: data.notes,
      });
    }

    // outcome === 'RECEIVED'
    const declaredKg = convertQuantityToKg(batch.quantity, batch.unit);
    const dummyRecipient: DemoUser = {
      id: 'USR-INSP',
      name: data.recordedBy || operator,
      role: 'recipient',
      organization: 'Receiving Facility Intake Dock',
      avatarInitial: 'RO',
      description: 'Weighbridge intake officer',
    };

    return this.confirmRecipientReceipt(batch, dummyRecipient, {
      actualQuantityKg: data.actualReceivedQuantity ?? declaredKg,
      evidenceReference: data.evidenceReference || 'WB-REC-2026',
      notes: data.notes,
    });
  }
}

export const handoverService = new HandoverService();
