/**
 * Payment-related limits shared across checkout flows.
 *
 * NOTE: MIN_CRYPTO_AMOUNT_USD is mirrored on the backend in
 * backend/constants/payments.js — keep both values in sync. The backend
 * check is authoritative; this one only gates the UI.
 */

/** Minimum order total (in USD) accepted by the NOWPayments crypto flow. */
export const MIN_CRYPTO_AMOUNT_USD = 3.5;
