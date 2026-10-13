import { MaterialCategory, QuantityUnit, PackagingType, ContaminationLevel } from '../types/batch';

export interface BatchValidationErrors {
  generatorName?: string;
  address?: string;
  city?: string;
  pincode?: string;
  materialCategory?: string;
  quantity?: string;
  unit?: string;
  packagingType?: string;
  contaminationLevel?: string;
  photo?: string;
}

export function validateBatchForm(data: {
  generatorName: string;
  address: string;
  city: string;
  pincode: string;
  materialCategory: MaterialCategory;
  quantity: number | string;
  unit: QuantityUnit;
  packagingType: PackagingType;
  contaminationLevel: ContaminationLevel;
}): { isValid: boolean; errors: BatchValidationErrors } {
  const errors: BatchValidationErrors = {};

  if (!data.generatorName || data.generatorName.trim().length < 2) {
    errors.generatorName = 'Generator name or waste source must be at least 2 characters.';
  }

  if (!data.address || data.address.trim().length < 4) {
    errors.address = 'Pickup address is required.';
  }

  if (!data.city || data.city.trim().length < 2) {
    errors.city = 'City is required.';
  }

  if (!data.pincode || !/^\d{6}$/.test(data.pincode.trim())) {
    errors.pincode = 'Valid 6-digit postal code (PIN) is required.';
  }

  const numQty = typeof data.quantity === 'number' ? data.quantity : parseFloat(data.quantity);
  if (isNaN(numQty) || numQty <= 0) {
    errors.quantity = 'Quantity must be a positive number greater than 0.';
  } else if (numQty > 1000000) {
    errors.quantity = 'Quantity exceeds realistic single batch capacity.';
  }

  const validCategories: MaterialCategory[] = [
    'Cardboard',
    'Paper',
    'Plastic',
    'Glass',
    'Metal',
    'Other / Uncertain',
  ];
  if (!validCategories.includes(data.materialCategory)) {
    errors.materialCategory = 'Please select a valid material category.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'Invalid file format. Supported formats are JPEG, PNG, and WebP.',
    };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    return {
      isValid: false,
      error: `File size (${sizeMb} MB) exceeds maximum allowed limit of 5 MB.`,
    };
  }

  return { isValid: true };
}
