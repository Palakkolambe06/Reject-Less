import {
  WasteBatch,
  BatchStatus,
  MaterialCategory,
  QuantityUnit,
  PackagingType,
  ContaminationLevel,
  StatusHistoryEvent,
} from '../types/batch';
import { storageService } from './storageService';
import { convertQuantityToKg } from './matchingService';

export interface CreateBatchInput {
  generatorName: string;
  address: string;
  city: string;
  pincode: string;
  coordinates?: { lat: number; lng: number };
  materialCategory: MaterialCategory;
  isHumanConfirmed: boolean;
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
  aiPrediction?: WasteBatch['aiPrediction'];
}

export interface GeneratorDashboardMetrics {
  totalBatches: number;
  draftPreparation: number;
  readyForMatching: number;
  awaitingRecipientResponse: number; // OFFERED
  acceptedOffers: number; // ACCEPTED
  scheduledHandovers: number; // SCHEDULED + PICKED UP + HANDED OVER
  receivedCount: number; // RECEIVED
  rejectedCount: number; // REJECTED
  totalRecycledWeightKg: number;
}

export interface RecipientDashboardMetrics {
  newOffersAwaitingReview: number;
  acceptedOffers: number;
  rejectedOffers: number;
  pickupsDueToday: number;
  awaitingCollection: number;
  awaitingReceiptConfirmation: number;
  totalReceivedKg: number;
}

export interface OperatorDashboardMetrics {
  pickupsScheduledToday: number;
  awaitingDispatch: number;
  inTransit: number;
  awaitingHandoverConfirmation: number;
  overdueOrDelayed: number;
  awaitingRecipientReceipt: number;
  completedHandovers: number;
  openExceptions: number;
}

export interface DashboardMetrics {
  totalBatches: number;
  awaitingPreparation: number;
  readyForMatching: number;
  matchedBatches: number;
  scheduledHandovers: number;
  receivedCount: number;
  rejectedCount: number;
  totalRecycledWeightKg: number;
  materialBreakdown: Record<MaterialCategory, number>;
  statusBreakdown: Record<BatchStatus, number>;
}

class BatchService {
  public generateId(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `BATCH-${year}-${random}`;
  }

  public async getAll(): Promise<WasteBatch[]> {
    return storageService.getBatches();
  }

  public async getById(id: string): Promise<WasteBatch | null> {
    return storageService.getBatchById(id);
  }

  public async createBatch(input: CreateBatchInput, creator: string = 'Operator'): Promise<WasteBatch> {
    const id = this.generateId();
    const now = new Date().toISOString();

    const initialHistory: StatusHistoryEvent = {
      id: `EVT-${Date.now()}`,
      status: 'DRAFT',
      timestamp: now,
      performedBy: creator,
      role: 'generator',
      notes: `Batch initiated by ${input.generatorName}.`,
    };

    const newBatch: WasteBatch = {
      id,
      generatorName: input.generatorName,
      pickupLocation: {
        address: input.address,
        city: input.city,
        pincode: input.pincode,
        coordinates: input.coordinates,
      },
      materialCategory: input.materialCategory,
      isHumanConfirmed: input.isHumanConfirmed,
      quantity: Number(input.quantity),
      unit: input.unit,
      packagingType: input.packagingType,
      contaminationLevel: input.contaminationLevel,
      description: input.description,
      photoUrl: input.photoUrl,
      photoMetadata: input.photoMetadata,
      aiPrediction: input.aiPrediction,
      readinessChecklist: {
        isSortedSeparately: false,
        noOrganicContamination: input.contaminationLevel === 'None (Clean & Sorted)',
        isDryAndProtected: false,
        packagingMatchesRequirement: false,
        quantityVerified: true,
        specialPreparationDone: false,
        lastEvaluatedAt: now,
      },
      isReadyForMatching: false,
      status: 'DRAFT',
      statusHistory: [initialHistory],
      createdAt: now,
      updatedAt: now,
    };

    await storageService.saveBatch(newBatch);
    return newBatch;
  }

