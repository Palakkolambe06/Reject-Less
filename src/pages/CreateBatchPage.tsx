import React, { useState } from 'react';
import { BatchForm } from '../components/batches/BatchForm';
import { CreateBatchInput, batchService } from '../services/batchService';

interface CreateBatchPageProps {
  onNavigate: (path: string) => void;
  onBatchCreated: (batchId: string) => void;
}

export const CreateBatchPage: React.FC<CreateBatchPageProps> = ({
  onNavigate,
  onBatchCreated,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CreateBatchInput) => {
    setIsSubmitting(true);
    try {
      const created = await batchService.createBatch(data);
      onBatchCreated(created.id);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Register New Waste Batch</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Upload waste photograph for AI vision triage, confirm material, and declare initial physical specifications
        </p>
      </div>

      <BatchForm
        onSubmit={handleSubmit}
        onCancel={() => onNavigate('/batches')}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
