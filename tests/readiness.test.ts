import { readinessService } from '../src/services/readinessService';
import { validateBatchForm } from '../src/utils/validation';
import { ReadinessChecklist } from '../src/types/batch';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log('--- RUNNING READINESS & VALIDATION TESTS ---');

// Test 1: Empty or incomplete checklist should report not ready
const emptyChecklist: ReadinessChecklist = {
  isSortedSeparately: false,
  noOrganicContamination: false,
  isDryAndProtected: false,
  packagingMatchesRequirement: false,
  quantityVerified: false,
  specialPreparationDone: false,
};
const evalEmpty = readinessService.evaluate(emptyChecklist);
assert(!evalEmpty.isFullyReady, 'Empty checklist must not be ready');
assert(evalEmpty.completedItemsCount === 0, 'Completed count should be 0');
assert(evalEmpty.percentage === 0, 'Percentage should be 0');
assert(evalEmpty.incompleteItems.length === 6, 'Should list 6 incomplete items');
console.log('✓ Test: Empty checklist evaluated as unready (0%)');

// Test 2: Partial checklist (3 of 6)
const partialChecklist: ReadinessChecklist = {
  isSortedSeparately: true,
  noOrganicContamination: true,
  isDryAndProtected: true,
  packagingMatchesRequirement: false,
  quantityVerified: false,
  specialPreparationDone: false,
};
const evalPartial = readinessService.evaluate(partialChecklist);
assert(!evalPartial.isFullyReady, 'Partial checklist must not be ready');
assert(evalPartial.completedItemsCount === 3, 'Completed count should be 3');
assert(evalPartial.percentage === 50, 'Percentage should be 50%');
console.log('✓ Test: Partial checklist evaluated as unready (50%)');

// Test 3: Fully completed checklist
const completeChecklist: ReadinessChecklist = {
  isSortedSeparately: true,
  noOrganicContamination: true,
  isDryAndProtected: true,
  packagingMatchesRequirement: true,
  quantityVerified: true,
  specialPreparationDone: true,
};
const evalComplete = readinessService.evaluate(completeChecklist);
assert(evalComplete.isFullyReady, 'Full checklist must be marked as ready');
assert(evalComplete.completedItemsCount === 6, 'Completed count should be 6');
assert(evalComplete.percentage === 100, 'Percentage should be 100%');
assert(evalComplete.incompleteItems.length === 0, 'No incomplete items should remain');
console.log('✓ Test: Complete checklist evaluated as 100% ready');

// Test 4: Validation test for batch form input
const invalidForm = validateBatchForm({
  generatorName: '', // Missing
  address: 'No', // Too short
  city: '',
  pincode: '123', // Invalid PIN
  materialCategory: 'Cardboard',
  quantity: -10, // Negative quantity
  unit: 'kg',
  packagingType: 'Baled',
  contaminationLevel: 'None (Clean & Sorted)',
});
assert(!invalidForm.isValid, 'Invalid form must be rejected');
assert(Boolean(invalidForm.errors.generatorName), 'Must flag missing generator name');
assert(Boolean(invalidForm.errors.quantity), 'Must flag negative quantity');
assert(Boolean(invalidForm.errors.pincode), 'Must flag invalid 6-digit pincode');
console.log('✓ Test: Missing and negative input fields rejected with clear messages');

// Test 5: Validation test for valid batch form
const validForm = validateBatchForm({
  generatorName: 'MIT-ADT Campus Dining',
  address: 'Gate 3 Vishwarajbaug',
  city: 'Pune',
  pincode: '412201',
  materialCategory: 'Cardboard',
  quantity: 250,
  unit: 'kg',
  packagingType: 'Baled',
  contaminationLevel: 'None (Clean & Sorted)',
});
assert(validForm.isValid, 'Valid form must pass validation');
assert(Object.keys(validForm.errors).length === 0, 'No errors should exist for valid input');
console.log('✓ Test: Valid batch form input accepted without errors');

console.log('--- ALL READINESS TESTS PASSED ---');