  public async updateBatch(batch: WasteBatch): Promise<WasteBatch> {
    return storageService.saveBatch(batch);
  }

  public async deleteBatch(id: string): Promise<boolean> {
    return storageService.deleteBatch(id);
  }

  public async confirmMaterial(
    batchId: string,
    confirmedCategory: MaterialCategory,
    operator: string = 'Operator'
  ): Promise<WasteBatch | null> {
    const batch = await this.getById(batchId);
    if (!batch) return null;

    const event: StatusHistoryEvent = {
      id: `EVT-${Date.now()}`,
      status: batch.status,
      timestamp: new Date().toISOString(),
      performedBy: operator,
      role: 'generator',
      notes: `Material confirmed as '${confirmedCategory}' (previously AI suggested: ${batch.aiPrediction?.predictedCategory || 'none'}).`,
    };

    const updated: WasteBatch = {
      ...batch,
      materialCategory: confirmedCategory,
      isHumanConfirmed: true,
      statusHistory: [...batch.statusHistory, event],
      updatedAt: new Date().toISOString(),
    };

    return this.updateBatch(updated);
  }

  public async reopenRejectedBatch(
    batchId: string,
    operator: string = 'Generator'
  ): Promise<WasteBatch | null> {
    const batch = await this.getById(batchId);
    if (!batch || batch.status !== 'REJECTED') return null;

    const event: StatusHistoryEvent = {
      id: `EVT-${Date.now()}`,
      status: 'PREPARATION',
      timestamp: new Date().toISOString(),
      performedBy: operator,
      role: 'generator',
      notes: `Batch reopened for corrective sorting and preparation following rejection (${batch.rejectionReason || 'Inspection feedback'}).`,
    };

    const updated: WasteBatch = {
      ...batch,
      status: 'PREPARATION',
      isReadyForMatching: false,
      statusHistory: [...batch.statusHistory, event],
      updatedAt: new Date().toISOString(),
    };

    return this.updateBatch(updated);
  }

  public async getGeneratorMetrics(): Promise<GeneratorDashboardMetrics> {
    const batches = await this.getAll();
    const metrics: GeneratorDashboardMetrics = {
      totalBatches: batches.length,
      draftPreparation: 0,
      readyForMatching: 0,
      awaitingRecipientResponse: 0,
      acceptedOffers: 0,
      scheduledHandovers: 0,
      receivedCount: 0,
      rejectedCount: 0,
      totalRecycledWeightKg: 0,
    };

    for (const b of batches) {
      if (b.status === 'DRAFT' || b.status === 'PREPARATION') metrics.draftPreparation++;
      if (b.status === 'READY') metrics.readyForMatching++;
      if (b.status === 'OFFERED') metrics.awaitingRecipientResponse++;
      if (b.status === 'ACCEPTED') metrics.acceptedOffers++;
      if (b.status === 'SCHEDULED' || b.status === 'PICKED UP' || b.status === 'HANDED OVER') {
        metrics.scheduledHandovers++;
      }
      if (b.status === 'RECEIVED') {
        metrics.receivedCount++;
        metrics.totalRecycledWeightKg += convertQuantityToKg(b.quantity, b.unit);
      }
      if (b.status === 'REJECTED') metrics.rejectedCount++;
    }

    return metrics;
  }

