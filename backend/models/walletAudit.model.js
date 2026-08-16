import mongoose from "mongoose";

/**
 * Result of a nightly reconciliation between wallet balances and the ledger.
 *
 * Deliberately has no TTL index. The admin activity log expires after 30 days; this
 * is the record an accountant or auditor would ask for, so it is kept indefinitely.
 */
const walletAuditSchema = new mongoose.Schema(
    {
        mode: { type: String, enum: ["nightly", "full", "manual"], default: "nightly" },

        walletsChecked: { type: Number, default: 0 },
        mismatchCount: { type: Number, default: 0 },

        mismatches: {
            type: [
                {
                    wallet: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet" },
                    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                    kind: String,
                    walletBalancePaise: Number,
                    ledgerBalancePaise: Number,
                    differencePaise: Number,
                },
            ],
            default: [],
        },

        // System-wide totals: these two must always be equal.
        globalWalletSumPaise: { type: Number, default: 0 },
        globalLedgerSumPaise: { type: Number, default: 0 },

        durationMs: { type: Number, default: 0 },
        status: { type: String, enum: ["clean", "mismatch", "error"], default: "clean" },
        error: { type: String, default: null },
    },
    { timestamps: true }
);

walletAuditSchema.index({ createdAt: -1 });

export default mongoose.model("WalletAudit", walletAuditSchema);
