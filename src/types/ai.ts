import { MaterialCategory } from './batch';

export interface ModelMetadata {
  name: string;
  architecture: string;
  version: string;
  license: string;
  sourceUrl: string;
  dataset: string;
  intendedUse: string;
  limitations: string[];
}

export type InferenceMode = 'demo_simulation' | 'open_weights_api' | 'custom_endpoint';

export interface InferenceConfig {
  mode: InferenceMode;
  apiEndpoint?: string;
  apiToken?: string; // Stored in memory or local storage configuration, never baked into bundle
  modelId: string;
  timeoutMs: number;
}

export interface RawModelPrediction {
  label: string;
  score: number;
}

export interface ClassifiedResult {
  predictedCategory: MaterialCategory;
  rawLabel: string;
  confidence: number;
  allPredictions: Array<{
    category: MaterialCategory;
    rawLabel: string;
    confidence: number;
  }>;
  isSimulation: boolean;
  modelIdentifier: string;
  predictedAt: string;
  disclaimer: string;
}

export interface InferenceError {
  code: 'OFFLINE' | 'UNAUTHORIZED' | 'TIMEOUT' | 'INVALID_IMAGE' | 'UNSUPPORTED_LABEL' | 'SERVER_ERROR';
  message: string;
  canRetry: boolean;
}
