/**
 * Core waste batch types for RejectLess platform
 * Lifecycle: DRAFT -> PREPARATION -> READY -> MATCHED -> SCHEDULED -> HANDED OVER -> RECEIVED | REJECTED
 */

export type MaterialCategory =
  | 'Cardboard'
  | 'Paper'
  | 'Plastic'
  | 'Glass'
  | 'Metal'
  | 'Other / Uncertain';

export type BatchStatus =
  | 'DRAFT'
  | 'PREPARATION'
  | 'READY'
  | 'MATCHED'
  | 'OFFERED'
  | 'ACCEPTED'
  | 'SCHEDULED'
  | 'PICKED UP'
  | 'HANDED OVER'
  | 'RECEIVED'
  | 'REJECTED';

export type QuantityUnit = 'kg' | 'tonnes' | 'bales' | 'bags';

export type PackagingType =
  | 'Loose'
  | 'Baled'
  | 'Bagged'
  | 'Boxed'
  | 'Stacked on Pallet';

export type ContaminationLevel =
  | 'None (Clean & Sorted)'
  | 'Minor Dry Dust / Labels'
  | 'Noticeable Dirt / Residue'
  | 'Severe / Organic / Wet Contamination';

export interface ReadinessChecklist {
  isSortedSeparately: boolean;
  noOrganicContamination: boolean;
  isDryAndProtected: boolean;
  packagingMatchesRequirement: boolean;
  quantityVerified: boolean;
  specialPreparationDone: boolean;
  notes?: string;
  lastEvaluatedAt?: string;
}

export interface StatusHistoryEvent {
  id: string;
  status: BatchStatus;
  timestamp: string;
  performedBy: string;
  role?: string;
  notes?: string;
  reason?: string; // Required when status is REJECTED
  stage?: 'BEFORE_ACCEPTANCE' | 'POST_INSPECTION';
  evidenceReference?: string;
}

export type HandoverEvent = StatusHistoryEvent;

export interface WasteBatch {
  id: string; // e.g. BATCH-2026-0104
  generatorName: string;
  pickupLocation: {
    address: string;
    city: string;
    pincode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  materialCategory: MaterialCategory; // Confirmed material category
  isHumanConfirmed: boolean; // True only when human explicitly verifies
  quantity: number;
  unit: QuantityUnit;
  packagingType: PackagingType;
  contaminationLevel: ContaminationLevel;
  description?: string;
  photoUrl?: string;
  photoMetadata?: {
    name: string;
    sizeBytes: number;
    mimeType: string;
    uploadedAt: string;
  };
  aiPrediction?: {
    predictedCategory: MaterialCategory;
    rawLabel: string;
    confidence: number;
    inferenceSource: 'demo_simulation' | 'open_weights_api' | 'custom_endpoint';
    modelIdentifier: string;
    predictedAt: string;
    isSimulation: boolean;
    disclaimer: string;
  };
  readinessChecklist: ReadinessChecklist;
  isReadyForMatching: boolean;
  status: BatchStatus;
  activeOfferId?: string;
  matchedRecipientId?: string;
  assignedOperatorId?: string;
  assignedOperatorName?: string;
  scheduledHandoverDate?: string;
  pickupTimestamp?: string;
  handoverTimestamp?: string;
  generatorHandoverConfirmed?: boolean;
  generatorHandoverConfirmedAt?: string;
  recipientReceivedConfirmed?: boolean;
  recipientReceivedConfirmedAt?: string;
  actualReceivedQuantity?: number;
  discrepancyKg?: number;
  discrepancyNotes?: string;
  handoverNotes?: string;
  evidenceReference?: string;
  rejectionReason?: string;
  rejectionStage?: 'BEFORE_ACCEPTANCE' | 'POST_INSPECTION';
  correctiveFeedback?: string;
  statusHistory: StatusHistoryEvent[];
  createdAt: string;
  updatedAt: string;
}
