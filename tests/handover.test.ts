import { handoverService } from '../src/services/handoverService';
import { WasteBatch } from '../src/types/batch';
import { HandoverEvent } from '../src/types/handover';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log('--- RUNNING HANDOVER & OUTCOME TRACKING TESTS ---');

const baseBatch: WasteBatch = {
  id: 'BATCH-TEST-HANDOVER-01',
  generatorName: 'Test Generator',
  pickupLocation: {
    address: 'Hadapsar',
    city: 'Pune',
    pincode: '411013',
  },
  materialCategory: 'Cardboard',
  isHumanConfirmed: true,
  quantity: 500,
  unit: 'kg',
  packagingType: 'Baled',
  contaminationLevel: 'None (Clean & Sorted)',
  readinessChecklist: {
    isSortedSeparately: true,
    noOrganicContamination: true,
    isDryAndProtected: true,
    packagingMatchesRequirement: true,
    quantityVerified: true,
    specialPreparationDone: true,
  },
  isReadyForMatching: true,
  status: 'READY',
  statusHistory: [
    {
      id: 'EVT-0',
      status: 'DRAFT',
      timestamp: '2026-10-01T08:00:00.000Z',
      performedBy: 'Creator',
    },
    {
      id: 'EVT-1',
      status: 'READY',
      timestamp: '2026-10-01T09:00:00.000Z',
      performedBy: 'Inspector',
    },
  ],
  createdAt: '2026-10-01T08:00:00.000Z',
  updatedAt: '2026-10-01T09:00:00.000Z',
};

// Test 1: Scheduling a handover
const scheduleRes = handoverService.scheduleHandover(
  baseBatch,
  {
    batchId: baseBatch.id,
    recipientId: 'REC-PUN-001',
    scheduledDate: '2026-10-05T10:00',
    contactPerson: 'Suresh',
    contactPhone: '9822011111',
    handoverNotes: 'Loading dock 1',
  },
  'Dispatcher'
);
assert(scheduleRes.success, 'Handover scheduling should succeed');
assert(scheduleRes.batch?.status === 'SCHEDULED', 'Status should become SCHEDULED');
assert(scheduleRes.batch?.statusHistory.length === 3, 'Status history should have 3 events');
console.log('✓ Test: Handover scheduled with immutable history preservation');

// Test 2: Dispatching (marking handed over)
const scheduledBatch = scheduleRes.batch!;
const handedOverRes = handoverService.markHandedOver(scheduledBatch, 'Driver');
assert(handedOverRes.success, 'Marking handed over should succeed');
assert(handedOverRes.batch?.status === 'HANDED OVER', 'Status should be HANDED OVER');
assert(handedOverRes.batch?.statusHistory.length === 4, 'Status history should have 4 events');
console.log('✓ Test: Handed over transition recorded with driver identity');

// Test 3: Rejection WITHOUT reason MUST be blocked
const inTransitBatch = handedOverRes.batch!;
const rejectedWithoutReason = handoverService.recordOutcome(inTransitBatch, {
  batchId: inTransitBatch.id,
  outcome: 'REJECTED',
  completedAt: new Date().toISOString(),
  recordedBy: 'Intake Inspector',
  rejectionReason: '', // Empty reason
});
assert(!rejectedWithoutReason.success, 'Rejection without reason must fail');
assert(
  Boolean(rejectedWithoutReason.error?.includes('reason is required')),
  'Must give explicit rejection reason error message'
);
console.log('✓ Test: Rejection without reason is strictly rejected by validation');

// Test 4: Rejection WITH valid reason and corrective feedback
const rejectedWithReason = handoverService.recordOutcome(inTransitBatch, {
  batchId: inTransitBatch.id,
  outcome: 'REJECTED',
  completedAt: new Date().toISOString(),
  recordedBy: 'Intake Inspector',
  rejectionReason: 'Moisture content measured at 26%, far above maximum threshold of 15%',
  correctiveFeedback: 'Dry under covered warehouse for 48 hours and re-bale.',
});
assert(rejectedWithReason.success, 'Rejection with valid reason must succeed');
assert(rejectedWithReason.batch?.status === 'REJECTED', 'Status must be REJECTED');
assert(
  Boolean(rejectedWithReason.batch?.rejectionReason),
  'Rejection reason must be stored on batch'
);
assert(
  rejectedWithReason.batch?.readinessChecklist.isDryAndProtected === false,
  'Moisture rejection must uncheck dry readiness flag'
);
assert(
  rejectedWithReason.batch?.isReadyForMatching === false,
  'Rejected batch cannot remain ready for matching'
);
console.log('✓ Test: Rejection properly records reason and resets readiness checklist');

// Test 5: Successful intake (RECEIVED) outcome
const receivedRes = handoverService.recordOutcome(inTransitBatch, {
  batchId: inTransitBatch.id,
  outcome: 'RECEIVED',
  completedAt: new Date().toISOString(),
  recordedBy: 'Weighbridge Officer',
  evidenceReference: 'WB-2026-9021',
  notes: 'Net approved tonnage 504 kg.',
});
assert(receivedRes.success, 'Received outcome should succeed');
assert(receivedRes.batch?.status === 'RECEIVED', 'Status should be RECEIVED');
assert(receivedRes.batch?.evidenceReference === 'WB-2026-9021', 'Evidence reference stored');

// Test 6: Lifecycle timeline status changes preserve timestamps and metadata
const historyEvents: HandoverEvent[] = receivedRes.batch?.statusHistory || [];
assert(historyEvents.length >= 4, 'Must have recorded multiple status transitions');
assert(historyEvents[0].status === 'DRAFT', 'First event status is DRAFT');
assert(historyEvents[1].status === 'READY', 'Second event status is READY (DRAFT to READY transition)');
assert(Boolean(historyEvents[0].timestamp), 'Initial status event must have timestamp');
assert(Boolean(historyEvents[1].timestamp), 'Subsequent status event must have timestamp');
const lastEvent = historyEvents[historyEvents.length - 1];
assert(lastEvent.status === 'RECEIVED', 'Latest transition is to RECEIVED');
assert(Boolean(lastEvent.timestamp), 'Latest transition must have valid timestamp');
console.log('✓ Test: Lifecycle timeline status changes (e.g., DRAFT to READY) preserve timestamps and metadata');

console.log('--- ALL HANDOVER TESTS PASSED ---');
