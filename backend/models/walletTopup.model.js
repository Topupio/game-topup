import mongoose from "mongoose";

/**
 * A request to add money to a wallet.
 *
 * UPI top-ups wait for an admin to verify the UTR. USDT top-ups are credited by the
 * NOWPayments webhook. Either way the credit happens exactly once — see the unique
 * index on (method, providerRef) and the idempotency key on the ledger row.
 *
 * Status flow:
 *   pending   - created, money not yet claimed to be sent
 *   paid      - customer submitted a UTR, awaiting admin review (UPI only)
 *   confirmed - wallet credited; terminal
 *   rejected  - admin declined; terminal
 *   expired   - never completed; terminal
 */
const walletTopupSchema = new mongoose.Schema(
    {
        topupRef: { type: String, unique: true, required: true },

        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        wallet: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet", required: true },

        method: { type: String, enum: ["upi", "usdt"], required: true },

        amountPaise: {
            type: Number,
            required: true,
            min: 1,
            validate: {
                validator: Number.isInteger,
                message: "amountPaise must be a whole number of paise",
            },
        },

        // What the customer actually paid in, when it was not INR.
        originalCurrency: { type: String, default: "INR" },
        originalAmount: { type: Number, default: null },
        fxRate: { type: Number, default: null },

        status: {
            type: String,
            enum: ["pending", "paid", "confirmed", "rejected", "expired"],
            default: "pending",
        },

        // Provider's identifier: a NOWPayments payment id. Unique per method, so the
        // same payment can never be credited twice.
        providerRef: { type: String, default: null, trim: true },

        upi: {
            upiId: String,
            payeeName: String,
            reference: String,
            deepLink: String,
            amountInr: Number,
            initiatedAt: Date,
            utrNumber: { type: String, default: null, trim: true },
            utrSubmittedAt: { type: Date, default: null },
        },

        crypto: {
            invoiceId: String,
            invoiceUrl: String,
            payCurrency: String,
            actuallyPaid: Number,
            lastIpnStatus: String,
            lastIpnAt: Date,
        },

        // The ledger row that credited this top-up. Set once, after the credit commits.
        creditTransaction: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "WalletTransaction",
            default: null,
        },
        creditedAt: { type: Date, default: null },

        admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        adminNote: { type: String, trim: true, maxlength: 500, default: null },
        reviewedAt: { type: Date, default: null },

        expiresAt: { type: Date, default: null },
        rawProviderPayload: { type: mongoose.Schema.Types.Mixed, default: null },
    },
    { timestamps: true }
);

// Idempotency for provider callbacks. Partial so many top-ups without a provider
// reference can coexist — see the note in walletTransaction.model.js.
walletTopupSchema.index(
    { method: 1, providerRef: 1 },
    { unique: true, partialFilterExpression: { providerRef: { $type: "string" } } }
);

// Daily cap: sum credited amounts for a user within today.
walletTopupSchema.index({ user: 1, status: 1, creditedAt: -1 });

// A user's top-up history.
walletTopupSchema.index({ user: 1, createdAt: -1 });

// The admin review queue.
walletTopupSchema.index({ status: 1, method: 1, createdAt: -1 });

// The expiry sweep.
walletTopupSchema.index({ status: 1, expiresAt: 1 });

// Blocks one UTR being reused across several top-ups.
walletTopupSchema.index(
    { "upi.utrNumber": 1 },
    { unique: true, partialFilterExpression: { "upi.utrNumber": { $type: "string" } } }
);

export default mongoose.model("WalletTopup", walletTopupSchema);
