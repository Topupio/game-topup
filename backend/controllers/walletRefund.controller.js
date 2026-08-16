import mongoose from "mongoose";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import Order from "../models/order.model.js";
import { applyTransaction, WalletError } from "../services/wallet.service.js";
import { resolveRefundablePaise } from "../services/walletPricing.service.js";
import { formatPaise } from "../utils/money.js";
import { logAdminActivity } from "../utils/adminLogger.js";

const REFUND_REASONS = [
    "Incorrect login details",
    "Delivery failed",
    "Out of stock",
    "Customer cancelled",
    "Goodwill",
];

/**
 * @desc    Refund an order to the customer's wallet
 * @route   POST /api/orders/admin/:id/refund-to-wallet
 * @access  Admin
 *
 * Note this is store credit, not a payment reversal — the customer's card, UPI or
 * crypto is untouched. It exists because most orders here cannot be reversed through
 * the original method, and it keeps the money inside the business.
 */
export const refundOrderToWallet = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const reason = String(req.body.reason || "").trim();

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid order id" });
    }

    if (!reason) {
        return res.status(400).json({ success: false, message: "A reason is required" });
    }

    const order = await Order.findById(id).populate("user", "name email");
    if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Only money that actually arrived can be given back. A failed or pending payment
    // never reached us, so refunding it would be handing out free credit.
    if (order.paymentStatus !== "paid") {
        return res.status(400).json({
            success: false,
            message: `Only paid orders can be refunded. This one is ${order.paymentStatus}.`,
        });
    }

    const resolved = await resolveRefundablePaise(order);
    if (resolved.error) {
        return res.status(409).json({ success: false, message: resolved.error });
    }

    const alreadyPaise = order.refund?.totalRefundedPaise || 0;
    const remainingPaise = resolved.originalPaise - alreadyPaise;

    if (remainingPaise <= 0) {
        return res.status(409).json({ success: false, message: "This order is already fully refunded" });
    }

    // Default to whatever is left, so the common case needs no amount at all.
    const requested = req.body.amountPaise;
    const amountPaise = requested === undefined || requested === null
        ? remainingPaise
        : Math.floor(Number(requested));

    if (!Number.isInteger(amountPaise) || amountPaise <= 0) {
        return res.status(400).json({
            success: false,
            message: "amountPaise must be a positive whole number of paise",
        });
    }

    if (amountPaise > remainingPaise) {
        return res.status(400).json({
            success: false,
            message: `At most ${formatPaise(remainingPaise)} can still be refunded on this order`,
        });
    }

    const entryIndex = order.refund?.entries?.length || 0;
    const willBeFullyRefunded = alreadyPaise + amountPaise >= resolved.originalPaise;

    try {
        const { wallet, transaction } = await applyTransaction({
            userId: order.user._id,
            type: "credit_refund",
            amountPaise,
            orderId: order._id,
            adminId: req.user.id,
            reason,
            // Scoped to this entry, so a genuine second partial refund is allowed but
            // a double-submit of the same one is not.
            idempotencyKey: `refund:${order._id}:${entryIndex}`,
            fx: resolved.fx,
            withinTxn: async (session, ledgerRow) => {
                // The entries length must be exactly what we read a moment ago. If
                // another refund landed in between, this misses and we abort rather
                // than paying out twice.
                const updated = await Order.updateOne(
                    { _id: order._id, "refund.entries": { $size: entryIndex } },
                    {
                        $inc: { "refund.totalRefundedPaise": amountPaise },
                        $set: {
                            "refund.isFullyRefunded": willBeFullyRefunded,
                            ...(willBeFullyRefunded && {
                                paymentStatus: "refunded",
                                orderStatus: "refunded",
                            }),
                        },
                        $push: {
                            "refund.entries": {
                                amountPaise,
                                destination: "wallet",
                                walletTransaction: ledgerRow._id,
                                reason,
                                admin: req.user.id,
                                at: new Date(),
                            },
                            tracking: {
                                status: willBeFullyRefunded ? "refunded" : order.orderStatus,
                                message: `Refunded ${formatPaise(amountPaise)} to wallet: ${reason}`,
                            },
                        },
                    },
                    { session }
                );

                if (updated.matchedCount === 0) {
                    throw new WalletError(
                        "REFUND_CONFLICT",
                        "Another refund was recorded while this one was in progress. Please review and try again.",
                        409
                    );
                }
            },
        });

        logAdminActivity(req, {
            action: "REFUND",
            module: "wallet",
            targetId: order._id,
            targetModel: "Order",
            description: `Refunded ${formatPaise(amountPaise)} to ${order.user.name}'s wallet for order ${order.orderId}: ${reason}`,
            changes: {
                amountPaise,
                reason,
                walletTransaction: transaction._id,
                convertedAtTodaysRate: resolved.converted,
            },
        });

        const updatedOrder = await Order.findById(order._id).lean();

        return res.status(200).json({
            success: true,
            data: {
                order: updatedOrder,
                balancePaise: wallet.balancePaise,
                transactionId: transaction._id,
                // True when no historical rate existed and today's was used, so the
                // admin UI can say so rather than implying an exact reversal.
                convertedAtTodaysRate: resolved.converted,
            },
            message: `Refunded ${formatPaise(amountPaise)} to wallet`,
        });
    } catch (err) {
        if (err instanceof WalletError) {
            return res.status(err.status).json({ success: false, code: err.code, message: err.message });
        }
        throw err;
    }
});

/**
 * @desc    What can still be refunded, and how that figure was derived
 * @route   GET /api/orders/admin/:id/refund-quote
 * @access  Admin
 */
export const getRefundQuote = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid order id" });
    }

    const order = await Order.findById(id);
    if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.paymentStatus !== "paid") {
        return res.status(200).json({
            success: true,
            data: { refundable: false, message: `Order is ${order.paymentStatus}` },
        });
    }

    const resolved = await resolveRefundablePaise(order);
    if (resolved.error) {
        return res.status(200).json({ success: true, data: { refundable: false, message: resolved.error } });
    }

    const alreadyPaise = order.refund?.totalRefundedPaise || 0;

    res.status(200).json({
        success: true,
        data: {
            refundable: resolved.originalPaise - alreadyPaise > 0,
            originalPaise: resolved.originalPaise,
            alreadyRefundedPaise: alreadyPaise,
            remainingPaise: Math.max(0, resolved.originalPaise - alreadyPaise),
            convertedAtTodaysRate: resolved.converted,
            paymentMethod: order.paymentMethod,
            reasons: REFUND_REASONS,
        },
    });
});
