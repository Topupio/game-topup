import test, { before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Order from '../models/order.model.js';
import '../models/user.model.js';
import { adminUpdateOrder } from '../controllers/order.controller.js';
import { prepareApproval, processClaimed } from '../services/gwUltimate.core.mjs';
import { prepareGwApproval, claimGwOrder, gwPersistence, tickGwFulfillment } from '../services/gwUltimate.service.js';

dotenv.config({ quiet: true });
const database = 'codex_gw_test_' + Date.now();
const config = { enabled: true, mapping: { '6a805f2fc511294462f5dd19': { pid: 'GWM5' } } };
const previous = { orderStatus: 'pending', paymentStatus: 'pending' };
before(async () => {
  if (!process.env.MONGO_URI) throw new Error('Database connection missing');
  await mongoose.connect(process.env.MONGO_URI, { dbName: database, autoIndex: false });
  assert.equal(mongoose.connection.name, database);
  process.env.GW_ULTIMATE_ENABLED = 'true';
  process.env.GW_ULTIMATE_API_KEY = 'test-no-network';
});
beforeEach(async () => {
  assert.equal(mongoose.connection.name, database);
  await Order.deleteMany({});
});
after(async () => {
  assert.ok(database.startsWith('codex_gw_test_'));
  assert.equal(mongoose.connection.name, database);
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});
function fixture(extra = {}) {
  return new Order({
    orderId: 'TEST-' + new mongoose.Types.ObjectId(), user: new mongoose.Types.ObjectId(),
    game: '69a8ff6060745e75610255c9', product: '6a805f2fc511294462f5dd19',
    amount: 1, unitPrice: 1, quantity: 1, paymentMethod: 'upi',
    paymentStatus: 'pending', orderStatus: 'pending', tracking: [],
    userInputs: [{ label: 'Player UID', fieldKey: 'player_uid', value: '12345678' }, { label: 'Zone ID', fieldKey: 'zone_server', value: '1234' }],
    ...extra,
  });
}
async function ready(extra = {}) {
  const order = fixture({ orderStatus: 'completed', paymentStatus: 'paid', ...extra });
  prepareApproval(order, previous, config);
  await order.save(); return order;
}
async function stored(id) { return Order.findById(id).select('+gwFulfillment').lean(); }
async function admin(id, body) {
  let code = 200, payload;
  const res = { status(value) { code = value; return this; }, json(value) { payload = value; return this; } };
  const req = { params: { id: String(id) }, body, user: { _id: new mongoose.Types.ObjectId(), role: 'admin', name: 'Integration test' }, headers: {}, ip: '127.0.0.1', method: 'PATCH', originalUrl: '/test', get: () => '' };
  await adminUpdateOrder(req, res);
  return { code, payload };
}

test('actual admin handler queues after Completed then Paid, without leaking job details', async () => {
  const o = await fixture().save();
  assert.equal((await admin(o._id, { orderStatus: 'completed' })).code, 200);
  assert.equal((await stored(o._id)).gwFulfillment, undefined);
  const result = await admin(o._id, { paymentStatus: 'paid' });
  assert.equal(result.code, 200);
  const saved = await stored(o._id);
  assert.equal(saved.orderStatus, 'processing'); assert.equal(saved.gwFulfillment.state, 'queued');
  assert.equal('gwFulfillment' in JSON.parse(JSON.stringify(result.payload.data)), false);
  assert.equal((await Order.findById(o._id).lean()).gwFulfillment, undefined);
});
test('actual admin handler queues after Paid then Completed', async () => {
  const o = await fixture().save();
  assert.equal((await admin(o._id, { paymentStatus: 'paid' })).code, 200);
  assert.equal((await admin(o._id, { orderStatus: 'completed' })).code, 200);
  assert.equal((await stored(o._id)).gwFulfillment.units.length, 1);
});
test('manual Bigo packs and historical completed orders are not queued', async () => {
  const o = await fixture({ game: '6996db57917a43ccd2d3deb9', product: '6a80bb59c511294462f6ab5f' }).save();
  assert.equal((await admin(o._id, { paymentStatus: 'paid', orderStatus: 'completed' })).code, 200);
  assert.equal((await stored(o._id)).gwFulfillment, undefined);
  const old = await fixture({ orderStatus: 'completed', paymentStatus: 'paid' }).save();
  assert.equal((await admin(old._id, { adminNote: 'Historical note only' })).code, 200);
  assert.equal((await stored(old._id)).gwFulfillment, undefined);
});
test('invalid player data returns 400 and does not persist a false completion', async () => {
  const o = await fixture({ userInputs: [] }).save();
  assert.equal((await admin(o._id, { orderStatus: 'completed', paymentStatus: 'paid' })).code, 400);
  const saved = await stored(o._id); assert.equal(saved.orderStatus, 'pending'); assert.equal(saved.paymentStatus, 'pending');
});
test('two simultaneous database claims produce exactly one owner', async () => {
  await ready();
  const claims = await Promise.all([claimGwOrder(), claimGwOrder()]);
  assert.equal(claims.filter(Boolean).length, 1);
});
test('stale administrator document cannot overwrite a worker advance', async () => {
  const o = await ready();
  const stale = await Order.findById(o._id).select('+gwFulfillment');
  stale.adminNote = 'stale'; prepareGwApproval(stale, { orderStatus: 'processing', paymentStatus: 'paid' });
  await claimGwOrder();
  await assert.rejects(stale.save(), error => ['VersionError', 'DocumentNotFoundError'].includes(error.name));
});
test('re-saving Completed on a queued order keeps its job and Processing state', async () => {
  const o = await ready();
  assert.equal((await admin(o._id, { orderStatus: 'completed' })).code, 200);
  const saved = await stored(o._id);
  assert.equal(saved.orderStatus, 'processing'); assert.equal(saved.gwFulfillment.units.length, 1);
});
test('worker completes one purchase once and repeated ticks do not resend', async () => {
  const o = await ready(); let calls = 0;
  const request = async method => { calls++; assert.equal(method, 'POST'); return { httpStatus: 200, body: { orderCreated: true, orderId: 'GW-TEST-1', status: 'completed' } }; };
  await tickGwFulfillment({ config, request }); await tickGwFulfillment({ config, request });
  assert.equal(calls, 1); const saved = await stored(o._id);
  assert.equal(saved.orderStatus, 'completed'); assert.equal(saved.gwFulfillment.state, 'completed');
  assert.equal(saved.externalOrder.provider, 'gw_ultimate');
});
test('supplier acceptance is followed by a GET status poll after restart', async () => {
  const o = await ready();
  await tickGwFulfillment({ config, request: async () => ({ httpStatus: 200, body: { orderCreated: true, orderId: 'GW-TEST-2', status: 'processing' } }) });
  await Order.updateOne({ _id: o._id }, { $set: { 'gwFulfillment.nextAttemptAt': new Date(0) } });
  let method;
  await tickGwFulfillment({ config, request: async m => { method = m; return { httpStatus: 200, body: { orderCreated: true, orderId: 'GW-TEST-2', status: 'completed' } }; } });
  assert.equal(method, 'GET'); assert.equal((await stored(o._id)).orderStatus, 'completed');
});
test('crashed submission enters review without a new POST', async () => {
  const o = await ready();
  await Order.updateOne({ _id: o._id }, { $set: { 'gwFulfillment.units.0.status': 'submitting', 'gwFulfillment.leaseUntil': new Date(0) } });
  let calls = 0; await tickGwFulfillment({ config, request: async () => { calls++; throw new Error('must not run'); } });
  assert.equal(calls, 0); assert.equal((await stored(o._id)).gwFulfillment.state, 'needs_review');
});
test('cancellation while supplier request is in flight is preserved', async () => {
  const o = await ready();
  await tickGwFulfillment({ config, request: async () => {
    await Order.updateOne({ _id: o._id }, { $set: { orderStatus: 'cancelled' } });
    return { httpStatus: 200, body: { orderCreated: true, orderId: 'GW-TEST-3', status: 'completed' } };
  } });
  const saved = await stored(o._id); assert.equal(saved.orderStatus, 'cancelled'); assert.equal(saved.gwFulfillment.state, 'completed');
});
test('refund before submission prevents purchase even after a worker claim', async () => {
  const o = await ready(); const claimed = await claimGwOrder();
  await Order.updateOne({ _id: o._id }, { $set: { 'refund.totalRefundedPaise': 10 } });
  let calls = 0;
  await processClaimed(claimed, { persist: gwPersistence(claimed), request: async () => { calls++; } });
  assert.equal(calls, 0);
});
test('partial quantity failure stops remaining units', async () => {
  const o = await ready({ quantity: 3 });
  await tickGwFulfillment({ config, request: async () => ({ httpStatus: 200, body: { orderCreated: true, orderId: 'GW-PART-1', status: 'completed' } }) });
  await Order.updateOne({ _id: o._id }, { $set: { 'gwFulfillment.nextAttemptAt': new Date(0) } });
  await tickGwFulfillment({ config, request: async () => ({ httpStatus: 400, body: { orderCreated: false, status: 'cancelled' } }) });
  const saved = await stored(o._id);
  assert.equal(saved.orderStatus, 'failed');
  assert.deepEqual(saved.gwFulfillment.units.map(u => u.status), ['completed', 'cancelled', 'queued']);
});
