import { WasteBatch, QuantityUnit } from '../types/batch';
import { Recipient } from '../types/recipient';
import { MatchResult, BatchMatchingReport, CriterionEvaluation } from '../types/matching';
import { calculateHaversineDistance } from '../utils/distance';

export function convertQuantityToKg(quantity: number, unit: QuantityUnit): number {
  switch (unit) {
    case 'kg':
      return quantity;
    case 'tonnes':
      return quantity * 1000;
    case 'bales':
      // Standard commercial recycling bale approximation ~200kg
      return quantity * 200;
    case 'bags':
      // Standard municipal recycling collection bag approximation ~25kg
      return quantity * 25;
    default:
      return quantity;
  }
}

class MatchingService {
  /**
   * Deterministically evaluates a single batch against a single recipient
   */
  public evaluateMatch(batch: WasteBatch, recipient: Recipient): MatchResult {
    const evaluations: CriterionEvaluation[] = [];
    const missingInfo: string[] = [];
    let isEligible = true;

    // 0. Recipient Active Check
    if (!recipient.isActive) {
      evaluations.push({
        id: 'material',
        title: 'Facility Active Status',
        passed: false,
        explanation: 'Recipient facility is currently paused or inactive.',
        requiredValue: 'Active',
        actualValue: 'Inactive',
        isFatal: true,
      });
      isEligible = false;
    }

    // 1. Material Acceptance Check
    const acceptsMaterial = recipient.acceptedMaterials.includes(batch.materialCategory);
    evaluations.push({
      id: 'material',
      title: 'Material Category Acceptance',
      passed: acceptsMaterial,
      explanation: acceptsMaterial
        ? `Recipient accepts ${batch.materialCategory}.`
        : `Recipient only accepts [${recipient.acceptedMaterials.join(', ')}], not ${batch.materialCategory}.`,
      requiredValue: recipient.acceptedMaterials.join(', '),
      actualValue: batch.materialCategory,
      isFatal: true,
    });
    if (!acceptsMaterial) isEligible = false;

    // 2. Quantity Limit Check
    const batchQtyKg = convertQuantityToKg(batch.quantity, batch.unit);
    const meetsMinQty = batchQtyKg >= recipient.minQuantityKg;
    const meetsMaxQty = batchQtyKg <= recipient.maxQuantityKg;
    const quantityPassed = meetsMinQty && meetsMaxQty;

    let qtyExplanation = '';
    if (!meetsMinQty) {
      qtyExplanation = `Batch weight (${batchQtyKg} kg) is below recipient's minimum intake of ${recipient.minQuantityKg} kg.`;
    } else if (!meetsMaxQty) {
      qtyExplanation = `Batch weight (${batchQtyKg} kg) exceeds recipient's maximum intake limit of ${recipient.maxQuantityKg} kg.`;
    } else {
      qtyExplanation = `Batch weight (${batchQtyKg} kg) satisfies intake limits (${recipient.minQuantityKg} – ${recipient.maxQuantityKg} kg).`;
    }

    evaluations.push({
      id: 'quantity',
      title: 'Quantity & Minimum Volume',
      passed: quantityPassed,
      explanation: qtyExplanation,
      requiredValue: `${recipient.minQuantityKg} kg – ${recipient.maxQuantityKg} kg`,
      actualValue: `${batchQtyKg} kg (${batch.quantity} ${batch.unit})`,
      isFatal: true,
    });
    if (!quantityPassed) isEligible = false;

    // 3. Packaging Format Check
    const packagingPassed = recipient.requiredPackaging.includes(batch.packagingType);
    evaluations.push({
      id: 'packaging',
      title: 'Packaging Format Suitability',
      passed: packagingPassed,
      explanation: packagingPassed
        ? `Packaging format '${batch.packagingType}' matches recipient intake standards.`
        : `Recipient requires [${recipient.requiredPackaging.join(', ')}], but batch is prepared as '${batch.packagingType}'.`,
      requiredValue: recipient.requiredPackaging.join(' / '),
      actualValue: batch.packagingType,
      isFatal: true,
    });
    if (!packagingPassed) isEligible = false;

    // 4. Contamination Level Check
    const contaminationAcceptable = recipient.acceptableContaminationLevels.includes(
      batch.contaminationLevel
    );
    evaluations.push({
      id: 'contamination',
      title: 'Contamination & Cleanliness Standard',
      passed: contaminationAcceptable,
      explanation: contaminationAcceptable
        ? `Contamination state '${batch.contaminationLevel}' is acceptable for facility processing.`
        : `Facility rejects batches with '${batch.contaminationLevel}'. Max tolerated: [${recipient.acceptableContaminationLevels.join(', ')}].`,
      requiredValue: recipient.acceptableContaminationLevels.join(' / '),
      actualValue: batch.contaminationLevel,
      isFatal: true,
    });
    if (!contaminationAcceptable) isEligible = false;

    // 5. Dryness Requirement Check
    let drynessPassed = true;
    if (recipient.requiresDry) {
      drynessPassed = batch.readinessChecklist?.isDryAndProtected === true;
      evaluations.push({
        id: 'dryness',
        title: 'Moisture & Weather Protection',
        passed: drynessPassed,
        explanation: drynessPassed
          ? 'Batch is verified dry and protected from weather.'
          : 'Recipient requires 100% dry material. Batch readiness checklist has not verified dry protection.',
        requiredValue: 'Dry & Weather-Protected',
        actualValue: batch.readinessChecklist?.isDryAndProtected ? 'Dry' : 'Unverified / Damp',
        isFatal: true,
      });
      if (!drynessPassed) isEligible = false;
    }

    // 6. Geographic Proximity & Service Area
    const distanceKm = calculateHaversineDistance(
      batch.pickupLocation.coordinates,
      recipient.location.coordinates
    );

    let distanceStatus: MatchResult['distanceStatus'] = 'no_restriction';
    let serviceAreaPassed = true;

    if (distanceKm === null) {
      distanceStatus = 'not_calculated';
      missingInfo.push('Precise GPS coordinates not available for direct distance calculation.');
      evaluations.push({
        id: 'service_area',
        title: 'Service Area / Distance',
        passed: true, // Non-fatal when coordinates are unavailable
        explanation: `Distance could not be calculated (coordinates unavailable). Both locations listed in ${batch.pickupLocation.city} / ${recipient.location.city}.`,
        requiredValue: recipient.location.maxServiceRadiusKm
          ? `Within ${recipient.location.maxServiceRadiusKm} km`
          : 'No radius limit',
        actualValue: 'Distance unavailable',
        isFatal: false,
      });
    } else if (recipient.location.maxServiceRadiusKm) {
      if (distanceKm <= recipient.location.maxServiceRadiusKm) {
        distanceStatus = 'within_radius';
        serviceAreaPassed = true;
        evaluations.push({
          id: 'service_area',
          title: 'Service Area / Distance',
          passed: true,
          explanation: `Distance is ${distanceKm} km, which is within the recipient's maximum service radius of ${recipient.location.maxServiceRadiusKm} km.`,
          requiredValue: `Max ${recipient.location.maxServiceRadiusKm} km`,
          actualValue: `${distanceKm} km`,
          isFatal: false,
        });
      } else {
        distanceStatus = 'exceeds_radius';
        serviceAreaPassed = false;
        isEligible = false;
        evaluations.push({
          id: 'service_area',
          title: 'Service Area / Distance',
          passed: false,
          explanation: `Distance is ${distanceKm} km, which exceeds recipient's maximum collection radius of ${recipient.location.maxServiceRadiusKm} km.`,
          requiredValue: `Max ${recipient.location.maxServiceRadiusKm} km`,
          actualValue: `${distanceKm} km`,
          isFatal: true,
        });
      }
    } else {
      distanceStatus = 'no_restriction';
      evaluations.push({
        id: 'service_area',
        title: 'Service Area / Distance',
        passed: true,
        explanation: `Distance is ${distanceKm} km. Recipient accepts regional dispatch without fixed radius cap.`,
        requiredValue: 'Open radius',
        actualValue: `${distanceKm} km`,
        isFatal: false,
      });
    }

    const passedCount = evaluations.filter((e) => e.passed).length;
    const totalCount = evaluations.length;
    const score = Math.round((passedCount / totalCount) * 100);

    // Natural Language Explanation Synthesis
    let summaryExplanation = '';
    if (isEligible) {
      summaryExplanation = `Eligible: ${batch.materialCategory} is accepted, quantity (${batchQtyKg} kg) is within limits (${recipient.minQuantityKg} – ${recipient.maxQuantityKg} kg), and packaging '${batch.packagingType}' matches recipient requirements.`;
    } else {
      const failedReasons = evaluations
        .filter((e) => !e.passed)
        .map((e) => e.explanation);
      summaryExplanation = `Not eligible: ${failedReasons.join(' ')}`;
    }

    return {
      recipient,
      isEligible,
      score,
      passedCriteriaCount: passedCount,
      totalCriteriaCount: totalCount,
      evaluations,
      summaryExplanation,
      distanceKm,
      distanceStatus,
      missingInfo,
    };
  }

  /**
   * Evaluates all recipients for a given batch and returns a complete report
   */
  public evaluateAll(batch: WasteBatch, recipients: Recipient[]): BatchMatchingReport {
    const results: MatchResult[] = recipients.map((r) => this.evaluateMatch(batch, r));
    const eligible = results.filter((r) => r.isEligible);
    const ineligible = results.filter((r) => !r.isEligible);

    // Sort eligible by closest distance if available, or highest criteria score
    eligible.sort((a, b) => {
      if (a.distanceKm !== null && b.distanceKm !== null) {
        return a.distanceKm - b.distanceKm;
      }
      return b.score - a.score;
    });

    return {
      batchId: batch.id,
      evaluatedAt: new Date().toISOString(),
      eligibleRecipients: eligible,
      ineligibleRecipients: ineligible,
      bestMatch: eligible.length > 0 ? eligible[0] : undefined,
    };
  }
}

export const matchingService = new MatchingService();
