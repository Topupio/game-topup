import { request as httpsRequest } from 'node:https';
// Credentials are supplied only by the server.
export const PACKS = Object.freeze([
  { game: '69a8ff6060745e75610255c9', product: '6a805f2fc511294462f5dd19', name: '5 Diamonds', kind: 'ml' },
  { game: '69a8ff6060745e75610255c9', product: '6a805f2fc511294462f5dd1a', name: '11 Diamonds', kind: 'ml' },
  ...[
    ['6a80bb59c511294462f6ab5f', '10 Diamonds'],
    ['6a80bb59c511294462f6ab60', '100 Diamonds'],
    ['6a80bb59c511294462f6ab61', '160 Diamonds'],
    ['6a80bb59c511294462f6ab62', '300 Diamonds'],
    ['6a80bb59c511294462f6ab63', '400 Diamonds'],
    ['6a80bb59c511294462f6ab64', '1000 Diamonds'],
    ['6a80bc3bc511294462f6afee', '2000 Diamonds'],
    ['6a80bc3bc511294462f6afef', '5000 Diamonds'],
  ].map(([product, name]) => ({ game: '6996db57917a43ccd2d3deb9', product, name, kind: 'bigo' })),
]);

const id = value => String(value?._id ?? value ?? '');
export function eligiblePack(order) {
  if (order.paymentMethod !== 'upi') return null;
  return PACKS.find(p => p.game === id(order.game) && p.product === id(order.product)) ?? null;
}

function inputValue(order, keys, labels) {
  const inputs = order.userInputs ?? [];
  const keyed = inputs.filter(v => keys.includes(v.fieldKey));
  const matches = keyed.length ? keyed : inputs.filter(v => labels.includes(v.label));
  const values = [...new Set(matches.map(v => String(v.value ?? '').trim()))];
  if (values.length !== 1 || !values[0]) throw new Error('Missing or conflicting player details');
  return values[0];
}

// Call before the administrator's order.save(), so approval and the durable
// queue are one document write. Only a NEW transition to both flags can enqueue.
export function prepareApproval(order, previous, { enabled, mapping }, now = new Date()) {
  if (!enabled || order.gwFulfillment || !eligiblePack(order)) return false;
  if (order.orderStatus !== 'completed' || order.paymentStatus !== 'paid') return false;
  if (previous.orderStatus === 'completed' && previous.paymentStatus === 'paid') return false;
  if (order.externalOrder?.externalOrderId || order.externalOrder?.provider) {
    throw new Error('This order already has a fulfillment provider; review it manually');
  }
  if (order.refund?.totalRefundedPaise > 0 || order.refund?.isFullyRefunded) {
    throw new Error('Refunded orders cannot be automatically fulfilled');
  }
  const pack = eligiblePack(order);
  if (mapping?.[pack.product]?.manual === true) return false;
  const pid = mapping?.[pack.product]?.pid;
  if (typeof pid !== 'string' || !/^GW[A-Z0-9_-]+$/i.test(pid)) {
    throw new Error(`Supplier mapping is not configured for ${pack.name}`);
  }
  const quantity = Number(order.quantity);
  if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 500) {
    throw new Error('Automatic delivery requires a whole quantity between 1 and 500');
  }
  const userId = inputValue(order, ['player_uid', 'userId', 'player_id'], ['Player UID', 'User ID', 'Player ID', 'Bigo ID']);
  if (userId.length > 100 || /[\x00-\x1f\x7f]/.test(userId)) throw new Error('Invalid player ID');
  const body = { pid, userId };
  if (pack.kind === 'ml') {
    body.zoneId = inputValue(order, ['zone_server', 'zoneId', 'zone_id'], ['Zone ID', 'Zone/Server', 'Server']);
    if (!/^\d{1,30}$/.test(userId) || !/^\d{1,10}$/.test(body.zoneId)) throw new Error('ML player ID and zone must contain digits only');
  }
  const orderId = id(order._id);
  if (!/^[a-f0-9]{24}$/i.test(orderId)) throw new Error('Invalid internal order ID');
  order.gwFulfillment = {
    version: 1, approvedAt: now, state: 'queued', nextAttemptAt: now,
    // Top-up requests do not accept quantity. Each unit has its own fixed ID.
    units: Array.from({ length: quantity }, (_, index) => ({
      status: 'queued', request: { ...body, trxid: `topupio-gw-${orderId}-${index + 1}` },
    })),
  };
  order.orderStatus = 'processing';
  order.tracking.push({ status: 'processing', message: 'Payment approved; automatic diamond delivery queued', at: now });
  return true;
}

export function classifyResponse(httpStatus, body, knownOrderId) {
  const accepted = body?.orderCreated === true;
  const externalId = typeof body?.orderId === 'string' ? body.orderId : knownOrderId;
  if (accepted && externalId && httpStatus >= 200 && httpStatus < 300) {
    const status = body.status === 'pending' ? 'processing' : body.status;
    if (['processing', 'completed', 'cancelled'].includes(status)) {
      return { status, externalId, refunded: body.refunded === true };
    }
  }
  // A definitive rejected POST is safe to report as failed, but never retry it
  // automatically or create another transaction ID.
  if (!knownOrderId && body?.orderCreated === false && body.status === 'cancelled') {
    return { status: 'cancelled', refunded: body.refunded === true };
  }
  if (knownOrderId) return { status: 'poll_retry' };
  return { status: 'needs_review' };
}

