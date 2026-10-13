import { matchingService, convertQuantityToKg } from '../src/services/matchingService';
import { WasteBatch } from '../src/types/batch';
import { Recipient } from '../src/types/recipient';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log('--- RUNNING DETERMINISTIC MATCHING TESTS ---');

const sampleRecipient: Recipient = {
  id: 'REC-TEST-001',
  name: 'Test Paper Mill',
  facilityType: 'Pulp Mill',
  contactPerson: 'Arun',
  phone: '9999999999',
  email: 'arun@papermill.demo',
  location: {
    address: 'Hadapsar MIDC',
    city: 'Pune',
    pincode: '411013',
    coordinates: { lat: 18.5028, lng: 73.9269 },
    maxServiceRadiusKm: 50,
  },
  acceptedMaterials: ['Cardboard', 'Paper'],
  minQuantityKg: 100,
  maxQuantityKg: 10000,
  requiredPackaging: ['Baled', 'Boxed'],
  acceptableContaminationLevels: ['None (Clean & Sorted)', 'Minor Dry Dust / Labels'],
  requiresDry: true,
  specialInstructions: 'Must be dry and baled.',
  isActive: true,
  isDemoData: true,
};

const baseBatch: WasteBatch = {
  id: 'BATCH-TEST-01',
  generatorName: 'Test Facility',
  pickupLocation: {
    address: 'Loni Kalbhor',
    city: 'Pune',
    pincode: '412201',
    coordinates: { lat: 18.4903, lng: 74.0252 },
  },
  materialCategory: 'Cardboard',
  isHumanConfirmed: true,
  quantity: 250,
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
  statusHistory: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Test 1: Perfect match
const matchPerfect = matchingService.evaluateMatch(baseBatch, sampleRecipient);
assert(matchPerfect.isEligible, 'Base batch should be 100% eligible');
assert(matchPerfect.score === 100, 'Score should be 100%');
console.log('✓ Test: Compatible batch is 100% eligible');

// Test 2: Material mismatch (e.g. Plastic sent to Paper Mill)
const plasticBatch: WasteBatch = {
  ...baseBatch,
  materialCategory: 'Plastic',
};
const matchPlastic = matchingService.evaluateMatch(plasticBatch, sampleRecipient);
assert(!matchPlastic.isEligible, 'Plastic must be rejected by paper mill');
const matEval = matchPlastic.evaluations.find((e) => e.id === 'material');
assert(matEval?.passed === false, 'Material evaluation should fail');
assert(
  matchPlastic.summaryExplanation.includes('Not eligible'),
  'Summary should clearly explain why not eligible'
);
console.log('✓ Test: Incompatible material category is excluded with clear explanation');

// Test 3: Quantity below minimum limit
const lowQtyBatch: WasteBatch = {
  ...baseBatch,
  quantity: 40, // 40 kg < 100 kg min
  unit: 'kg',
};
const matchLowQty = matchingService.evaluateMatch(lowQtyBatch, sampleRecipient);
assert(!matchLowQty.isEligible, 'Quantity below minimum should be rejected');
const qtyEval = matchLowQty.evaluations.find((e) => e.id === 'quantity');
assert(qtyEval?.passed === false, 'Quantity evaluation should fail');
assert(
  Boolean(qtyEval?.explanation.includes('below recipient')),
  'Explanation should state quantity is below minimum'
);
console.log('✓ Test: Batch below minimum intake quantity rejected');

// Test 4: Packaging format mismatch
const looseBatch: WasteBatch = {
  ...baseBatch,
  packagingType: 'Loose', // Recipient requires Baled or Boxed
};
const matchLoose = matchingService.evaluateMatch(looseBatch, sampleRecipient);
assert(!matchLoose.isEligible, 'Loose packaging should be rejected');
const packEval = matchLoose.evaluations.find((e) => e.id === 'packaging');
assert(packEval?.passed === false, 'Packaging evaluation should fail');
assert(
  Boolean(packEval?.explanation.includes('requires [Baled, Boxed]')),
  'Explanation must describe required vs actual packaging'
);
console.log('✓ Test: Incompatible packaging format rejected with clear explanation');

// Test 5: Inactive recipient
const inactiveRecipient: Recipient = {
  ...sampleRecipient,
  isActive: false,
};
const matchInactive = matchingService.evaluateMatch(baseBatch, inactiveRecipient);
assert(!matchInactive.isEligible, 'Inactive recipient cannot be matched');
console.log('✓ Test: Inactive recipient excluded from matching');

// Test 6: Unit conversion check (2 tonnes = 2000 kg, 5 bales = 1000 kg)
assert(convertQuantityToKg(2, 'tonnes') === 2000, '2 tonnes must equal 2000 kg');
assert(convertQuantityToKg(5, 'bales') === 1000, '5 bales must approximate 1000 kg');
console.log('✓ Test: Quantity unit conversions accurate');

console.log('--- ALL MATCHING TESTS PASSED ---');
