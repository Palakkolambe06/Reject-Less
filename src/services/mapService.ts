import { WasteBatch } from '../types/batch';
import { Recipient } from '../types/recipient';
import { UserRole } from '../types/user';
import { calculateHaversineDistance } from '../utils/distance';
import { matchingService } from './matchingService';
import { MatchResult } from '../types/matching';

export interface MapMarkerItem {
  id: string;
  type: 'recipient' | 'pickup';
  title: string;
  subtitle: string;
  lat: number;
  lng: number;
  materialCategory?: string;
  status?: string;
  facilityType?: string;
  maxServiceRadiusKm?: number;
  recipientData?: Recipient;
  batchData?: WasteBatch;
}

class MapService {
  /**
   * Filter and prepare map markers based on the user's role and data privacy
   */
  public prepareMarkers(
    recipients: Recipient[],
    batches: WasteBatch[],
    role: UserRole,
    _activeRecipientId?: string
  ): MapMarkerItem[] {
    const markers: MapMarkerItem[] = [];

    // 1. Process Recipient Facilities
    recipients.forEach((rec) => {
      if (!rec.isActive) return;
      const coords = rec.location.coordinates;
      if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number') {
        return;
      }

      markers.push({
        id: `rec-${rec.id}`,
        type: 'recipient',
        title: rec.name,
        subtitle: `${rec.facilityType} · ${rec.location.city}`,
        lat: coords.lat,
        lng: coords.lng,
        materialCategory: rec.acceptedMaterials.join(', '),
        facilityType: rec.facilityType,
        maxServiceRadiusKm: rec.location.maxServiceRadiusKm,
        recipientData: rec,
      });
    });

    // 2. Process Waste Batch Pickup Locations
    batches.forEach((b) => {
      const coords = b.pickupLocation.coordinates;
      if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number') {
        return;
      }

      // Privacy rule: Recipients only see pickup locations for batches that are active in logistics or ready
      if (role === 'recipient') {
        const allowedStatuses = ['READY', 'OFFERED', 'ACCEPTED', 'SCHEDULED', 'PICKED UP', 'HANDED OVER'];
        if (!allowedStatuses.includes(b.status)) return;
      }

      markers.push({
        id: `batch-${b.id}`,
        type: 'pickup',
        title: `${b.materialCategory} (${b.quantity} ${b.unit})`,
        subtitle: `${b.generatorName} · ${b.pickupLocation.city}`,
        lat: coords.lat,
        lng: coords.lng,
        materialCategory: b.materialCategory,
        status: b.status,
        batchData: b,
      });
    });

    return markers;
  }

  /**
   * Calculate straight-line distance and evaluate matching between a batch and a recipient
   */
  public evaluatePair(
    batch: WasteBatch,
    recipient: Recipient
  ): {
    distanceKm: number | null;
    result: MatchResult;
  } {
    const distanceKm = calculateHaversineDistance(
      batch.pickupLocation.coordinates,
      recipient.location.coordinates
    );

    const result = matchingService.evaluateMatch(batch, recipient);

    return {
      distanceKm,
      result,
    };
  }
}

export const mapService = new MapService();
