import React, { useState, useEffect, useRef } from 'react';
import { WasteBatch } from '../types/batch';
import { batchService } from '../services/batchService';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { EmptyState } from '../components/ui/EmptyState';
import { BatchCard } from '../components/batches/BatchCard';
import {
  Search,
  PlusCircle,
  PackageCheck,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Clock,
  LayoutGrid,
  List,
  Layers,
  Truck,
  RotateCcw,
  Filter,
  Check,
  X,
  Sparkles,
} from 'lucide-react';

interface BatchesPageProps {
  onNavigate: (path: string) => void;
  onSelectBatch: (id: string) => void;
}

export interface StatusFilterOption {
  value: string;
  label: string;
  aliases: string[];
  dotColor: string;
}

const STATUS_FILTER_OPTIONS: StatusFilterOption[] = [
  {
    value: 'ALL',
    label: 'All Statuses',
    aliases: ['ALL'],
    dotColor: 'bg-slate-400',
  },
  {
    value: 'PREPARATION',
    label: 'In Preparation',
    aliases: ['PREPARATION', 'In Preparation', 'IN PREPARATION'],
    dotColor: 'bg-amber-500',
  },
  {
    value: 'READY',
    label: 'Ready for Matching',
    aliases: ['READY', 'Ready for Matching', 'READY FOR MATCHING'],
    dotColor: 'bg-emerald-500',
  },
  {
    value: 'ACCEPTED',
    label: 'Accepted',
    aliases: ['ACCEPTED', 'Accepted'],
    dotColor: 'bg-teal-500',
  },
  {
    value: 'HANDED OVER',
    label: 'Handed Over',
    aliases: ['HANDED OVER', 'Handed Over', 'HANDED_OVER'],
    dotColor: 'bg-emerald-600',
  },
  {
    value: 'OFFERED',
    label: 'Offered to Recipient',
    aliases: ['OFFERED', 'Offered'],
    dotColor: 'bg-sky-500',
  },
  {
    value: 'SCHEDULED',
    label: 'Scheduled',
    aliases: ['SCHEDULED', 'Scheduled'],
    dotColor: 'bg-indigo-500',
  },
  {
    value: 'PICKED UP',
    label: 'Picked Up (In Transit)',
    aliases: ['PICKED UP', 'Picked Up', 'PICKED_UP'],
    dotColor: 'bg-blue-500',
  },
  {
    value: 'RECEIVED',
    label: 'Received & Diverted',
    aliases: ['RECEIVED', 'Received'],
    dotColor: 'bg-teal-600',
  },
  {
    value: 'DRAFT',
    label: 'Draft',
    aliases: ['DRAFT', 'Draft'],
    dotColor: 'bg-slate-400',
  },
  {
    value: 'REJECTED',
    label: 'Rejected',
    aliases: ['REJECTED', 'Rejected'],
    dotColor: 'bg-rose-500',
  },
];

