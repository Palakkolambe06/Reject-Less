import React, { useState, useRef } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import { validateImageFile } from '../../utils/validation';

interface PhotoUploaderProps {
  onImageSelected: (file: File, previewUrl: string) => void;
  onImageRemoved: () => void;
  initialPreviewUrl?: string;
  disabled?: boolean;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  onImageSelected,
  onImageRemoved,
  initialPreviewUrl,
  disabled = false,
}) => {
  const [preview, setPreview] = useState<string | null>(initialPreviewUrl || null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setError(null);
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      onImageSelected(file, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onImageRemoved();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700">
          Waste Material Photograph
        </label>
        <span className="text-[11px] text-slate-500 font-mono">Max 5 MB · JPEG, PNG, WebP</span>
      </div>

      {preview ? (
        <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-900/5 group aspect-video sm:aspect-2/1 flex items-center justify-center shadow-2xs">
          <img
            src={preview}
            alt="Waste material preview"
            className="w-full h-full object-contain max-h-64"
          />
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="px-3.5 py-1.5 bg-white text-slate-900 text-xs font-semibold rounded-lg shadow-sm hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Replace Photo
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled}
              className="px-3.5 py-1.5 bg-rose-600 text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-rose-700 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50/50'
              : 'border-slate-300 hover:border-emerald-600/50 bg-slate-50/60 hover:bg-slate-50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/80 flex items-center justify-center mb-3">
            <Upload className="w-5 h-5" />
          </div>
          <div className="text-xs font-semibold text-slate-800 mb-1">
            Click to upload or drag & drop waste photo
          </div>
          <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
            High-contrast photo of sorting bay, bale, or containers enables AI computer vision material assistance.
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 p-3 rounded-lg border border-rose-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
};