export function ipv4JsonFetch(url, options) {
  return new Promise((resolve, reject) => {
    const req = httpsRequest(url, { method: options.method, headers: options.headers, family: 4, signal: options.signal }, res => {
      const chunks = []; let size = 0;
      res.on('data', chunk => {
        size += chunk.length;
        if (size > 2097152) { req.destroy(new Error('Supplier response too large')); return; }
        chunks.push(chunk);
      });
      res.on('error', reject);
      res.on('end', () => resolve({ status: res.statusCode, json: async () => JSON.parse(Buffer.concat(chunks).toString('utf8')) }));
    });
    req.on('error', reject);
    req.end(options.body);
  });
}

export async function requestApi(method, path, body, { apiKey, fetchImpl = ipv4JsonFetch }) {
  if (!apiKey) throw new Error('Supplier key is not configured');
  if (!/^\/(orders(?:\/[^/?#]+)?|products|services|balance|my-ip)$/.test(path)) throw new Error('Unsupported supplier path');
  const response = await fetchImpl(`https://api.sonofutred.com${path}`, {
    method, redirect: 'error', signal: AbortSignal.timeout(20000),
    headers: { 'X-API-Key': apiKey, 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { httpStatus: response.status, body: await response.json() };
}

// One claimed job step; persist must atomically match the worker's lock token.
// A submitting unit left by a crash is never blindly purchased again.
export async function processClaimed(order, { request, persist, now = () => new Date() }) {
  const f = structuredClone(order.gwFulfillment);
  const index = f.units.findIndex(unit => unit.status !== 'completed');
  if (index < 0) {
    f.state = 'completed';
    return persist(f, 'completed', 'Diamonds delivered successfully', true);
  }
  const unit = f.units[index];
  const review = async message => {
    unit.status = 'needs_review'; f.state = 'needs_review';
    return persist(f, 'processing', message, true);
  };
  if (unit.status === 'submitting' || unit.status === 'needs_review') {
    return review('Delivery needs review: supplier submission outcome is uncertain. Do not top up again until checked.');
  }
  if (unit.status === 'cancelled') {
    f.state = 'failed';
    return persist(f, 'failed', 'Supplier could not deliver this order; review any partially delivered quantity', true);
  }
  const polling = unit.status === 'processing' && Boolean(unit.externalId);
  if (polling) f.state = 'processing';
  if (polling && now().getTime() - new Date(f.approvedAt).getTime() > 86400000) {
    return review('Delivery still pending after 24 hours; check the supplier order before taking further action');
  }
  if (!polling) {
    if (unit.status !== 'queued') return review('Unexpected delivery state; manual review required');
    unit.status = 'submitting'; f.state = 'processing';
    // This write must succeed before a paid request is sent.
    if (!await persist(f, 'processing', null, false, true)) return false;
  }
  let result;
  try {
    result = polling
      ? await request('GET', `/orders/${encodeURIComponent(unit.externalId)}`)
      : await request('POST', '/orders', unit.request);
  } catch {
    if (!polling) return review('Delivery needs review: supplier response was not received. Check the transaction before retrying.');
    result = { httpStatus: 0, body: null };
  }
  const classified = classifyResponse(result.httpStatus, result.body, polling ? unit.externalId : undefined);
  if (classified.status === 'needs_review') return review('Supplier did not confirm delivery; check API access, balance and transaction status');
  if (classified.status === 'poll_retry') {
    unit.pollFailures = (unit.pollFailures ?? 0) + 1;
    if (unit.pollFailures >= 20) return review('Supplier status checks are unavailable; manual review required');
    f.nextAttemptAt = new Date(now().getTime() + Math.min(300000, 10000 * 2 ** Math.min(unit.pollFailures, 5)));
    return persist(f, 'processing', null, true);
  }
  unit.status = classified.status;
  if (classified.externalId) unit.externalId = classified.externalId;
  unit.refundedBySupplier = classified.refunded;
  unit.pollFailures = 0;
  unit.checkedAt = now();
  if (unit.status === 'cancelled') {
    f.state = 'failed';
    return persist(f, 'failed', `Supplier rejected delivery (${index} of ${f.units.length} units delivered). Review before any refund or retry.`, true);
  }
  const completed = f.units.every(item => item.status === 'completed');
  f.state = completed ? 'completed' : 'processing';
  f.nextAttemptAt = new Date(now().getTime() + 10000);
  return persist(f, completed ? 'completed' : 'processing',
    completed ? 'Diamonds delivered successfully' : unit.status === 'completed' ? `Delivered ${index + 1} of ${f.units.length} units` : null, true);
}
