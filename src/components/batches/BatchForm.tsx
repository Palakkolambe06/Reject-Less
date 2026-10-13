import React, { useState } from 'react';
import {
  MaterialCategory,
  QuantityUnit,
  PackagingType,
  ContaminationLevel,
} from '../../types/batch';
import { ClassifiedResult } from '../../types/ai';
import { CreateBatchInput } from '../../services/batchService';
import { validateBatchForm, BatchValidationErrors } from '../../utils/validation';
import { PhotoUploader } from './PhotoUploader';
import { MaterialPrediction } from './MaterialPrediction';
import { AlertCircle, Save, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';

interface BatchFormProps {
  onSubmit: (data: CreateBatchInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const BatchForm: React.FC<BatchFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  // Form state
  const [generatorName, setGeneratorName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Pune');
  const [pincode, setPincode] = useState('411001');
  const [materialCategory, setMaterialCategory] = useState<MaterialCategory>('Cardboard');
  const [isHumanConfirmed, setIsHumanConfirmed] = useState(false);
  const [quantity, setQuantity] = useState<string>('150');
  const [unit, setUnit] = useState<QuantityUnit>('kg');
  const [packagingType, setPackagingType] = useState<PackagingType>('Baled');
  const [contaminationLevel, setContaminationLevel] = useState<ContaminationLevel>(
    'None (Clean & Sorted)'
  );
  const [description, setDescription] = useState('');

  // Image & AI state
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [aiPrediction, setAiPrediction] = useState<ClassifiedResult | null>(null);

  // Validation errors
  const [errors, setErrors] = useState<BatchValidationErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const handleImageSelected = (file: File, previewUrl: string) => {
    setPhotoFile(file);
    setPhotoUrl(previewUrl);
    setErrors((prev) => ({ ...prev, photo: undefined }));
  };

  const handleImageRemoved = () => {
    setPhotoFile(null);
    setPhotoUrl(null);
    setAiPrediction(null);
  };

  const handleCategoryConfirmed = (cat: MaterialCategory, pred?: ClassifiedResult) => {
    setMaterialCategory(cat);
    setIsHumanConfirmed(true);
    if (pred) {
      setAiPrediction(pred);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    const validation = validateBatchForm({
      generatorName,
      address,
      city,
      pincode,
      materialCategory,
      quantity,
      unit,
      packagingType,
      contaminationLevel,
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    if (!isHumanConfirmed) {
      setGeneralError(
        'Human confirmation required: Please confirm or select the verified material category before registering this batch.'
      );
      return;
    }

    try {
      const payload: CreateBatchInput = {
        generatorName: generatorName.trim(),
        address: address.trim(),
        city: city.trim(),
        pincode: pincode.trim(),
        materialCategory,
        isHumanConfirmed: true,
        quantity: parseFloat(quantity),
        unit,
        packagingType,
        contaminationLevel,
        description: description.trim() || undefined,
        photoUrl: photoUrl || undefined,
        photoMetadata: photoFile
          ? {
              name: photoFile.name,
              sizeBytes: photoFile.size,
              mimeType: photoFile.type,
              uploadedAt: new Date().toISOString(),
            }
          : undefined,
        aiPrediction: aiPrediction
          ? {
              predictedCategory: aiPrediction.predictedCategory,
              rawLabel: aiPrediction.rawLabel,
              confidence: aiPrediction.confidence,
              inferenceSource: aiPrediction.isSimulation ? 'demo_simulation' : 'open_weights_api',
              modelIdentifier: aiPrediction.modelIdentifier,
              predictedAt: aiPrediction.predictedAt,
              isSimulation: aiPrediction.isSimulation,
              disclaimer: aiPrediction.disclaimer,
            }
          : undefined,
      };

      await onSubmit(payload);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save batch.';
      setGeneralError(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* General error banner */}
      {generalError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 shadow-2xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Validation Notice: </span>
            {generalError}
          </div>
        </div>
      )}

      {/* Grid: 2 columns for large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Waste Photo & AI Identification */}
        <div className="space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                1. Visual Capture & AI Triage
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload image of waste sorting bay to run open-weight ViT classification
              </p>
            </div>

            <PhotoUploader
              onImageSelected={handleImageSelected}
              onImageRemoved={handleImageRemoved}
              disabled={isSubmitting}
            />

            {/* AI Identification Panel */}
            <MaterialPrediction
              photoFile={photoFile}
              photoUrl={photoUrl}
              currentConfirmedCategory={isHumanConfirmed ? materialCategory : undefined}
              onConfirmCategory={handleCategoryConfirmed}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Right Column: Source & Material Parameters */}
        <div className="space-y-6">
          {/* Generator Information Card */}
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                2. Generator & Location Details
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Specify origin premises and logistics access point
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Waste Generator / Facility Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={generatorName}
                onChange={(e) => setGeneratorName(e.target.value)}
                placeholder="e.g. MIT-ADT Campus Canteen, Magarpatta Cybercity"
                className={`w-full px-3 py-2 text-xs rounded-lg border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 ${
                  errors.generatorName ? 'border-rose-300 bg-rose-50/30' : 'border-slate-300'
                }`}
                disabled={isSubmitting}
              />
              {errors.generatorName && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.generatorName}</p>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pickup Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Loading Dock Gate 3, Vishwarajbaug"
                  className={`w-full px-3 py-2 text-xs rounded-lg border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 ${
                    errors.address ? 'border-rose-300' : 'border-slate-300'
                  }`}
                  disabled={isSubmitting}
                />
                {errors.address && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.address}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Pune"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pincode (6 digits) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    maxLength={6}
                    placeholder="412201"
                    className={`w-full px-3 py-2 text-xs rounded-lg border bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 ${
                      errors.pincode ? 'border-rose-300' : 'border-slate-300'
                    }`}
                    disabled={isSubmitting}
                  />
                  {errors.pincode && (
                    <p className="text-[11px] text-rose-600 mt-1">{errors.pincode}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Batch Metrics Card */}
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                3. Quantity, Packaging & Condition
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Physical parameters matched against recycler intake capabilities
              </p>
            </div>

            {/* Quantity and Unit */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quantity <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="any"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g. 250"
                  className={`w-full px-3 py-2 text-xs rounded-lg border bg-white text-slate-900 font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-700 ${
                    errors.quantity ? 'border-rose-300' : 'border-slate-300'
                  }`}
                  disabled={isSubmitting}
                />
                {errors.quantity && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.quantity}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Unit <span className="text-rose-500">*</span>
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as QuantityUnit)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  disabled={isSubmitting}
                >
                  <option value="kg">kg (Kilograms)</option>
                  <option value="tonnes">tonnes (Metric Tons)</option>
                  <option value="bales">bales (~200 kg ea.)</option>
                  <option value="bags">bags (~25 kg ea.)</option>
                </select>
              </div>
            </div>

            {/* Packaging and Contamination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Packaging Format <span className="text-rose-500">*</span>
                </label>
                <select
                  value={packagingType}
                  onChange={(e) => setPackagingType(e.target.value as PackagingType)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  disabled={isSubmitting}
                >
                  <option value="Baled">Baled (Strapped)</option>
                  <option value="Boxed">Boxed (Rigid cartons)</option>
                  <option value="Bagged">Bagged (Tied sacks)</option>
                  <option value="Stacked on Pallet">Stacked on Pallet</option>
                  <option value="Loose">Loose (Unbundled)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Initial Cleanliness Observation <span className="text-rose-500">*</span>
                </label>
                <select
                  value={contaminationLevel}
                  onChange={(e) => setContaminationLevel(e.target.value as ContaminationLevel)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  disabled={isSubmitting}
                >
                  <option value="None (Clean & Sorted)">None (Clean & Sorted)</option>
                  <option value="Minor Dry Dust / Labels">Minor Dry Dust / Labels</option>
                  <option value="Noticeable Dirt / Residue">Noticeable Dirt / Residue</option>
                  <option value="Severe / Organic / Wet Contamination">
                    Severe / Organic / Wet Contamination
                  </option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Batch Description or Handling Notes (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="e.g. Corrugated packaging from weekly food supplies. Tape removed."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
          icon={<ArrowLeft className="w-4 h-4" />}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          icon={<Save className="w-4 h-4" />}
        >
          Register Waste Batch
        </Button>
      </div>
    </form>
  );
};
