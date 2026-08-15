import mongoose from "mongoose";

/**
 * A user's store credit balance, held in INR paise.
 *
 * The balance here is a cached total. The authoritative history is the append-only
 * WalletTransaction ledger, and the nightly audit job proves the two agree. Nothing
 * may change `balancePaise` except services/wallet.service.js.
 */
const walletSchema = new mongoose.Schema(
    {
        // The SQL spec made user_id the primary key. Here it is a unique index instead,
        // so _id stays an ObjectId like every other model and populate() behaves.
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        balancePaise: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
            validate: {
                validator: Number.isInteger,
                message: "balancePaise must be a whole number of paise",
            },
        },

        currency: { type: String, default: "INR", immutable: true },

        // Incremented with every ledger row. Gives the ledger a reliable order —
        // createdAt only has millisecond resolution and can tie.
        txnSeq: { type: Number, default: 0 },

        // Lets an admin stop a compromised account from spending without touching
        // the balance. Not in the original spec, but there is no other way to do it.
        status: {
            type: String,
            enum: ["active", "frozen"],
            default: "active",
        },
        frozenReason: { type: String, default: null },
        frozenAt: { type: Date, default: null },
        frozenBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

        lastTransactionAt: { type: Date, default: null },
    },
    { timestamps: true }
);

export default mongoose.model("Wallet", walletSchema);
