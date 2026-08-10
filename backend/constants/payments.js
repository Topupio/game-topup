/**
 * Payment-related limits shared across payment flows.
 *
 * NOTE: MIN_CRYPTO_AMOUNT_USD is mirrored on the frontend in
 * frontend/src/lib/constants/payments.ts — keep both values in sync.
 */

/** Minimum order total (in USD) accepted by the NOWPayments crypto flow. */
export const MIN_CRYPTO_AMOUNT_USD = 3.5;
