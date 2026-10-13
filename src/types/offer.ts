import { MaterialCategory, QuantityUnit } from './batch';

export type OfferStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED';
export type RejectionStage = 'BEFORE_ACCEPTANCE' | 'POST_INSPECTION';

export const REJECTION_REASONS = [
  'Material not accepted',
  'Incorrect material classification',
  'Quantity below minimum',
  'Contaminated or wet material',
  'Incorrect packaging',
  'Outside service area',
  'Collection capacity unavailable',
  'Material condition differs from description',
  'Other',
] as const;

export type RejectionReasonOption = typeof REJECTION_REASONS[number];

export interface RecipientOffer {
  id: string; // e.g. OFFER-2026-0812
  batchId: string;
  recipientId: string;
  recipientName: string;
  generatorName: string;
  materialCategory: MaterialCategory;
  quantity: number;
  unit: QuantityUnit;
  offeredAt: string;
  status: OfferStatus;
  proposedPickupDate?: string;
  respondedAt?: string;
  respondedBy?: string;
  rejectionReason?: RejectionReasonOption | string;
  rejectionExplanation?: string;
  rejectionStage?: RejectionStage;
  notes?: string;
}
