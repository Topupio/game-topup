import WalletTopup from "../models/walletTopup.model.js";

/**
 * Close out top-ups the customer never completed.
 *
 * Only "pending" ones expire. A top-up sitting at "paid" has a UTR against it — the
 * customer says they sent money — and expiring that would silently discard a real
 * payment. Those wait for an admin however long it takes.
 */
export async function expireWalletTopups() {
    const result = await WalletTopup.updateMany(
        { status: "pending", expiresAt: { $lt: new Date() } },
        { $set: { status: "expired" } }
    );

    return { expired: result.modifiedCount };
}
