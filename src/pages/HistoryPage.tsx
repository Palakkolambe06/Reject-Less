import React, { useState, useEffect } from 'react';
import { WasteBatch } from '../types/batch';
import { batchService } from '../services/batchService';
import { formatDateTime } from '../utils/dateFormat';
import { StatusBadge } from '../components/ui/StatusBadge';
import { EmptyState } from '../components/ui/EmptyState';
import {
  History,
  Search,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ArrowUpDown,
} from 'lucide-react';

interface HistoryPageProps {
  onNavigate: (path: string) => void;
  onSelectBatch: (id: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  onSelectBatch,
}) => {
  const [batches, setBatches] = useState<WasteBatch[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'REJECTIONS' | 'RECOVERED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [materialFilter, setMaterialFilter] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  useEffect(() => {
    batchService.getAll().then(setBatches);
  }, []);

  const filteredBatches = batches
    .filter((b) => {
      if (activeTab === 'REJECTIONS' && b.status !== 'REJECTED') return false;
      if (activeTab === 'RECOVERED' && b.status !== 'RECEIVED') return false;

      const matchesSearch =
        b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.generatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.rejectionReason && b.rejectionReason.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (b.evidenceReference && b.evidenceReference.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesMaterial = materialFilter === 'ALL' || b.materialCategory === materialFilter;

      return matchesSearch && matchesMaterial;
    })
    .sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });

  const rejectionsCount = batches.filter((b) => b.status === 'REJECTED').length;
  const receivedCount = batches.filter((b) => b.status === 'RECEIVED').length;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Audit Trail & Rejection Analytics
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Trace recorded batch outcomes, examine why shipments were rejected, and verify corrective adjustments
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'ALL'
              ? 'border-emerald-800 text-emerald-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          All Activity ({batches.length})
        </button>
        <button
          onClick={() => setActiveTab('REJECTIONS')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'REJECTIONS'
              ? 'border-rose-600 text-rose-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          <span>Rejection Log ({rejectionsCount})</span>
        </button>
        <button
          onClick={() => setActiveTab('RECOVERED')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'RECOVERED'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Received Outcomes ({receivedCount})</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID, reason, slip #..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 shrink-0">Material:</span>
            <select
              value={materialFilter}
              onChange={(e) => setMaterialFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            >
              <option value="ALL">All Materials</option>
              <option value="Cardboard">Cardboard</option>
              <option value="Paper">Paper</option>
              <option value="Plastic">Plastic</option>
              <option value="Glass">Glass</option>
              <option value="Metal">Metal</option>
              <option value="Other / Uncertain">Other / Uncertain</option>
            </select>
          </div>

          <div className="flex items-center justify-end">
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-lg border border-slate-300 transition-colors cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <span>{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Batch Cards / Audit Rows */}
      {filteredBatches.length === 0 ? (
        <EmptyState
          icon={<History className="w-6 h-6" />}
          title="No records matching criteria"
          description={
            activeTab === 'REJECTIONS'
              ? 'No rejected batches logged. All completed shipments were accepted.'
              : 'Try clearing the search query or changing filters.'
          }
          actionLabel="Clear Search"
          onAction={() => setSearchTerm('')}
        />
      ) : (
        <div className="space-y-3">
          {filteredBatches.map((b) => (
            <div
              key={b.id}
              onClick={() => onSelectBatch(b.id)}
              className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 hover:border-slate-300 transition-all cursor-pointer shadow-2xs space-y-3 group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-slate-900 group-hover:text-emerald-800">
                    {b.id}
                  </span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="text-xs font-semibold text-slate-800">
                    {b.quantity} {b.unit} of {b.materialCategory}
                  </span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="text-xs text-slate-500 truncate max-w-xs">{b.generatorName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={b.status} size="sm" />
                  <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                    {formatDateTime(b.updatedAt)}
                  </span>
                </div>
              </div>

              {/* Special Rejection Block if rejected */}
              {b.status === 'REJECTED' && b.rejectionReason && (
                <div className="p-3 bg-rose-50/80 rounded-lg border border-rose-200 text-xs text-rose-900 space-y-1">
                  <div>
                    <strong className="text-rose-950">Recorded Rejection Reason: </strong>
                    {b.rejectionReason}
                  </div>
                  {b.correctiveFeedback && (
                    <div className="text-rose-800">
                      <strong>Corrective Action Guidance: </strong>
                      {b.correctiveFeedback}
                    </div>
                  )}
                </div>
              )}

              {/* Received Proof if received */}
              {b.status === 'RECEIVED' && b.evidenceReference && (
                <div className="p-2.5 bg-emerald-50/70 rounded-lg border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between">
                  <div>
                    <strong>Intake Slip / Reference: </strong>
                    <span className="font-mono font-semibold">{b.evidenceReference}</span>
                  </div>
                  <span className="text-[11px] text-emerald-800 font-medium">User-reported gate outcome</span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-100">
                <span>
                  Packaging: <strong className="text-slate-600 font-medium">{b.packagingType}</strong> · Contamination: <strong className="text-slate-600 font-medium">{b.contaminationLevel.split(' ')[0]}</strong>
                </span>
                <span className="text-emerald-800 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1 text-[11px]">
                  View Full Audit Log
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
