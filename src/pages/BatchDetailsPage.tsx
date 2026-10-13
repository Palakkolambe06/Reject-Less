import React, { useState, useEffect } from 'react';
import { WasteBatch } from '../types/batch';
import { Recipient } from '../types/recipient';
import { batchService } from '../services/batchService';
import { recipientService } from '../services/recipientService';
import { BatchDetails } from '../components/batches/BatchDetails';
import { ArrowLeft, Clock } from 'lucide-react';

interface BatchDetailsPageProps {
  batchId: string;
  onNavigate: (path: string) => void;
  onSelectBatchForReadiness: (id: string) => void;
  onSelectBatchForMatching: (id: string) => void;
  onSelectBatchForHandover: (id: string) => void;
}

export const BatchDetailsPage: React.FC<BatchDetailsPageProps> = ({
  batchId,
  onNavigate,
  onSelectBatchForReadiness,
  onSelectBatchForMatching,
  onSelectBatchForHandover,
}) => {
  const [batch, setBatch] = useState<WasteBatch | null>(null);
  const [matchedRecipient, setMatchedRecipient] = useState<Recipient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const b = await batchService.getById(batchId);
      setBatch(b);
      if (b && b.matchedRecipientId) {
        const r = await recipientService.getById(b.matchedRecipientId);
        setMatchedRecipient(r);
      } else {
        setMatchedRecipient(null);
      }
      setLoading(false);
    };
    load();
  }, [batchId]);

  const handleDelete = async () => {
    if (!batch) return;
    const confirmDelete = window.confirm(`Are you sure you want to delete draft batch ${batch.id}?`);
    if (confirmDelete) {
      await batchService.deleteBatch(batch.id);
      onNavigate('/batches');
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-xs text-slate-500 font-mono">
        Loading batch records...
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 text-center space-y-3">
        <Clock className="w-10 h-10 mx-auto text-slate-400" />
        <h3 className="text-sm font-bold text-slate-800">Batch Not Found</h3>
        <p className="text-xs text-slate-500">
          The requested batch ID ({batchId}) does not exist in local records.
        </p>
        <button
          onClick={() => onNavigate('/batches')}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Batches</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('/batches')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Batches</span>
        </button>
      </div>

      <BatchDetails
        batch={batch}
        matchedRecipient={matchedRecipient}
        onNavigateToReadiness={() => onSelectBatchForReadiness(batch.id)}
        onNavigateToMatching={() => onSelectBatchForMatching(batch.id)}
        onNavigateToHandover={() => onSelectBatchForHandover(batch.id)}
        onDeleteBatch={batch.status === 'DRAFT' ? handleDelete : undefined}
      />
    </div>
  );
};
