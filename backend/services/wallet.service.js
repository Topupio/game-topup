import mongoose from "mongoose";
import Wallet from "../models/wallet.model.js";
import WalletTransaction, {
    TXN_TYPES,
    isCreditType,
} from "../models/walletTransaction.model.js";

/**
 * Wallet balance changes. Every credit and debit in the application goes through
 * applyTransaction() — there is deliberately no second path.
 *
 * Two separate problems are being solved here, by two different mechanisms:
 *
 *   Concurrency is handled by the conditional update. The "do they have enough?"
 *   check lives inside the query filter, so MongoDB evaluates it and the decrement
 *   together under a lock on the wallet document. Two simultaneous debits cannot
 *   both pass. Checking first and writing after would leave a gap where both
 *   requests read the same balance and both proceed.
 *
 *   Partial failure is handled by the transaction. The balance update and the ledger
 *   row are two writes; without a transaction a crash between them leaves money moved
 *   with no record of why, which the audit can detect but nobody can reconstruct.
 */

export class WalletError extends Error {
    constructor(code, message, status = 400) {
        super(message);
        this.name = "WalletError";
        this.code = code;
        this.status = status;
    }
}

/**
 * Fetch a user's wallet, creating it on first use.
 *
 * Called before opening a transaction, never inside one: creating a collection
 * implicitly during a transaction is an edge case worth avoiding entirely.
 */
export async function getOrCreateWallet(userId, session = null) {
    const query = Wallet.findOneAndUpdate(
        { user: userId },
        { $setOnInsert: { user: userId, balancePaise: 0, currency: "INR", txnSeq: 0 } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    if (session) query.session(session);

    try {
        return await query;
    } catch (err) {
        // Two requests racing to create the same wallet: the unique index rejects the
        // loser, which then simply reads the winner's document.
        if (err.code === 11000) {
            return Wallet.findOne({ user: userId }).session(session);
        }
        throw err;
    }
}

/**
 * Move money into or out of a wallet, and record why.
 *
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} params.type            - one of TXN_TYPES
 * @param {number} params.amountPaise     - positive integer; `type` sets the direction
 * @param {string} [params.idempotencyKey]- repeating a call with the same key is a no-op
 * @param {string} [params.orderId]
 * @param {string} [params.topupId]
 * @param {string} [params.adminId]       - set when an admin triggered this
 * @param {string} [params.reason]        - required when adminId is set
 * @param {Object} [params.fx]            - { originalCurrency, originalAmount, fxRate }
 * @param {Object} [params.meta]
 * @param {Function} [params.withinTxn]   - extra writes to commit atomically with this
 *                                          one, called as (session, ledgerRow, wallet).
 *                                          Use it to flip an order to paid in the same
 *                                          breath as the debit.
 * @returns {Promise<{wallet, transaction, duplicate: boolean}>}
 */
export async function applyTransaction(params) {
    const {
        userId,
        type,
        amountPaise,
        idempotencyKey = null,
        orderId = null,
        topupId = null,
        adminId = null,
        reason = null,
        fx = null,
        meta = {},
        withinTxn = null,
    } = params;

    // Validate before touching the database, so a bad call costs nothing.
    if (!TXN_TYPES.includes(type)) {
        throw new WalletError("BAD_TYPE", `Unknown wallet transaction type: ${type}`);
    }
    if (!Number.isInteger(amountPaise) || amountPaise <= 0) {
        throw new WalletError("BAD_AMOUNT", "amountPaise must be a positive whole number");
    }
    if (adminId && !reason?.trim()) {
        throw new WalletError("REASON_REQUIRED", "A reason is required for admin actions");
    }

    const credit = isCreditType(type);
    const delta = credit ? amountPaise : -amountPaise;

    // Cheap replay check. The unique index below is the real guarantee; this just
    // avoids opening a transaction for a request we have already handled.
    if (idempotencyKey) {
        const seen = await findByIdempotencyKey(idempotencyKey);
        if (seen) return seen;
    }

    await getOrCreateWallet(userId);

    const session = await mongoose.startSession();
    let result;

    try {
        await session.withTransaction(async () => {
            // Step 1: move the balance.
            //
            // For a debit the filter carries the "enough funds" condition, so the
            // check and the decrement are one atomic operation. If it does not match,
            // nothing is written and `updated` is null.
            const filter = { user: userId, status: "active" };
            if (!credit) filter.balancePaise = { $gte: amountPaise };

            const updated = await Wallet.findOneAndUpdate(
                filter,
                {
                    $inc: { balancePaise: delta, txnSeq: 1 },
                    $set: { lastTransactionAt: new Date() },
                },
                { new: true, session }
            );

            if (!updated) {
                // Work out which condition failed, so the caller gets a useful error.
                const wallet = await Wallet.findOne({ user: userId }).session(session).lean();
                if (!wallet) throw new WalletError("NO_WALLET", "Wallet not found", 404);
                if (wallet.status !== "active") {
                    throw new WalletError("WALLET_FROZEN", "This wallet is frozen", 423);
                }
                throw new WalletError("INSUFFICIENT_FUNDS", "Insufficient wallet balance", 422);
            }

            // Step 2: record it. balanceAfterPaise comes from the document the update
            // returned, so it reflects this change and no other.
            const [transaction] = await WalletTransaction.create(
                [
                    {
                        wallet: updated._id,
                        user: userId,
                        type,
                        amountPaise,
                        deltaPaise: delta,
                        balanceAfterPaise: updated.balancePaise,
                        seq: updated.txnSeq,
                        order: orderId,
                        topup: topupId,
                        admin: adminId,
                        reason: reason?.trim() || null,
                        originalCurrency: fx?.originalCurrency ?? null,
                        originalAmount: fx?.originalAmount ?? null,
                        fxRate: fx?.fxRate ?? null,
                        idempotencyKey,
                        meta,
                    },
                ],
                { session }
            );

            // Step 3: whatever the caller needs committed alongside this.
            if (withinTxn) await withinTxn(session, transaction, updated);

            result = { wallet: updated, transaction, duplicate: false };
        });
    } catch (err) {
        // Two identical requests arriving together: one wins the unique index, the
        // other lands here and resolves to the winner's row.
        if (err.code === 11000 && idempotencyKey) {
            const seen = await findByIdempotencyKey(idempotencyKey);
            if (seen) return seen;
        }
        throw err;
    } finally {
        await session.endSession();
    }

    return result;
}

async function findByIdempotencyKey(idempotencyKey) {
    const transaction = await WalletTransaction.findOne({ idempotencyKey }).lean();
    if (!transaction) return null;

    const wallet = await Wallet.findById(transaction.wallet).lean();
    return { wallet, transaction, duplicate: true };
}

export const credit = (params) => applyTransaction(params);
export const debit = (params) => applyTransaction(params);

/** Current balance in paise. Creates the wallet if the user has never had one. */
export async function getBalancePaise(userId) {
    const wallet = await getOrCreateWallet(userId);
    return wallet.balancePaise;
}
