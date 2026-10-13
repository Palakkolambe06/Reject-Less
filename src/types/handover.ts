import { BatchStatus, StatusHistoryEvent } from './batch';
import { RejectionStage } from './offer';

export type HandoverEvent = StatusHistoryEvent;

export interface HandoverScheduleData {
  batchId: string;
  recipientId: string;
  scheduledDate: string; // ISO string or YYYY-MM-DD
  contactPerson: string;
  contactPhone: string;
  assignedOperatorId?: string;
  assignedOperatorName?: string;
  handoverNotes?: string;
}

export interface DispatchProgressData {
  batchId: string;
  stage: 'PICKED UP' | 'HANDED OVER';
  timestamp: string;
  operatorId: string;
  operatorName: string;
  notes?: string;
  vehicleRef?: string;
}

export interface HandoverOutcomeData {
  batchId: string;
  outcome: 'RECEIVED' | 'REJECTED';
  completedAt: string;
  recordedBy: string;
  evidenceReference?: string; // e.g. Weighbridge Slip #WB-8819 or Waybill
  actualReceivedQuantity?: number;
  discrepancyKg?: number;
  discrepancyNotes?: string;
  notes?: string;
  // Rejection details (MANDATORY IF REJECTED):
  rejectionReason?: string;
  rejectionStage?: RejectionStage;
  correctiveFeedback?: string;
  checklistItemsToRevisit?: string[];
}
