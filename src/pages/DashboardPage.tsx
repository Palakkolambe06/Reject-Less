import React, { useEffect, useState } from 'react';
import { WasteBatch } from '../types/batch';
import { RecipientOffer } from '../types/offer';
import { Recipient } from '../types/recipient';
import { DemoUser } from '../types/user';
import {
  batchService,
  GeneratorDashboardMetrics,
  RecipientDashboardMetrics,
  OperatorDashboardMetrics,
  DashboardMetrics,
} from '../services/batchService';
import { offerService } from '../services/offerService';
import { recipientService } from '../services/recipientService';
import { GeneratorDashboard } from '../components/workspaces/GeneratorDashboard';
import { RecipientDashboard } from '../components/workspaces/RecipientDashboard';
import { OperatorDashboard } from '../components/workspaces/OperatorDashboard';
import { KpiCard } from '../components/ui/KpiCard';
import { Button } from '../components/ui/Button';
import { BatchStatusChart } from '../components/dashboard/BatchStatusChart';
import { RecentBatches } from '../components/dashboard/RecentBatches';
import {
  PackageCheck,
  CheckSquare,
  Building2,
  Truck,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react';

interface DashboardPageProps {
  activeUser: DemoUser;
  onNavigate: (path: string) => void;
  onSelectBatch: (id: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  activeUser,
  onNavigate,
  onSelectBatch,
}) => {
  const [batches, setBatches] = useState<WasteBatch[]>([]);
  const [offers, setOffers] = useState<RecipientOffer[]>([]);
  const [facility, setFacility] = useState<Recipient | null>(null);
  const [genMetrics, setGenMetrics] = useState<GeneratorDashboardMetrics | null>(null);
  const [recMetrics, setRecMetrics] = useState<RecipientDashboardMetrics | null>(null);
  const [opMetrics, setOpMetrics] = useState<OperatorDashboardMetrics | null>(null);
  const [adminMetrics, setAdminMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const bList = await batchService.getAll();
      const oList = await offerService.getAll();
      setBatches(bList);
      setOffers(oList);

      if (activeUser.role === 'generator') {
        const gm = await batchService.getGeneratorMetrics();
        setGenMetrics(gm);
      } else if (activeUser.role === 'recipient') {
        const rec = await recipientService.getById(activeUser.recipientFacilityId || 'REC-PUN-001');
        setFacility(rec);
        const rm = await batchService.getRecipientMetrics(activeUser.recipientFacilityId || 'REC-PUN-001');
        setRecMetrics(rm);
      } else if (activeUser.role === 'operator') {
        const om = await batchService.getOperatorMetrics();
        setOpMetrics(om);
      } else {
        const am = await batchService.getDashboardMetrics();
        setAdminMetrics(am);
      }
      setLoading(false);
    };
    loadData();
  }, [activeUser]);

  if (loading) {
    return (
      <div className="py-16 text-center text-xs text-slate-500 font-mono">
        Aggregating operational waste metrics for {activeUser.role} workspace...
      </div>
    );
  }

  // 1. GENERATOR WORKSPACE
  if (activeUser.role === 'generator' && genMetrics) {
    return (
      <GeneratorDashboard
        metrics={genMetrics}
        batches={batches}
        offers={offers}
        onNavigate={onNavigate}
        onSelectBatch={onSelectBatch}
      />
    );
  }

  // 2. RECIPIENT WORKSPACE
  if (activeUser.role === 'recipient' && recMetrics) {
    const facilityId = activeUser.recipientFacilityId || 'REC-PUN-001';
    const pendingOffers = offers.filter((o) => o.recipientId === facilityId && o.status === 'PENDING');
    const handedOverBatches = batches.filter(
      (b) => b.matchedRecipientId === facilityId && b.status === 'HANDED OVER'
    );
    return (
      <RecipientDashboard
        metrics={recMetrics}
        activeUser={activeUser}
        facility={facility}
        pendingOffers={pendingOffers}
        handedOverBatches={handedOverBatches}
        onNavigate={onNavigate}
        onSelectBatch={onSelectBatch}
      />
    );
  }

  // 3. LOGISTICS OPERATOR WORKSPACE
  if (activeUser.role === 'operator' && opMetrics) {
    return (
      <OperatorDashboard
        metrics={opMetrics}
        activeUser={activeUser}
        batches={batches}
        onNavigate={onNavigate}
        onSelectBatch={onSelectBatch}
      />
    );
  }

  // 4. ADMIN / OVERVIEW WORKSPACE
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-700 mb-1 font-mono">
            <ShieldAlert className="w-4 h-4" />
            <span>System Administration & Audit Desk</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Platform Operations & Multi-Role Audit
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 max-w-2xl leading-relaxed">
            Monitor end-to-end circular waste flows across all generators, recyclers, and logistics operators. Manage deterministic rules, AI inference endpoints, and demo presets.
          </p>
        </div>
        <div className="shrink-0">
          <Button
            variant="secondary"
            onClick={() => onNavigate('/settings')}
          >
            System Configuration
          </Button>
        </div>
      </div>

      {adminMetrics && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <KpiCard
              label="Total Batches"
              value={adminMetrics.totalBatches}
              description="All registered waste streams"
              icon={<PackageCheck className="w-4 h-4 text-slate-700" />}
              onClick={() => onNavigate('/batches')}
            />
            <KpiCard
              label="In Preparation"
              value={adminMetrics.awaitingPreparation}
              description="Checklist verification pending"
              icon={<CheckSquare className="w-4 h-4 text-amber-600" />}
              onClick={() => onNavigate('/readiness')}
            />
            <KpiCard
              label="Ready for Match"
              value={adminMetrics.readyForMatching}
              description="Certified quality gate"
              icon={<CheckCircle2 className="w-4 h-4 text-teal-600" />}
              onClick={() => onNavigate('/recipients')}
            />
            <KpiCard
              label="Matched & Scheduled"
              value={adminMetrics.scheduledHandovers}
              description="Active logistics runs"
              icon={<Truck className="w-4 h-4 text-indigo-600" />}
              onClick={() => onNavigate('/handovers')}
            />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <KpiCard
              label="Recovered Yield"
              value={adminMetrics.receivedCount}
              unit={`(${adminMetrics.totalRecycledWeightKg.toLocaleString()} kg)`}
              description="Verified gate intakes"
              icon={<CheckCircle2 className="w-4 h-4 text-emerald-700" />}
              onClick={() => onNavigate('/history')}
            />
            <KpiCard
              label="Total Rejections"
              value={adminMetrics.rejectedCount}
              description="Pre & post-inspection rejections"
              icon={<AlertTriangle className="w-4 h-4 text-rose-600" />}
              onClick={() => onNavigate('/history')}
            />
            <KpiCard
              label="Active Recyclers"
              value={4}
              description="Verified Pune processing hubs"
              icon={<Building2 className="w-4 h-4 text-cyan-600" />}
              onClick={() => onNavigate('/recipients')}
            />
            <KpiCard
              label="Audit Log Integrity"
              value="100%"
              description="Immutable chain-of-custody"
              icon={<ShieldAlert className="w-4 h-4 text-purple-600" />}
              onClick={() => onNavigate('/history')}
            />
          </div>

          <BatchStatusChart
            statusBreakdown={adminMetrics.statusBreakdown}
            totalBatches={adminMetrics.totalBatches}
          />
        </>
      )}

      <RecentBatches
        batches={batches}
        onSelectBatch={onSelectBatch}
        onCreateBatch={() => onNavigate('/create-batch')}
      />
    </div>
  );
};
