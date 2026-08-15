import mongoose from "mongoose";

/**
 * Wallet limits and kill switches. A single document, like PaymentSettings.
 *
 * Amounts are in paise. Everything customer-facing is gated behind `enabled`, so the
 * whole feature can be switched off without a redeploy.
 */
const walletSettingsSchema = new mongoose.Schema(
    {
        enabled: { type: Boolean, default: false },

        minTopupPaise: { type: Number, default: 10_000 },        // ₹100
        maxTopupPaise: { type: Number, default: 5_000_000 },     // ₹50,000 per top-up
        dailyTopupCapPaise: { type: Number, default: 5_000_000 },// ₹50,000 per day

        // A ceiling on stored credit. There are no withdrawals, so an unbounded
        // balance is money the customer cannot get back out.
        maxBalancePaise: { type: Number, default: 20_000_000 },  // ₹2,00,000

        upiTopupEnabled: { type: Boolean, default: false },
        usdtTopupEnabled: { type: Boolean, default: false },
        walletPaymentEnabled: { type: Boolean, default: false },

        topupExpiryMinutes: { type: Number, default: 60 },

        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    },
    { timestamps: true }
);

const WalletSettings = mongoose.model("WalletSettings", walletSettingsSchema);

/** Fetch the settings document, creating it with defaults on first use. */
export async function getWalletSettings() {
    const existing = await WalletSettings.findOne();
    if (existing) return existing;
    return WalletSettings.create({});
}

export default WalletSettings;
