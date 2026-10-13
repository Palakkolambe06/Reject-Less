import React, { useState, useEffect } from 'react';
import { WasteBatch, ReadinessChecklist as IReadinessChecklist } from '../types/batch';
import { batchService } from '../services/batchService';
import { readinessService } from '../services/readinessService';
import { ReadinessChecklist } from '../components/readiness/ReadinessChecklist';
import { ArrowRight, PackageCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';

interface ReadinessPageProps {
  initialBatchId?: string;
  onNavigate: (path: string) => void;
  onProceedToMatching: (batchId: string) => void;
}

export const ReadinessPage: React.FC<ReadinessPageProps> = ({
  initialBatchId,
  onNavigate,
  onProceedToMatching,
}) => {
  const [batches, setBatches] = useState<WasteBatch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>(initialBatchId || '');
  const [currentBatch, setCurrentBatch] = useState<WasteBatch | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    batchService.getAll().then((all) => {
      setBatches(all);
      if (all.length > 0) {
        const found = initialBatchId
          ? all.find((b) => b.id === initialBatchId)
          : all.find((b) => b.status === 'PREPARATION' || b.status === 'DRAFT' || b.status === 'REJECTED') || all[0];
        if (found) {
          setSelectedBatchId(found.id);
          setCurrentBatch(found);
        }
      }
    });
  }, [initialBatchId]);

  const handleBatchChange = (id: string) => {
    setSelectedBatchId(id);
    const b = batches.find((x) => x.id === id) || null;
    setCurrentBatch(b);
  };

  const handleSaveChecklist = async (updatedChecklist: IReadinessChecklist) => {
    if (!currentBatch) return;
    setIsSaving(true);
    try {
      const updated = readinessService.updateChecklistInBatch(currentBatch, updatedChecklist);
      await batchService.updateBatch(updated);
      setCurrentBatch(updated);
      // Update in batches array
      setBatches((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Waste Readiness Verification
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Physical quality gate: single-stream sorting, moisture, cleanliness, and packaging suitability
          </p>
        </div>

        {/* Batch Selector Dropdown */}
        {batches.length > 0 && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-semibold text-slate-600 shrink-0">Inspecting Batch:</span>
            <select
              value={selectedBatchId}
              onChange={(e) => handleBatchChange(e.target.value)}
              className="px-3 py-2 text-xs font-mono font-bold rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            >
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.id} — {b.materialCategory} ({b.quantity} {b.unit}) [{b.status}]
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {currentBatch ? (
        <div className="space-y-6">
          <ReadinessChecklist
            batch={currentBatch}
            onSaveChecklist={handleSaveChecklist}
            isSaving={isSaving}
          />

          {/* Quick link to proceed to matching when certified */}
          {currentBatch.isReadyForMatching && (
            <div className="p-4 sm:p-5 bg-emerald-50/80 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
              <div className="text-xs text-emerald-950 leading-relaxed">
                <strong className="font-bold">Readiness Certified: </strong> All 6 physical quality requirements verified. You can now run deterministic matching against registered Pune recycler profiles.
              </div>
              <Button
                variant="primary"
                onClick={() => onProceedToMatching(currentBatch.id)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="shrink-0"
              >
                Find Eligible Recipient
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-3">
          <PackageCheck className="w-10 h-10 mx-auto text-slate-400" />
          <h3 className="text-sm font-bold text-slate-800">No Batches Available</h3>
          <p className="text-xs text-slate-500">
            Create a waste batch first to perform readiness inspection.
          </p>
        </div>
      )}
    </div>
  );
};
