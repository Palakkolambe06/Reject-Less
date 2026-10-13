export type AppRoute =
  | { type: 'home' }
  | { type: 'dashboard' }
  | { type: 'batches' }
  | { type: 'create_batch' }
  | { type: 'batch_details'; batchId: string }
  | { type: 'ai_triage' }
  | { type: 'map' }
  | { type: 'assistant' }
  | { type: 'readiness'; batchId?: string }
  | { type: 'recipients'; batchId?: string }
  | { type: 'handovers'; batchId?: string }
  | { type: 'history' }
  | { type: 'notifications' }
  | { type: 'settings' }
  // Recipient specific routes
  | { type: 'recipient_offers' }
  | { type: 'recipient_accepted' }
  | { type: 'recipient_schedule' }
  | { type: 'recipient_requirements' }
  | { type: 'recipient_receipt_confirmation' }
  | { type: 'recipient_rejected' }
  // Operator specific routes
  | { type: 'operator_pickup_queue' }
  | { type: 'operator_schedule' }
  | { type: 'operator_active' }
  | { type: 'operator_evidence' }
  | { type: 'operator_exceptions' }
  | { type: 'operator_completed' };

export function parseRoute(pathString: string): AppRoute {
  const clean = pathString.startsWith('#') ? pathString.substring(1) : pathString;
  const [pathname, search] = clean.split('?');
  const params = new URLSearchParams(search || '');
  const batchIdParam = params.get('batchId') || undefined;

  if (pathname === '/home') {
    return { type: 'home' };
  }
  if (pathname === '/' || pathname === '') {
    return { type: 'dashboard' };
  }
  if (pathname === '/batches') {
    return { type: 'batches' };
  }
  if (pathname === '/create-batch') {
    return { type: 'create_batch' };
  }
  if (pathname.startsWith('/batches/')) {
    const id = pathname.replace('/batches/', '');
    return { type: 'batch_details', batchId: id };
  }
  if (pathname === '/ai-triage') {
    return { type: 'ai_triage' };
  }
  if (pathname === '/map') {
    return { type: 'map' };
  }
  if (pathname === '/assistant') {
    return { type: 'assistant' };
  }
  if (pathname === '/readiness') {
    return { type: 'readiness', batchId: batchIdParam };
  }
  if (pathname === '/recipients') {
    return { type: 'recipients', batchId: batchIdParam };
  }
  if (pathname === '/handovers') {
    return { type: 'handovers', batchId: batchIdParam };
  }
  if (pathname === '/history') {
    return { type: 'history' };
  }
  if (pathname === '/notifications') {
    return { type: 'notifications' };
  }
  if (pathname === '/settings') {
    return { type: 'settings' };
  }

  // Recipient routes
  if (pathname === '/recipient/offers') {
    return { type: 'recipient_offers' };
  }
  if (pathname === '/recipient/accepted') {
    return { type: 'recipient_accepted' };
  }
  if (pathname === '/recipient/schedule') {
    return { type: 'recipient_schedule' };
  }
  if (pathname === '/recipient/requirements') {
    return { type: 'recipient_requirements' };
  }
  if (pathname === '/recipient/receipt-confirmation') {
    return { type: 'recipient_receipt_confirmation' };
  }
  if (pathname === '/recipient/rejected') {
    return { type: 'recipient_rejected' };
  }

  // Operator routes
  if (pathname === '/operator/pickup-queue') {
    return { type: 'operator_pickup_queue' };
  }
  if (pathname === '/operator/schedule') {
    return { type: 'operator_schedule' };
  }
  if (pathname === '/operator/active') {
    return { type: 'operator_active' };
  }
  if (pathname === '/operator/evidence') {
    return { type: 'operator_evidence' };
  }
  if (pathname === '/operator/exceptions') {
    return { type: 'operator_exceptions' };
  }
  if (pathname === '/operator/completed') {
    return { type: 'operator_completed' };
  }

  return { type: 'dashboard' };
}
