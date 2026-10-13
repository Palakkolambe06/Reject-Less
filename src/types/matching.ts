import { Recipient } from './recipient';
import { WasteBatch } from './batch';

export interface CriterionEvaluation {
  id: 'material' | 'quantity' | 'packaging' | 'contamination' | 'dryness' | 'service_area';
  title: string;
  passed: boolean;
  explanation: string;
  requiredValue: string;
  actualValue: string;
  isFatal: boolean; // If failed, prevents matching
}

export interface MatchResult {
  recipient: Recipient;
  isEligible: boolean;
  score: number; // Percentage of satisfied criteria
  passedCriteriaCount: number;
  totalCriteriaCount: number;
  evaluations: CriterionEvaluation[];
  summaryExplanation: string;
  distanceKm: number | null; // null if distance cannot be reliably calculated
  distanceStatus: 'within_radius' | 'exceeds_radius' | 'not_calculated' | 'no_restriction';
  missingInfo: string[];
}

export interface BatchMatchingReport {
  batchId: string;
  evaluatedAt: string;
  eligibleRecipients: MatchResult[];
  ineligibleRecipients: MatchResult[];
  bestMatch?: MatchResult;
}
