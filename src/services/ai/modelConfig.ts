import { ModelMetadata } from '../../types/ai';

export const VERIFIED_OPEN_WEIGHT_MODEL: ModelMetadata = {
  name: 'Vision Transformer (ViT) Garbage Classification',
  architecture: 'google/vit-base-patch16-224-in21k fine-tuned',
  version: '1.0.0 (Hugging Face Hub Revision)',
  license: 'MIT License (Open Source)',
  sourceUrl: 'https://huggingface.co/yangy50/garbage-classification',
  dataset: 'Garbage Classification Dataset (Cardboard, Glass, Metal, Paper, Plastic, Trash)',
  intendedUse:
    'Visual triage to propose a candidate material category from a single photo of sorted or bulk dry recyclable waste items.',
  limitations: [
    'Does not detect biological pathogens, grease saturation, or chemical residues.',
    'Cannot determine internal moisture content or paper tensile degradation.',
    'May misclassify transparent plastics as glass or metallic laminated plastics as pure metal.',
    'Predictions MUST always be verified and confirmed by an operational human operator before matching.',
    'Does NOT certify recyclability or guarantee recipient facility acceptance.',
  ],
};

export const RAW_LABEL_MAP: Record<string, string> = {
  cardboard: 'Cardboard',
  paper: 'Paper',
  plastic: 'Plastic',
  glass: 'Glass',
  metal: 'Metal',
  trash: 'Other / Uncertain',
  organic: 'Other / Uncertain',
  battery: 'Other / Uncertain',
  clothes: 'Other / Uncertain',
};
