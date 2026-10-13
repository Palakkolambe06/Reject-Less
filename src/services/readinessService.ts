import { ReadinessChecklist, WasteBatch } from '../types/batch';

export interface ReadinessEvaluation {
  isFullyReady: boolean;
  completedItemsCount: number;
  totalItemsCount: number;
  percentage: number;
  incompleteItems: Array<{
    key: keyof Omit<ReadinessChecklist, 'notes' | 'lastEvaluatedAt'>;
    label: string;
    guidance: string;
  }>;
  summaryExplanation: string;
}

export const CHECKLIST_DEFINITIONS = [
  {
    key: 'isSortedSeparately' as const,
    label: 'Single-stream segregation (no mixed waste)',
    guidance: 'Verify that this batch contains only the confirmed material stream and is not mixed with unrecyclable garbage.',
  },
  {
    key: 'noOrganicContamination' as const,
    label: 'Zero food/grease/hazardous residue',
    guidance: 'Ensure containers are rinsed and fibers are free of cooking oil, food leftovers, solvent, or medical waste.',
  },
  {
    key: 'isDryAndProtected' as const,
    label: 'Dry and protected from weather',
    guidance: 'Moisture damages paper pulping and promotes bacterial mildew. Must be sheltered from rainfall and damp ground.',
  },
  {
    key: 'packagingMatchesRequirement' as const,
    label: 'Suitable packaging format',
    guidance: 'Packaging (baled, boxed, bagged, or palletized) must match what the recipient facility requires for safe forklift/manual handling.',
  },
  {
    key: 'quantityVerified' as const,
    label: 'Quantity measured & recorded',
    guidance: 'Batch weight or volume has been measured using a scale, weighbridge, or standardized count estimation.',
  },
  {
    key: 'specialPreparationDone' as const,
    label: 'Special recipient-specific prep completed',
    guidance: 'Specific prep tasks (e.g. flattening corrugated cartons, removing plastic bottle rings, degreasing aluminum scrap) are completed.',
  },
];

class ReadinessService {
  public evaluate(checklist?: ReadinessChecklist): ReadinessEvaluation {
    if (!checklist) {
      return {
        isFullyReady: false,
        completedItemsCount: 0,
        totalItemsCount: CHECKLIST_DEFINITIONS.length,
        percentage: 0,
        incompleteItems: CHECKLIST_DEFINITIONS.map((d) => ({
          key: d.key,
          label: d.label,
          guidance: d.guidance,
        })),
        summaryExplanation: 'No checklist evaluations recorded yet. Batch cannot proceed to matching.',
      };
    }

    const incompleteItems: ReadinessEvaluation['incompleteItems'] = [];
    let completedCount = 0;

    for (const item of CHECKLIST_DEFINITIONS) {
      if (checklist[item.key]) {
        completedCount++;
      } else {
        incompleteItems.push({
          key: item.key,
          label: item.label,
          guidance: item.guidance,
        });
      }
    }

    const total = CHECKLIST_DEFINITIONS.length;
    const percentage = Math.round((completedCount / total) * 100);
    const isFullyReady = completedCount === total;

    let summaryExplanation = '';
    if (isFullyReady) {
      summaryExplanation =
        'All 6 readiness verification requirements satisfied. Batch is eligible for recipient matching.';
    } else {
      const missingNames = incompleteItems.map((i) => i.label).join('; ');
      summaryExplanation = `Incomplete (${completedCount}/${total}): Awaiting verification for: ${missingNames}.`;
    }

    return {
      isFullyReady,
      completedItemsCount: completedCount,
      totalItemsCount: total,
      percentage,
      incompleteItems,
      summaryExplanation,
    };
  }

  public updateChecklistInBatch(
    batch: WasteBatch,
    updates: Partial<ReadinessChecklist>
  ): WasteBatch {
    const updatedChecklist: ReadinessChecklist = {
      ...batch.readinessChecklist,
      ...updates,
      lastEvaluatedAt: new Date().toISOString(),
    };

    const evaluation = this.evaluate(updatedChecklist);

    // If batch was in DRAFT or PREPARATION and is now ready, update status
    let newStatus = batch.status;
    if (evaluation.isFullyReady && (batch.status === 'DRAFT' || batch.status === 'PREPARATION')) {
      newStatus = 'READY';
    } else if (!evaluation.isFullyReady && batch.status === 'READY') {
      newStatus = 'PREPARATION';
    }

    return {
      ...batch,
      readinessChecklist: updatedChecklist,
      isReadyForMatching: evaluation.isFullyReady,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };
  }
}

export const readinessService = new ReadinessService();
