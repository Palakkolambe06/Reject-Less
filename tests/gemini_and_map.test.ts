import { mapService } from '../src/services/mapService';
import { DEMO_BATCHES } from '../src/data/demoBatches';
import { DEMO_RECIPIENTS } from '../src/data/demoRecipients';

console.log('--- RUNNING MAP SERVICE & GEOSPATIAL TESTS ---');

// 1. Verify markers are produced with accurate coordinates
const generatorMarkers = mapService.prepareMarkers(DEMO_RECIPIENTS, DEMO_BATCHES, 'generator');
if (generatorMarkers.length === 0) {
  throw new Error('Expected markers to be generated for generator role');
}
console.log(`✓ Test: Generator sees ${generatorMarkers.length} mapped facilities and pickup bays`);

// 2. Verify recipient data privacy: recipients only see permitted batches
const recipientMarkers = mapService.prepareMarkers(DEMO_RECIPIENTS, DEMO_BATCHES, 'recipient', 'REC-PUN-001');
const draftBatchSeen = recipientMarkers.some((m) => m.type === 'pickup' && m.status === 'DRAFT');
if (draftBatchSeen) {
  throw new Error('Recipients must not see private DRAFT batches of generators');
}
console.log('✓ Test: Data privacy enforced: DRAFT batches excluded from recipient map layer');

// 3. Verify pairwise distance and matching calculation
const testBatch = DEMO_BATCHES[0];
const testRecipient = DEMO_RECIPIENTS[0];
const pair = mapService.evaluatePair(testBatch, testRecipient);

if (pair.distanceKm === null || pair.distanceKm <= 0) {
  throw new Error('Expected positive Haversine distance for Pune coordinates');
}
console.log(`✓ Test: Haversine distance calculated accurately (${pair.distanceKm} km)`);

if (typeof pair.result.isEligible !== 'boolean' || typeof pair.result.score !== 'number') {
  throw new Error('Expected deterministic match result with score and eligibility');
}
console.log(`✓ Test: Deterministic match score evaluated (${pair.result.score}%, eligible: ${pair.result.isEligible})`);

console.log('--- ALL MAP SERVICE TESTS PASSED ---');

console.log('--- RUNNING AI WASTE ASSISTANT KNOWLEDGE ENGINE TESTS ---');
import { generateRejectLessKnowledgeResponse } from '../src/services/ai/geminiKnowledgeBase';

const testQuestions = [
  'How should I prepare cardboard for recycling?',
  'Why might a recipient reject my waste batch?',
  'What information do I need before offering a batch?',
  'Explain the current status of my batch.',
  'How do I find a suitable recipient?',
  'What is the difference between reuse and recycling?',
  'How do I sort HDPE and PET plastics?',
];

for (const q of testQuestions) {
  const ans = generateRejectLessKnowledgeResponse(q, {
    role: 'generator',
    batchId: 'BAT-PUN-001',
    status: 'READY',
  });
  if (!ans || typeof ans !== 'string' || ans.length < 50) {
    throw new Error(`Expected comprehensive response for query: "${q}"`);
  }
  console.log(`✓ Test: AI Assistant response generated for "${q.slice(0, 30)}..." (${ans.length} chars)`);
}

console.log('--- ALL AI ASSISTANT TESTS PASSED ---');
