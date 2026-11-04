import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import Order from '../models/order.model.js';
import { prepareApproval, processClaimed, requestApi } from './gwUltimate.core.mjs';

function configuration() {
  if (process.env.GW_ULTIMATE_ENABLED !== 'true') return { enabled: false };
  const mapping = JSON.parse(readFileSync(new URL('../config/gwUltimate.mapping.json', import.meta.url), 'utf8'));
  if (!process.env.GW_ULTIMATE_API_KEY) throw new Error('GW Ultimate key is missing');
  return { enabled: true, mapping, apiKey: process.env.GW_ULTIMATE_API_KEY };
}

export function prepareGwApproval(order, previous) {
  // Re-saving Completed must not stop an active worker or resend a purchase.
  if (order.gwFulfillment && order.orderStatus === 'completed') {
    const state = order.gwFulfillment.state;
    if (state !== 'completed') order.orderStatus = state === 'failed' ? 'failed' : 'processing';
  }
  const queued = prepareApproval(order, previous, configuration());
  if (queued || order.gwFulfillment) {
    order.$where = { __v: order.__v };
    order.increment();
  }
  return queued;
}

export async function claimGwOrder(Model = Order, now = new Date()) {
  return Model.findOneAndUpdate({
    paymentMethod: 'upi', paymentStatus: 'paid', orderStatus: 'processing',
    'refund.totalRefundedPaise': { $not: { $gt: 0 } },
    'refund.isFullyRefunded': { $ne: true },
    'gwFulfillment.state': { $in: ['queued', 'processing'] },
    'gwFulfillment.nextAttemptAt': { $lte: now },
    $or: [{ 'gwFulfillment.leaseUntil': { $exists: false } }, { 'gwFulfillment.leaseUntil': { $lte: now } }],
  }, {
    $set: { 'gwFulfillment.token': randomUUID(), 'gwFulfillment.leaseUntil': new Date(now.getTime() + 120000) },
    $inc: { __v: 1 },
  }, { new: true, sort: { 'gwFulfillment.nextAttemptAt': 1 } }).select('+gwFulfillment').lean();
}

export function gwPersistence(order, Model = Order) {
  const token = order.gwFulfillment.token;
  return async (fulfillment, status, message, release, beforePurchase = false) => {
    const value = structuredClone(fulfillment);
    value.token = token;
    value.leaseUntil = release ? new Date(0) : new Date(Date.now() + 120000);
    const filter = { _id: order._id, 'gwFulfillment.token': token };
    if (beforePurchase) Object.assign(filter, {
      paymentStatus: 'paid', orderStatus: 'processing',
      'refund.totalRefundedPaise': { $not: { $gt: 0 } }, 'refund.isFullyRefunded': { $ne: true },
    });
    // Record the outcome without undoing a concurrent cancellation/refund.
    const set = {
      gwFulfillment: { $literal: value },
      __v: { $add: [{ $ifNull: ['$__v', 0] }, 1] },
      orderStatus: { $cond: [
        { $and: [
          { $eq: ['$paymentStatus', 'paid'] },
          { $in: ['$orderStatus', ['processing', 'completed']] },
          { $ne: ['$refund.isFullyRefunded', true] },
          { $lte: [{ $ifNull: ['$refund.totalRefundedPaise', 0] }, 0] },
        ] }, status, '$orderStatus',
      ] },
    };
    const externalId = value.units.findLast(unit => unit.externalId)?.externalId;
    if (externalId) set.externalOrder = { $literal: {
      provider: 'gw_ultimate', externalOrderId: externalId, externalStatus: value.state,
      placedAt: new Date(value.approvedAt), lastCheckedAt: new Date(),
    } };
    if (message) set.tracking = { $concatArrays: [
      { $ifNull: ['$tracking', []] }, { $literal: [{ status, message, at: new Date() }] },
    ] };
    const result = await Model.updateOne(filter, [{ $set: set }]);
    return result.matchedCount === 1;
  };
}

let running = false;
let interval;
export async function tickGwFulfillment({ Model = Order, config, request } = {}) {
  if (running) return;
  running = true;
  try {
    config ??= configuration();
    if (!config.enabled) return;
    for (let count = 0; count < 10; count++) {
      const order = await claimGwOrder(Model);
      if (!order) break;
      await processClaimed(order, {
        request: request ?? ((method, path, body) => requestApi(method, path, body, config)),
        persist: gwPersistence(order, Model),
      });
    }
  } catch {
    console.error('[GW Ultimate] Delivery worker needs attention; check configuration and saved job state');
  } finally { running = false; }
}

export function startGwFulfillment() {
  if (interval) return;
  interval = setInterval(() => { void tickGwFulfillment(); }, 10000);
  interval.unref();
  void tickGwFulfillment();
}
