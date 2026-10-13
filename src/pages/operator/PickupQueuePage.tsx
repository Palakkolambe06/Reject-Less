import React, { useState, useEffect } from 'react';
import { WasteBatch } from '../../types/batch';
import { DemoUser } from '../../types/user';
import { batchService } from '../../services/batchService';
import { handoverService } from '../../services/handoverService';
import {
  Truck,
  Calendar,
  CheckCircle2,
  X,
} from 'lucide-react';

interface PickupQueuePageProps {
  activeUser: DemoUser;
  onNavigate: (path: string) => void;
  onSelectBatch: (id: string) => void;
}

export const PickupQueuePage: React.FC<PickupQueuePageProps> = ({
  activeUser,
  onSelectBatch,
}) => {
  const [batches, setBatches] = useState<WasteBatch[]>([]);
  const [activeBatch, setActiveBatch] = useState<WasteBatch | null>(null);

  // Scheduling modal state
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(
    new Date(Date.now() + 86400000).toISOString().substring(0, 16)
  );
  const [driverName, setDriverName] = useState('Vikram Shinde');
  const [vehicleRef, setVehicleRef] = useState('MH-12-FC-4491');
  const [scheduleNotes, setScheduleNotes] = useState('');

  // Dispatch progress state
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [dispatchStage, setDispatchStage] = useState<'PICKED UP' | 'HANDED OVER'>('PICKED UP');
  const [dispatchNotes, setDispatchNotes] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadData = async () => {
    const all = await batchService.getAll();
    const queue = all.filter(
      (b) =>
        b.status === 'ACCEPTED' ||
        b.status === 'SCHEDULED' ||
        b.status === 'PICKED UP' ||
        b.status === 'HANDED OVER'
    );
    setBatches(queue);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenSchedule = (b: WasteBatch) => {
    setActiveBatch(b);
    setScheduledDate(
      b.scheduledHandoverDate
        ? b.scheduledHandoverDate.substring(0, 16)
        : new Date(Date.now() + 86400000).toISOString().substring(0, 16)
    );
    setDriverName(b.assignedOperatorName || 'Vikram Shinde');
    setVehicleRef('MH-12-FC-4491');
    setScheduleNotes(b.handoverNotes || '');
    setIsScheduleModalOpen(true);
    setFeedback(null);
  };

  const handleConfirmSchedule = async () => {
    if (!activeBatch) return;
    const res = handoverService.scheduleHandover(
      activeBatch,
      {
        batchId: activeBatch.id,
        recipientId: activeBatch.matchedRecipientId || '',
        scheduledDate,
        contactPerson: driverName,
        contactPhone: '+91 98220 11223',
        assignedOperatorId: activeUser.id,
        assignedOperatorName: driverName,
        handoverNotes: `Assigned to ${driverName} (${vehicleRef}). ${scheduleNotes}`,
      },
      activeUser.name
    );
    if (res.success && res.batch) {
      await batchService.updateBatch(res.batch);
      setFeedback(`Batch ${activeBatch.id} scheduled for pickup on ${scheduledDate}.`);
      setIsScheduleModalOpen(false);
      setActiveBatch(null);
      loadData();
    } else {
      setFeedback(res.error || 'Failed to schedule pickup.');
    }
  };

  const handleOpenProgress = (b: WasteBatch, stage: 'PICKED UP' | 'HANDED OVER') => {
    setActiveBatch(b);
    setDispatchStage(stage);
    setDispatchNotes('');
    setIsDispatchModalOpen(true);
    setFeedback(null);
  };

  const handleConfirmProgress = async () => {
    if (!activeBatch) return;
    if (dispatchStage === 'PICKED UP') {
      const res = handoverService.markPickedUp(
        activeBatch,
        driverName,
        vehicleRef,
        dispatchNotes
      );
      if (res.success && res.batch) {
        await batchService.updateBatch(res.batch);
        setFeedback(`Batch ${activeBatch.id} marked as PICKED UP and in transit.`);
        setIsDispatchModalOpen(false);
        setActiveBatch(null);
        loadData();
      }
    } else {
      const res = handoverService.markHandedOver(
        activeBatch,
        driverName,
        dispatchNotes
      );
      if (res.success && res.batch) {
        await batchService.updateBatch(res.batch);
        setFeedback(`Batch ${activeBatch.id} marked as HANDED OVER at recipient dock.`);
        setIsDispatchModalOpen(false);
        setActiveBatch(null);
        loadData();
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Logistics Dispatch & Pickup Queue
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Coordinate collection runs for accepted batches. Log driver vehicle assignment, loading bay pickup, and receiving dock deliveries.
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 font-mono self-start sm:self-auto">
          Dispatcher: <span className="font-bold">{activeUser.name}</span>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs font-semibold rounded-xl flex items-center justify-between shadow-2xs">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Queue Cards */}
      <div className="space-y-4">
        {batches.length === 0 ? (
          <div className="bg-white p-8 sm:p-12 rounded-xl border border-slate-200/90 text-center space-y-2 shadow-2xs">
            <Truck className="w-8 h-8 mx-auto text-slate-300" />
            <h4 className="text-xs font-bold text-slate-700">No Batches in Fleet Queue</h4>
            <p className="text-xs text-slate-400">
              When recipients accept offers, batches enter this dispatch pipeline automatically.
            </p>
          </div>
        ) : (
          batches.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4 hover:border-slate-300 transition-all card-hover"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-900">{b.id}</span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="text-xs font-semibold text-slate-800">{b.generatorName}</span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="text-xs text-slate-500 font-mono">{b.pickupLocation.city}</span>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span
                    className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${
                      b.status === 'ACCEPTED'
                        ? 'bg-sky-50 text-sky-800 border-sky-200'
                        : b.status === 'SCHEDULED'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : b.status === 'PICKED UP'
                        ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    STATUS: {b.status}
                  </span>
                </div>
              </div>

              {/* Parameters Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50/80 p-3.5 rounded-lg text-xs border border-slate-100">
                <div>
                  <span className="text-[11px] text-slate-500 block">Quantity & Stream</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {b.quantity} {b.unit} of {b.materialCategory}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Packaging</span>
                  <span className="font-medium text-slate-800">{b.packagingType}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Assigned Driver</span>
                  <span className="font-medium text-slate-800">{b.assignedOperatorName || 'Unassigned'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Target Window</span>
                  <span className="font-mono text-slate-800">
                    {b.scheduledHandoverDate
                      ? new Date(b.scheduledHandoverDate).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Pending Scheduling'}
                  </span>
                </div>
              </div>

              {/* Action Buttons along the progression */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => onSelectBatch(b.id)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                >
                  Inspect Batch & Audit Timeline
                </button>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {b.status === 'ACCEPTED' && (
                    <button
                      onClick={() => handleOpenSchedule(b)}
                      className="px-4 py-1.5 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Lock Driver & Schedule Slot</span>
                    </button>
                  )}
                  {b.status === 'SCHEDULED' && (
                    <button
                      onClick={() => handleOpenProgress(b, 'PICKED UP')}
                      className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-700 hover:bg-indigo-800 rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Confirm Driver Loading (Picked Up)</span>
                    </button>
                  )}
                  {b.status === 'PICKED UP' && (
                    <button
                      onClick={() => handleOpenProgress(b, 'HANDED OVER')}
                      className="px-4 py-1.5 text-xs font-bold text-white bg-teal-800 hover:bg-teal-700 rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirm Arrival at Recipient Dock</span>
                    </button>
                  )}
                  {b.status === 'HANDED OVER' && (
                    <span className="text-xs text-slate-500 italic">
                      Staged at dock — Awaiting recipient gate intake clearance
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* SCHEDULE MODAL */}
      {isScheduleModalOpen && activeBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-600" />
                <span>Schedule Collection & Driver Assignment</span>
              </h3>
              <button onClick={() => setIsScheduleModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-lg text-xs space-y-1 border border-slate-100">
              <div>
                Batch: <strong>{activeBatch.id}</strong> ({activeBatch.quantity} {activeBatch.unit} of{' '}
                {activeBatch.materialCategory})
              </div>
              <div className="text-slate-500">
                Pickup Address: {activeBatch.pickupLocation.address}, {activeBatch.pickupLocation.city}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Pickup Date & Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-600"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Driver Name
                </label>
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Vehicle Registration
                </label>
                <input
                  type="text"
                  value={vehicleRef}
                  onChange={(e) => setVehicleRef(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Logistics Instructions / Bay Notes
              </label>
              <textarea
                value={scheduleNotes}
                onChange={(e) => setScheduleNotes(e.target.value)}
                rows={2}
                placeholder="e.g. Loading from Gate 3 ramp. Flatbed with hydraulic tailgate."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSchedule}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-lg shadow-xs cursor-pointer"
              >
                Lock Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISPATCH PROGRESS MODAL */}
      {isDispatchModalOpen && activeBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-600" />
                <span>
                  {dispatchStage === 'PICKED UP' ? 'Confirm Vehicle Loading' : 'Confirm Dock Delivery'}
                </span>
              </h3>
              <button onClick={() => setIsDispatchModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {dispatchStage === 'PICKED UP'
                ? `Recording that driver ${driverName} has loaded batch ${activeBatch.id} onto vehicle ${vehicleRef} and is actively in transit.`
                : `Recording that driver ${driverName} has physically arrived and staged batch ${activeBatch.id} at the recipient intake dock.`}
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Operator Notes (Optional)
              </label>
              <textarea
                value={dispatchNotes}
                onChange={(e) => setDispatchNotes(e.target.value)}
                rows={2}
                placeholder="e.g. Strapping checked, cargo intact. Departure logged."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsDispatchModalOpen(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmProgress}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs cursor-pointer"
              >
                Confirm {dispatchStage}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
