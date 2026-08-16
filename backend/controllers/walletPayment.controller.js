import mongoose from "mongoose";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import Order from "../models/order.model.js";
import { getWalletSettings } from "../models/walletSettings.model.js";
import { applyTransaction, getOrCreateWallet, WalletError } from "../services/wallet.service.js";
import { getOrderDebitPaise } from "../services/walletPricing.service.js";
import { placeExternalOrderIfEligible } from "../utils/externalOrderPlacer.js";
import { formatPaise } from "../utils/money.js";

/** Load an order the caller is allowed to act on. Returns null when not found. */
async function findOwnedOrder(req, orderId) {
    if (!mongoose.Types.ObjectId.isValid(orderId)) return null;

    const query = req.user.role === "admin"
        ? { _id: orderId }
        : { _id: orderId, user: req.user.id };

    return Order.findOne(query);
}

/**
 * @desc    What paying this order from the wallet would cost
 * @route   GET /api/payments/wallet/quote?orderId=...
 * @access  Private
 *
 * The client shows prices converted for readability, but those figures are display
 * only. This returns the exact amount the server will debit, so checkout confirms
 * against the real number rather than a locally converted one that could differ if
 * the client's cached rates are stale.
 */
export const quoteWalletPayment = asyncHandler(async (req, res) => {
    const order = await findOwnedOrder(req, req.query.orderId);
    if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
    }

    const settings = await getWalletSettings();
    const wallet = await getOrCreateWallet(order.user);
    const { amountPaise, originalCurrency, originalAmount, fxRate } =
        await getOrderDebitPaise(order);

    res.status(200).json({
        success: true,
        data: {
            orderId: order._id,
            amountPaise,
            originalAmount,
            originalCurrency,
            fxRate,
            balancePaise: wallet.balancePaise,
            sufficient: wallet.balancePaise >= amountPaise,
            shortfallPaise: Math.max(0, amountPaise - wallet.balancePaise),
            available: settings.enabled && settings.walletPaymentEnabled && wallet.status === "active",
        },
    });
});

/**
 * @desc    Pay an order from the wallet
 * @route   POST /api/payments/wallet/pay
 * @access  Private
 *
 * The debit and the order becoming paid happen in one transaction. Doing them
 * separately would leave a window where the customer's money is gone and the order
 * still says unpaid — the worst outcome available.
 *
 * Note the body takes only an orderId. There is no amount to tamper with; the figure
 * is derived server-side from the order.
 */
export const payWithWallet = asyncHandler(async (req, res) => {
    const { orderId } = req.body;

    const settings = await getWalletSettings();
    if (!settings.enabled || !settings.walletPaymentEnabled) {
        return res.status(400).json({ success: false, message: "Wallet payments are currently unavailable" });
    }

    const order = await findOwnedOrder(req, orderId);
    if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.paymentStatus === "paid") {
        return res.status(200).json({
            success: true,
            data: { order },
            message: "This order is already paid",
        });
    }

    if (order.paymentStatus !== "pending") {
        return res.status(400).json({
            success: false,
            message: `This order cannot be paid because it is ${order.paymentStatus}`,
        });
    }

    if (order.orderStatus === "expired") {
        return res.status(400).json({ success: false, message: "This order has expired" });
    }

    const { amountPaise, originalCurrency, originalAmount, fxRate } =
        await getOrderDebitPaise(order);

    let result;
    try {
        result = await applyTransaction({
            userId: order.user,
            type: "debit_order",
            amountPaise,
            orderId: order._id,
            // One debit per order, however many times this is called.
            idempotencyKey: `order_pay:${order._id}`,
            fx: { originalCurrency, originalAmount, fxRate },
            withinTxn: async (session, transaction) => {
                const updated = await Order.updateOne(
                    { _id: order._id, paymentStatus: "pending" },
                    {
                        $set: {
                            paymentStatus: "paid",
                            orderStatus: "paid",
                            paymentMethod: "wallet",
                            "paymentInfo.transactionId": String(transaction._id),
                            // Snapshot the rate used. Without it a later refund or
                            // dispute has no way to explain the figure.
                            "paymentBreakdown.wallet": {
                                amountPaise,
                                originalAmount,
                                originalCurrency,
                                fxRate,
                                walletTransaction: transaction._id,
                                chargedAt: new Date(),
                            },
                        },
                        $push: {
                            tracking: {
                                status: "paid",
                                message: `Paid from wallet (${formatPaise(amountPaise)})`,
                            },
                        },
                    },
                    { session }
                );

                if (updated.matchedCount === 0) {
                    throw new WalletError("ORDER_NOT_PENDING", "This order is no longer payable", 409);
                }
            },
        });
    } catch (err) {
        if (err instanceof WalletError) {
            return res.status(err.status).json({
                success: false,
                code: err.code,
                message: err.message,
                ...(err.code === "INSUFFICIENT_FUNDS" && { data: { requiredPaise: amountPaise } }),
            });
        }
        throw err;
    }

    // Fulfilment runs after the commit, never inside it: the transaction callback can
    // be retried, and anything with an external side effect would fire twice.
    //
    // Re-read the order first — placeExternalOrderIfEligible saves the document it is
    // given, and the stale copy from before the transaction would overwrite the fields
    // that were just written.
    const paidOrder = await Order.findById(order._id);
    try {
        await placeExternalOrderIfEligible(paidOrder);
    } catch (err) {
        // Matches how the PayPal and crypto paths behave: the payment stands and the
        // order waits for an admin. Reversing it automatically would be worse, since
        // fulfilment may have partially succeeded.
        console.error("[WALLET-PAY] external fulfilment failed:", err);
    }

    const finalOrder = await Order.findById(order._id);

    res.status(200).json({
        success: true,
        data: {
            order: finalOrder,
            balancePaise: result.wallet.balancePaise,
            transactionId: result.transaction._id,
        },
        message: "Paid from wallet",
    });
});
