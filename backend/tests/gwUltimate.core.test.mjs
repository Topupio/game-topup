import test from 'node:test';
import assert from 'node:assert/strict';
import { PACKS, eligiblePack, prepareApproval, processClaimed, requestApi } from '../services/gwUltimate.core.mjs';

const config = { enabled: true, mapping: Object.fromEntries(PACKS.map(p => [p.product, { pid: `GWTEST${p.kind}` }])) };
const order = (pack = PACKS[0]) => ({
  _id: 'abcdefabcdefabcdefabcdef', game: pack.game, product: pack.product, quantity: 1,
  paymentMethod: 'upi', paymentStatus: 'paid', orderStatus: 'completed', tracking: [],
  userInputs: [{ fieldKey: 'player_uid', label: 'Player UID', value: '00123456' }, { fieldKey: 'zone_server', label: 'Zone ID', value: '1234' }],
});
const previous = { orderStatus: 'pending', paymentStatus: 'pending' };
const queued = () => { const o = order(); prepareApproval(o, previous, config); return o; };

test('only the ten verified website packs and UPI are eligible', () => {
  for (const p of PACKS) assert.ok(eligiblePack(order(p)));
  assert.equal(eligiblePack({ ...order(), product: 'some-other-product' }), null);
  assert.equal(eligiblePack({ ...order(), game: 'philippines' }), null);
  assert.equal(eligiblePack({ ...order(), paymentMethod: 'wallet' }), null);
});
test('requires both flags and supports either approval order', () => {
  assert.equal(prepareApproval({ ...order(), paymentStatus: 'pending' }, previous, config), false);
  assert.equal(prepareApproval({ ...order(), orderStatus: 'pending' }, previous, config), false);
  for (const p of [{ orderStatus: 'completed', paymentStatus: 'pending' }, { orderStatus: 'pending', paymentStatus: 'paid' }]) {
    const o = order(); assert.equal(prepareApproval(o, p, config), true); assert.equal(o.orderStatus, 'processing');
  }
});
test('does not replay old approvals, existing jobs or disabled integration', () => {
  assert.equal(prepareApproval(order(), { orderStatus: 'completed', paymentStatus: 'paid' }, config), false);
  assert.equal(prepareApproval(order(), previous, { ...config, enabled: false }), false);
  assert.equal(prepareApproval(queued(), previous, config), false);
});
test('missing mapping, refund and existing provider fail before queueing', () => {
  assert.throws(() => prepareApproval(order(), previous, { ...config, mapping: {} }), /mapping/);
  assert.throws(() => prepareApproval({ ...order(), refund: { totalRefundedPaise: 1 } }, previous, config), /Refunded/);
  assert.throws(() => prepareApproval({ ...order(), externalOrder: { externalOrderId: 'existing' } }, previous, config), /provider/);
});
test('unavailable packs explicitly left manual are skipped', () => {
  const o = order(PACKS[2]);
  assert.equal(prepareApproval(o, previous, { enabled: true, mapping: { [o.product]: { manual: true } } }), false);
  assert.equal(o.orderStatus, 'completed'); assert.equal(o.gwFulfillment, undefined);
});
test('ML IDs preserved, zone required, Bigo needs no zone', () => {
  const o = queued(); assert.equal(o.gwFulfillment.units[0].request.userId, '00123456');
  assert.equal(o.gwFulfillment.units[0].request.zoneId, '1234');
  const ml = order(); ml.userInputs.pop(); assert.throws(() => prepareApproval(ml, previous, config), /details/);
  const bigo = order(PACKS[2]); bigo.userInputs.pop(); prepareApproval(bigo, previous, config);
  assert.equal('zoneId' in bigo.gwFulfillment.units[0].request, false);
});
test('each quantity unit has a stable unique transaction, without quantity in body', () => {
  const a = { ...order(), quantity: 3 }, b = { ...order(), quantity: 3 };
  prepareApproval(a, previous, config); prepareApproval(b, previous, config);
  const ids = a.gwFulfillment.units.map(u => u.request.trxid);
  assert.equal(new Set(ids).size, 3);
  assert.deepEqual(ids, b.gwFulfillment.units.map(u => u.request.trxid));
  assert.equal('quantity' in a.gwFulfillment.units[0].request, false);
});

