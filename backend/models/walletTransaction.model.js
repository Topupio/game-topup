import mongoose from "mongoose";

export const CREDIT_TYPES = [
    "credit_topup",
    "credit_refund",
    "credit_manual",
    "credit_promo",
    "credit_referral",
];

export const DEBIT_TYPES = ["debit_order", "debit_manual"];

export const TXN_TYPES = [...CREDIT_TYPES, ...DEBIT_TYPES];

export const isCreditType = (type) => CREDIT_TYPES.includes(type);

/**
 * The wallet ledger: one row per balance change, never edited, never deleted.
 *
 * This is the financial audit trail. The admin activity log is not — it expires after
 * 30 days. Every row here carries who did it and why, and rows are only ever added.
 *
 * A correction is a new compensating row, not an edit to an old one.
 */
const walletTransactionSchema = new mongoose.Schema(
    {
        wallet: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Wallet",
            required: true,
        },

        // Denormalised from the wallet: every ledger query is by user.
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        type: { type: String, enum: TXN_TYPES, required: true },

        // Always positive. `type` says whether it is money in or money out.
        amountPaise: {
            type: Number,
            required: true,
            min: 1,
            validate: {
                validator: Number.isInteger,
                message: "amountPaise must be a whole number of paise",
            },
        },

        // The same amount, signed. Lets the audit job sum a single field instead of
        // branching on `type`. Written by the service, never by callers.
        deltaPaise: {
            type: Number,
            required: true,
            validate: {
                validator: (v) => Number.isInteger(v) && v !== 0,
                message: "deltaPaise must be a non-zero whole number",
            },
        },

        // The balance immediately after this row was written. Taken from the update's
        // return value, never recomputed, so it stays correct under concurrency.
        balanceAfterPaise: {
            type: Number,
            required: true,
            min: 0,
            validate: {
                validator: Number.isInteger,
                message: "balanceAfterPaise must be a whole number of paise",
            },
        },

        // Position in this wallet's history, starting at 1.
        seq: { type: Number, required: true, min: 1 },

        order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
        topup: { type: mongoose.Schema.Types.ObjectId, ref: "WalletTopup", default: null },
        admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

        // Required whenever an admin is behind the change.
        reason: { type: String, trim: true, maxlength: 500, default: null },

        // What the money looked like before it became paise, when a conversion happened.
        // Kept so a refund can be explained months later, after rates have moved.
        originalCurrency: { type: String, default: null },
        originalAmount: { type: Number, default: null },
        fxRate: { type: Number, default: null },

        // Makes a repeated request harmless. Derived from the triggering event, e.g.
        // "nowpayments:5872341190" or "order_pay:<orderId>", so a replay produces the
        // same key and collides with the unique index below.
        idempotencyKey: { type: String, default: null },

        meta: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    // No updatedAt: rows are never modified.
    { timestamps: { createdAt: true, updatedAt: false } }
);

// --- Indexes ---

// Ledger pagination, the hot read path.
walletTransactionSchema.index({ user: 1, createdAt: -1, _id: -1 });

// Ordering, and a guard against two rows claiming the same position.
walletTransactionSchema.index({ wallet: 1, seq: 1 }, { unique: true });

// Idempotency. partialFilterExpression, NOT sparse: a sparse unique index still
// indexes explicit nulls, and Mongoose writes idempotencyKey: null by default, so
// the second keyless row would collide with the first.
walletTransactionSchema.index(
    { idempotencyKey: 1 },
    { unique: true, partialFilterExpression: { idempotencyKey: { $type: "string" } } }
);

// Audit job: sum deltaPaise for one wallet.
walletTransactionSchema.index({ wallet: 1, createdAt: 1 });

// Finding an order's original debit, and preventing double refunds.
walletTransactionSchema.index({ order: 1, type: 1 });

// Admin reporting, e.g. every manual credit this month.
walletTransactionSchema.index({ type: 1, createdAt: -1 });

// --- Append-only enforcement ---
//
// Mongo cannot mark a collection immutable, so block the mutating paths at the ODM
// layer. Direct driver or mongosh access bypasses this; the real protection would be
// a database user without update/delete rights on this collection.
const refuseMutation = function (next) {
    next(new Error("wallet_transactions is append-only and cannot be modified"));
};

for (const op of [
    "findOneAndUpdate",
    "updateOne",
    "updateMany",
    "deleteOne",
    "deleteMany",
    "findOneAndDelete",
    "findOneAndRemove",
]) {
    walletTransactionSchema.pre(op, refuseMutation);
}

walletTransactionSchema.pre("save", function (next) {
    if (!this.isNew) {
        return next(new Error("wallet_transactions is append-only and cannot be modified"));
    }
    next();
});

walletTransactionSchema.pre("validate", function (next) {
    if (this.admin && !this.reason?.trim()) {
        return next(new Error("A reason is required for admin-initiated wallet transactions"));
    }

    const expected = isCreditType(this.type) ? this.amountPaise : -this.amountPaise;
    if (this.deltaPaise !== expected) {
        return next(new Error("deltaPaise does not match type and amountPaise"));
    }

    next();
});

export default mongoose.model("WalletTransaction", walletTransactionSchema);
