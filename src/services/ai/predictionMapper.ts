import { MaterialCategory } from '../../types/batch';
import { RawModelPrediction } from '../../types/ai';
import { RAW_LABEL_MAP } from './modelConfig';

/**
 * Maps raw model output labels into supported RejectLess application categories.
 * Enforces strict honesty: unsupported or ambiguous categories map to 'Other / Uncertain'.
 */
export function mapModelPrediction(prediction: RawModelPrediction): {
  category: MaterialCategory;
  confidence: number;
  rawLabel: string;
} {
  const normalized = prediction.label.toLowerCase().trim();
  const matched = RAW_LABEL_MAP[normalized];
  if (matched) {
    return {
      category: matched as MaterialCategory,
      confidence: Math.round(prediction.score * 100) / 100,
      rawLabel: prediction.label,
    };
  }

  // Fallback for partial substring matches or unknown labels
  if (normalized.includes('cardboard') || normalized.includes('carton') || normalized.includes('box')) {
    return { category: 'Cardboard', confidence: prediction.score, rawLabel: prediction.label };
  }
  if (normalized.includes('paper') || normalized.includes('newspaper') || normalized.includes('magazine')) {
    return { category: 'Paper', confidence: prediction.score, rawLabel: prediction.label };
  }
  if (normalized.includes('plastic') || normalized.includes('bottle') || normalized.includes('poly')) {
    return { category: 'Plastic', confidence: prediction.score, rawLabel: prediction.label };
  }
  if (normalized.includes('glass') || normalized.includes('jar')) {
    return { category: 'Glass', confidence: prediction.score, rawLabel: prediction.label };
  }
  if (normalized.includes('metal') || normalized.includes('can') || normalized.includes('aluminum') || normalized.includes('tin')) {
    return { category: 'Metal', confidence: prediction.score, rawLabel: prediction.label };
  }

  return {
    category: 'Other / Uncertain',
    confidence: prediction.score,
    rawLabel: prediction.label,
  };
}

export function generateAiDisclaimer(isSimulation: boolean, modelId: string): string {
  if (isSimulation) {
    return `DEMO SIMULATION (${modelId}): AI prediction is an automated suggestion for demonstration. A human operator must visually verify and confirm the material before recipient matching. AI does NOT detect chemical contamination or guarantee recyclability.`;
  }
  return `OPEN-WEIGHT MODEL INFERENCE (${modelId}): Predicted category candidate. Operational confirmation by a human operator is mandatory. AI does NOT inspect moisture, dirt, or recipient acceptance criteria.`;
}