function harness(o, response) {
  const calls = [], writes = [];
  return { calls, writes, options: {
    request: async (...args) => { calls.push(args); if (response instanceof Error) throw response; return response; },
    persist: async (f, status, message, release) => { writes.push(structuredClone({ f, status, message, release })); return true; },
  } };
}
test('persists submitting state before POST and finishes only on supplier confirmation', async () => {
  const o = queued(), h = harness(o, { httpStatus: 200, body: { orderCreated: true, orderId: 'GW-1', status: 'completed' } });
  await processClaimed(o, h.options);
  assert.equal(h.writes[0].f.units[0].status, 'submitting');
  assert.equal(h.calls[0][0], 'POST');
  assert.equal(h.writes.at(-1).status, 'completed');
});
test('lost database claim sends no purchase request', async () => {
  const h = harness(queued(), {}); h.options.persist = async () => false;
  await processClaimed(queued(), h.options); assert.equal(h.calls.length, 0);
});
test('timeout and crash recovery stop without repeat purchase', async () => {
  const o = queued(), h = harness(o, new Error('timeout'));
  await processClaimed(o, h.options);
  assert.equal(h.writes.at(-1).f.state, 'needs_review');
  const recovered = queued(); recovered.gwFulfillment.units[0].status = 'submitting';
  const recovery = harness(recovered, {}); await processClaimed(recovered, recovery.options);
  assert.equal(recovery.calls.length, 0); assert.equal(recovery.writes.at(-1).f.state, 'needs_review');
});
test('processing orders are polled with GET, not purchased again', async () => {
  const o = queued(); o.gwFulfillment.units[0].status = 'processing'; o.gwFulfillment.units[0].externalId = 'GW-1';
  const h = harness(o, { httpStatus: 200, body: { orderCreated: true, orderId: 'GW-1', status: 'completed' } });
  await processClaimed(o, h.options); assert.equal(h.calls[0][0], 'GET'); assert.equal(h.writes.at(-1).status, 'completed');
});
test('supplier cancellation fails, poll outage retains processing, ambiguous HTTP 200 needs review', async () => {
  const a = queued(), ah = harness(a, { httpStatus: 400, body: { orderCreated: false, status: 'cancelled' } });
  await processClaimed(a, ah.options); assert.equal(ah.writes.at(-1).status, 'failed');
  const b = queued(); Object.assign(b.gwFulfillment.units[0], { status: 'processing', externalId: 'GW-1' });
  const bh = harness(b, new Error('offline')); await processClaimed(b, bh.options);
  assert.equal(bh.writes.at(-1).f.state, 'processing'); assert.equal(bh.writes.at(-1).status, 'processing');
  const ch = harness(queued(), { httpStatus: 200, body: { success: false } });
  await processClaimed(queued(), ch.options); assert.equal(ch.writes.at(-1).f.state, 'needs_review');
});
test('partial quantity delivery never marks entire order completed', async () => {
  const o = { ...order(), quantity: 2 }; prepareApproval(o, previous, config);
  const h = harness(o, { httpStatus: 200, body: { orderCreated: true, orderId: 'GW-1', status: 'completed' } });
  await processClaimed(o, h.options); assert.equal(h.writes.at(-1).status, 'processing');
  assert.equal(h.writes.at(-1).f.units[1].status, 'queued');
});
test('request uses fixed HTTPS destination, header authentication and blocks redirects', async () => {
  let captured;
  await requestApi('GET', '/products', null, { apiKey: 'test-only', fetchImpl: async (...args) => { captured = args; return { status: 200, json: async () => ({ products: [] }) }; } });
  assert.equal(captured[0], 'https://api.sonofutred.com/products');
  assert.equal(captured[1].headers['X-API-Key'], 'test-only'); assert.equal(captured[1].redirect, 'error');
});