  public async getRecipientMetrics(facilityId?: string): Promise<RecipientDashboardMetrics> {
    const batches = await this.getAll();
    const offers = await storageService.getOffers();

    const relevantOffers = facilityId ? offers.filter((o) => o.recipientId === facilityId) : offers;
    const relevantBatches = facilityId ? batches.filter((b) => b.matchedRecipientId === facilityId) : batches;

    let totalReceivedKg = 0;
    for (const b of relevantBatches) {
      if (b.status === 'RECEIVED') {
        totalReceivedKg += b.actualReceivedQuantity || convertQuantityToKg(b.quantity, b.unit);
      }
    }

    return {
      newOffersAwaitingReview: relevantOffers.filter((o) => o.status === 'PENDING').length,
      acceptedOffers: relevantOffers.filter((o) => o.status === 'ACCEPTED').length,
      rejectedOffers: relevantOffers.filter((o) => o.status === 'REJECTED').length,
      pickupsDueToday: relevantBatches.filter((b) => b.status === 'SCHEDULED').length,
      awaitingCollection: relevantBatches.filter((b) => b.status === 'ACCEPTED').length,
      awaitingReceiptConfirmation: relevantBatches.filter((b) => b.status === 'HANDED OVER').length,
      totalReceivedKg,
    };
  }

  public async getOperatorMetrics(): Promise<OperatorDashboardMetrics> {
    const batches = await this.getAll();
    return {
      pickupsScheduledToday: batches.filter((b) => b.status === 'SCHEDULED').length,
      awaitingDispatch: batches.filter((b) => b.status === 'ACCEPTED').length,
      inTransit: batches.filter((b) => b.status === 'PICKED UP').length,
      awaitingHandoverConfirmation: batches.filter((b) => b.status === 'SCHEDULED' && !b.generatorHandoverConfirmed).length,
      overdueOrDelayed: 0,
      awaitingRecipientReceipt: batches.filter((b) => b.status === 'HANDED OVER' && !b.recipientReceivedConfirmed).length,
      completedHandovers: batches.filter((b) => b.status === 'RECEIVED').length,
      openExceptions: batches.filter((b) => b.status === 'REJECTED' && b.rejectionStage === 'POST_INSPECTION').length,
    };
  }

  public async getDashboardMetrics(): Promise<DashboardMetrics> {
    const batches = await this.getAll();
    const metrics: DashboardMetrics = {
      totalBatches: batches.length,
      awaitingPreparation: 0,
      readyForMatching: 0,
      matchedBatches: 0,
      scheduledHandovers: 0,
      receivedCount: 0,
      rejectedCount: 0,
      totalRecycledWeightKg: 0,
      materialBreakdown: {
        Cardboard: 0,
        Paper: 0,
        Plastic: 0,
        Glass: 0,
        Metal: 0,
        'Other / Uncertain': 0,
      },
      statusBreakdown: {
        DRAFT: 0,
        PREPARATION: 0,
        READY: 0,
        MATCHED: 0,
        OFFERED: 0,
        ACCEPTED: 0,
        SCHEDULED: 0,
        'PICKED UP': 0,
        'HANDED OVER': 0,
        RECEIVED: 0,
        REJECTED: 0,
      },
    };

    for (const b of batches) {
      metrics.statusBreakdown[b.status] = (metrics.statusBreakdown[b.status] || 0) + 1;
      if (b.materialCategory in metrics.materialBreakdown) {
        metrics.materialBreakdown[b.materialCategory]++;
      } else {
        metrics.materialBreakdown['Other / Uncertain']++;
      }

      if (b.status === 'DRAFT' || b.status === 'PREPARATION') {
        metrics.awaitingPreparation++;
      } else if (b.status === 'READY') {
        metrics.readyForMatching++;
      } else if (b.status === 'OFFERED' || b.status === 'ACCEPTED') {
        metrics.matchedBatches++;
      } else if (b.status === 'SCHEDULED' || b.status === 'PICKED UP' || b.status === 'HANDED OVER') {
        metrics.scheduledHandovers++;
      } else if (b.status === 'RECEIVED') {
        metrics.receivedCount++;
        metrics.totalRecycledWeightKg += convertQuantityToKg(b.quantity, b.unit);
      } else if (b.status === 'REJECTED') {
        metrics.rejectedCount++;
      }
    }

    return metrics;
  }
}

export const batchService = new BatchService();