export const BatchesPage: React.FC<BatchesPageProps> = ({
  onNavigate,
  onSelectBatch,
}) => {
  const [batches, setBatches] = useState<WasteBatch[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [materialFilter, setMaterialFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  const statusDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    batchService.getAll().then(setBatches);
  }, []);

  // Close dropdown menu on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target as Node)
      ) {
        setIsStatusDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Check if a batch matches the selected statusFilter
  const matchesStatusFilter = (batch: WasteBatch, filterVal: string): boolean => {
    if (filterVal === 'ALL') return true;
    const option = STATUS_FILTER_OPTIONS.find(
      (opt) => opt.value === filterVal || opt.label === filterVal
    );
    if (option) {
      return (
        batch.status === option.value ||
        option.aliases.some(
          (alias) => alias.toLowerCase() === batch.status.toLowerCase()
        )
      );
    }
    return (
      batch.status.toLowerCase() === filterVal.toLowerCase() ||
      batch.status === filterVal
    );
  };

  const filteredBatches = batches.filter((b) => {
    const matchesSearch =
      b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.generatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.pickupLocation.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.materialCategory.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = matchesStatusFilter(b, statusFilter);
    const matchesMaterial =
      materialFilter === 'ALL' || b.materialCategory === materialFilter;

    return matchesSearch && matchesStatus && matchesMaterial;
  });

  const totalBatches = batches.length;
  const readyBatches = batches.filter((b) => b.isReadyForMatching).length;
  const inTransitBatches = batches.filter((b) =>
    ['SCHEDULED', 'PICKED UP', 'HANDED OVER'].includes(b.status)
  ).length;
  const receivedBatches = batches.filter((b) => b.status === 'RECEIVED').length;

  // Active status option object
  const activeStatusOption =
    STATUS_FILTER_OPTIONS.find(
      (opt) => opt.value === statusFilter || opt.label === statusFilter
    ) || STATUS_FILTER_OPTIONS[0];

  const handleQuickAction = (
    action: 'readiness' | 'matching' | 'handover',
    batchId: string
  ) => {
    if (action === 'readiness') onNavigate(`/readiness?batchId=${batchId}`);
    else if (action === 'matching') onNavigate(`/recipients?batchId=${batchId}`);
    else if (action === 'handover') onNavigate(`/handovers?batchId=${batchId}`);
  };

  // Pre-calculate status counts for dropdown & pill items
  const getStatusCount = (opt: StatusFilterOption): number => {
    if (opt.value === 'ALL') return batches.length;
    return batches.filter((b) => matchesStatusFilter(b, opt.value)).length;
  };

  // Quick filter pills list (common primary actions)
  const quickPillStatuses = [
    'ALL',
    'PREPARATION',
    'READY',
    'ACCEPTED',
    'HANDED OVER',
    'RECEIVED',
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Waste Batches Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Explore, filter and inspect circular waste streams throughout sorting, verification and recipient delivery
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={() => onNavigate('/create-batch')}
            icon={<PlusCircle className="w-4 h-4" />}
          >
            Register New Batch
          </Button>
        </div>
      </div>

      {/* Compact Quick Statistic Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider">
              Total Batches
            </span>
            <div className="text-lg font-extrabold text-slate-900 font-mono mt-0.5">
              {totalBatches}
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-emerald-700 font-bold tracking-wider">
              Ready to Match
            </span>
            <div className="text-lg font-extrabold text-emerald-900 font-mono mt-0.5">
              {readyBatches}
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-indigo-700 font-bold tracking-wider">
              Active Logistics
            </span>
            <div className="text-lg font-extrabold text-indigo-900 font-mono mt-0.5">
              {inTransitBatches}
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <Truck className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-teal-700 font-bold tracking-wider">
              Delivered / Diverted
            </span>
            <div className="text-lg font-extrabold text-teal-900 font-mono mt-0.5">
              {receivedBatches}
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
            <RotateCcw className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Search and Filters Strip */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by ID, generator, city..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 placeholder:text-slate-400"
              />
            </div>

            {/* Custom Interactive Status Filtering Dropdown Menu */}
            <div className="relative" ref={statusDropdownRef}>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                  className={`w-full px-3 py-2 text-xs rounded-lg border flex items-center justify-between gap-2 transition-all cursor-pointer bg-white text-left ${
                    statusFilter !== 'ALL'
                      ? 'border-emerald-600 ring-1 ring-emerald-600 bg-emerald-50/20 text-emerald-950 font-semibold'
                      : 'border-slate-300 hover:border-slate-400 text-slate-800'
                  }`}
                  aria-haspopup="listbox"
                  aria-expanded={isStatusDropdownOpen}
                  title="Filter batches by status"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-slate-500 font-normal">Status:</span>
                    <span className="flex items-center gap-1.5 font-semibold text-slate-900 truncate">
                      <span
                        className={`w-2 h-2 rounded-full ${activeStatusOption.dotColor} shrink-0`}
                      />
                      {activeStatusOption.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {statusFilter !== 'ALL' && (
                      <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-900 font-bold">
                        {filteredBatches.length}
                      </span>
                    )}
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                        isStatusDropdownOpen ? 'rotate-180 text-emerald-700' : ''
                      }`}
                    />
                  </div>
                </button>
              </div>

              {/* Status Dropdown Menu Popover */}
              {isStatusDropdownOpen && (
                <div
                  className="absolute left-0 top-full mt-1.5 w-72 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-xl border border-slate-200/90 py-1.5 z-40 text-slate-800 animate-in fade-in zoom-in-95 duration-100"
                  role="listbox"
                >
                  {/* Dropdown Header */}
                  <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                      Filter by Batch Status
                    </span>
                    {statusFilter !== 'ALL' && (
                      <button
                        type="button"
                        onClick={() => {
                          setStatusFilter('ALL');
                          setIsStatusDropdownOpen(false);
                        }}
                        className="text-[11px] text-emerald-700 hover:text-emerald-950 font-semibold cursor-pointer"
                      >
                        Reset to All
                      </button>
                    )}
                  </div>

                  {/* Dropdown Options List */}
                  <div className="max-h-64 overflow-y-auto py-1 divide-y divide-slate-50">
                    {STATUS_FILTER_OPTIONS.map((option) => {
                      const isSelected =
                        statusFilter === option.value ||
                        statusFilter === option.label;
                      const count = getStatusCount(option);

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setStatusFilter(option.value);
                            setIsStatusDropdownOpen(false);
                          }}
                          className={`w-full px-3.5 py-2 text-left text-xs flex items-center justify-between transition-colors cursor-pointer hover:bg-slate-50 ${
                            isSelected
                              ? 'bg-emerald-50/80 font-bold text-emerald-950'
                              : 'text-slate-700'
                          }`}
                          role="option"
                          aria-selected={isSelected}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${option.dotColor}`}
                            />
                            <span className="truncate">{option.label}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                                isSelected
                                  ? 'bg-emerald-200/70 text-emerald-900 font-bold'
                                  : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {count}
                            </span>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-emerald-700" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Material Category Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500 shrink-0">
                Material:
              </span>
              <select
                value={materialFilter}
                onChange={(e) => setMaterialFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer"
              >
                <option value="ALL">All Material Streams</option>
                <option value="Cardboard">Cardboard</option>
                <option value="Paper">Paper</option>
                <option value="Plastic">Plastic</option>
                <option value="Glass">Glass</option>
                <option value="Metal">Metal</option>
                <option value="Other / Uncertain">Other / Uncertain</option>
              </select>
            </div>
          </div>

          {/* View Mode Toggle: Grid Cards vs Table */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg shrink-0 self-end md:self-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-emerald-950 font-bold shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Grid photo cards view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-emerald-950 font-bold shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Compact tabular view"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>
        </div>

        {/* Quick Status Filter Pills for Fast Access */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-medium text-slate-400 mr-1 hidden sm:inline">
            Quick status:
          </span>
          {STATUS_FILTER_OPTIONS.filter((opt) =>
            quickPillStatuses.includes(opt.value)
          ).map((opt) => {
            const isSelected =
              statusFilter === opt.value || statusFilter === opt.label;
            const count = getStatusCount(opt);

            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStatusFilter(opt.value)}
                className={`px-2.5 py-1 text-xs rounded-full border transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-900 text-white border-emerald-900 font-bold shadow-2xs'
                    : 'bg-slate-50/80 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isSelected ? 'bg-emerald-300' : opt.dotColor
                  }`}
                />
                <span>{opt.label}</span>
                <span
                  className={`font-mono text-[10px] px-1 rounded-sm ${
                    isSelected
                      ? 'bg-emerald-800 text-emerald-100'
                      : 'text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}

          {/* Active Filter Clear Tag */}
          {(statusFilter !== 'ALL' || materialFilter !== 'ALL' || searchTerm) && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter('ALL');
                setMaterialFilter('ALL');
                setSearchTerm('');
              }}
              className="ml-auto text-[11px] text-slate-500 hover:text-rose-600 font-medium flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3 h-3" />
              <span>Clear filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Batches Content Area */}
      {filteredBatches.length === 0 ? (
        <EmptyState
          icon={<PackageCheck className="w-6 h-6" />}
          title="No matching waste batches found"
          description={
            statusFilter !== 'ALL'
              ? `No waste batches found with status "${activeStatusOption.label}". Try selecting "All Statuses" or adjusting your search.`
              : 'Try adjusting your search query or filters, or register a new waste batch.'
          }
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchTerm('');
            setStatusFilter('ALL');
            setMaterialFilter('ALL');
          }}
        />
      ) : viewMode === 'grid' ? (
        /* Photo-Rich Grid Cards View (Matches Reference Design) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBatches.map((b) => (
            <BatchCard
              key={b.id}
              batch={b}
              onSelect={onSelectBatch}
              onQuickAction={handleQuickAction}
            />
          ))}
        </div>
      ) : (
        /* Tabular Table View */
        <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Batch ID</th>
                  <th className="py-3 px-4">Generator & City</th>
                  <th className="py-3 px-4">Material</th>
                  <th className="py-3 px-4 text-right">Quantity</th>
                  <th className="py-3 px-4">Packaging</th>
                  <th className="py-3 px-4">Readiness</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBatches.map((b) => (
                  <tr
                    key={b.id}
                    onClick={() => onSelectBatch(b.id)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 group-hover:text-emerald-800">
                      {b.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">
                        {b.generatorName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {b.pickupLocation.city}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {b.materialCategory}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums font-semibold text-slate-900">
                      {b.quantity} {b.unit}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div>{b.packagingType}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                        {b.contaminationLevel.split(' ')[0]}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {b.isReadyForMatching ? (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Certified
                        </span>
                      ) : (
                        <span className="text-amber-700 font-semibold flex items-center gap-1 text-[11px]">
                          <Clock className="w-3.5 h-3.5" />
                          Incomplete
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={b.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center text-emerald-800 font-semibold group-hover:translate-x-0.5 transition-transform text-[11px]">
                        Inspect
                        <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
