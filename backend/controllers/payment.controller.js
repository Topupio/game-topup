import Order from "../models/order.model.js";
import Payment from "../models/payment.model.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import mongoose from "mongoose";
import { logAdminActivity } from "../utils/adminLogger.js";
import * as paypalService from "../services/paypal.service.js";
import { getExchangeRates, convertAmount } from "../utils/currencyConverter.js";

/**
 * @desc    Create a PayPal order for an existing pending order
 * @route   POST /api/payments/paypal/create-order
 * @access  Private
 */
export const createPayPalOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.body;

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({ success: false, message: "Valid orderId is required" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Verify ownership
    if (order.user.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // Only allow payment for pending orders
    if (order.paymentStatus !== "pending") {
        return res.status(400).json({
            success: false,
            message: `Order payment is already ${order.paymentStatus}`,
        });
    }

    // Always charge PayPal in USD — convert from order currency if needed
    const orderCurrency = order.currency || "USD";
    let paypalAmount = order.amount;
    if (orderCurrency !== "USD") {
        const rates = await getExchangeRates();
        paypalAmount = convertAmount(order.amount, orderCurrency, "USD", rates);
    }

    console.log("Creating PayPal order:", {
        originalAmount: order.amount,
        originalCurrency: orderCurrency,
        paypalAmount,
        paypalCurrency: "USD",
        orderId: order.orderId,
    });
    const paypalOrder = await paypalService.createOrder(
        paypalAmount,
        "USD",
        order.orderId
    );
    console.log("PayPal order created:", paypalOrder);

    // Store PayPal order ID for reference
    order.paymentInfo = {
        ...order.paymentInfo,
        transactionId: paypalOrder.id,
    };
    order.paymentMethod = "paypal";
    await order.save();

    res.status(200).json({
        success: true,
        paypalOrderId: paypalOrder.id,
    });
});

/**
 * @desc    Capture a PayPal order after buyer approval
 * @route   POST /api/payments/paypal/capture-order
 * @access  Private
 */
export const capturePayPalOrder = asyncHandler(async (req, res) => {
    const { paypalOrderId, orderId } = req.body;

    if (!paypalOrderId || !orderId) {
        return res.status(400).json({
            success: false,
            message: "paypalOrderId and orderId are required",
        });
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({ success: false, message: "Invalid orderId" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Verify ownership
    if (order.user.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // Idempotency: if already paid, return success
    if (order.paymentStatus === "paid") {
        return res.status(200).json({
            success: true,
            data: order,
            message: "Payment already captured",
        });
    }

    if (order.paymentStatus !== "pending") {
        return res.status(400).json({
            success: false,
            message: `Cannot capture payment for order with status: ${order.paymentStatus}`,
        });
    }

    try {
        const captureResult = await paypalService.captureOrder(paypalOrderId);

        if (captureResult.status === "COMPLETED") {
            // Update order
            order.paymentStatus = "paid";
            order.orderStatus = "paid";
            order.paymentMethod = "paypal";
            order.paymentInfo = {
                transactionId: captureResult.captureId,
                paymentGatewayResponse: captureResult.fullResponse,
            };
            order.tracking.push({
                status: "paid",
                message: "Payment confirmed via PayPal",
            });
            await order.save();

            // Create Payment record
            await Payment.create({
                order: order._id,
                user: order.user,
                paymentGateway: "paypal",
                status: "success",
                amount: order.amount,
                currency: order.currency || "USD",
                transactionId: captureResult.captureId,
                orderId: paypalOrderId,
                gatewayResponse: captureResult.fullResponse,
            });

            return res.status(200).json({
                success: true,
                data: order,
                message: "Payment captured successfully",
            });
        }

        // Payment not completed
        order.paymentStatus = "failed";
        order.tracking.push({
            status: "failed",
            message: `PayPal payment ${captureResult.status}`,
        });
        await order.save();

        await Payment.create({
            order: order._id,
            user: order.user,
            paymentGateway: "paypal",
            status: "failed",
            amount: order.amount,
            currency: order.currency || "USD",
            orderId: paypalOrderId,
            gatewayResponse: captureResult.fullResponse,
        });

        return res.status(400).json({
            success: false,
            message: "Payment was not completed",
            status: captureResult.status,
        });
    } catch (error) {
        // Handle INSTRUMENT_DECLINED - let user retry with different funding source
        if (error instanceof paypalService.ApiError) {
            const errorDetails = error.result;
            const isInstrumentDeclined =
                errorDetails?.details?.some(
                    (d) => d.issue === "INSTRUMENT_DECLINED"
                );

            if (isInstrumentDeclined) {
                return res.status(422).json({
                    success: false,
                    message: "Payment method declined. Please try a different payment method.",
                    code: "INSTRUMENT_DECLINED",
                });
            }
        }
        throw error;
    }
});

/**
 * @desc    Handle PayPal webhook events (safety net)
 * @route   POST /api/payments/paypal/webhook
 * @access  Public (verified via PayPal signature)
 */
export const handlePayPalWebhook = async (req, res) => {
    try {
        // Verify webhook signature
        const isValid = await paypalService.verifyWebhookSignature(
            req.headers,
            req.body
        );

        if (!isValid) {
            console.error("PayPal webhook signature verification failed");
            return res.status(401).json({ message: "Invalid signature" });
        }

        const event = typeof req.body === "string"
            ? JSON.parse(req.body)
            : JSON.parse(req.body.toString("utf8"));

        const eventType = event.event_type;
        const resource = event.resource;

        switch (eventType) {
            case "PAYMENT.CAPTURE.COMPLETED": {
                const captureId = resource.id;
                const referenceId =
                    resource.supplementary_data?.related_ids?.order_id;

                if (!referenceId) break;

                // Find order by PayPal order ID stored in paymentInfo
                const order = await Order.findOne({
                    "paymentInfo.transactionId": captureId,
                });

                // If not found by captureId, try finding by PayPal order reference
                const targetOrder = order || await Order.findOne({
                    orderId: resource.custom_id,
                    paymentStatus: "pending",
                });

                if (targetOrder && targetOrder.paymentStatus !== "paid") {
                    targetOrder.paymentStatus = "paid";
                    targetOrder.orderStatus = "paid";
                    targetOrder.paymentMethod = "paypal";
                    targetOrder.paymentInfo = {
                        transactionId: captureId,
                        paymentGatewayResponse: resource,
                    };
                    targetOrder.tracking.push({
                        status: "paid",
                        message: "Payment confirmed via PayPal webhook",
                    });
                    await targetOrder.save();

                    // Create Payment record if not exists
                    const existingPayment = await Payment.findOne({
                        transactionId: captureId,
                    });
                    if (!existingPayment) {
                        await Payment.create({
                            order: targetOrder._id,
                            user: targetOrder.user,
                            paymentGateway: "paypal",
                            status: "success",
                            amount: parseFloat(resource.amount?.value) || targetOrder.amount,
                            currency: resource.amount?.currency_code || "USD",
                            transactionId: captureId,
                            gatewayResponse: resource,
                        });
                    }
                }
                break;
            }

            case "PAYMENT.CAPTURE.DENIED": {
                const captureId = resource.id;
                const order = await Order.findOne({
                    "paymentInfo.transactionId": captureId,
                    paymentStatus: "pending",
                });

                if (order) {
                    order.paymentStatus = "failed";
                    order.tracking.push({
                        status: "failed",
                        message: "Payment denied by PayPal",
                    });
                    await order.save();
                }
                break;
            }

            case "PAYMENT.CAPTURE.REFUNDED": {
                const captureId = resource.id;
                const payment = await Payment.findOne({
                    transactionId: captureId,
                });

                if (payment && !payment.refund.refunded) {
                    payment.refund = {
                        refunded: true,
                        refundId: resource.id,
                        amount: parseFloat(resource.amount?.value) || payment.amount,
                        reason: "Refunded via PayPal",
                        refundedAt: new Date(),
                    };
                    payment.status = "refunded";
                    await payment.save();

                    const order = await Order.findById(payment.order);
                    if (order && order.paymentStatus !== "refunded") {
                        order.paymentStatus = "refunded";
                        order.orderStatus = "cancelled";
                        order.tracking.push({
                            status: "refunded",
                            message: "Payment refunded via PayPal webhook",
                        });
                        await order.save();
                    }
                }
                break;
            }

            default:
                console.log(`Unhandled PayPal webhook event: ${eventType}`);
        }

        // Always return 200 to acknowledge receipt
        res.status(200).json({ received: true });
    } catch (error) {
        console.error("PayPal webhook error:", error);
        // Return 200 to prevent PayPal from retrying on parse/processing errors
        res.status(200).json({ received: true });
    }
};

/**
 * @desc    Refund a PayPal payment (Admin only)
 * @route   POST /api/payments/paypal/refund
 * @access  Private/Admin
 */
export const refundPayPalPayment = asyncHandler(async (req, res) => {
    const { orderId, amount, reason } = req.body;

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({ success: false, message: "Valid orderId is required" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.paymentStatus !== "paid") {
        return res.status(400).json({
            success: false,
            message: "Only paid orders can be refunded",
        });
    }

    if (order.paymentMethod !== "paypal") {
        return res.status(400).json({
            success: false,
            message: "This order was not paid via PayPal",
        });
    }

    // Find the payment record to get the capture ID
    const payment = await Payment.findOne({
        order: order._id,
        paymentGateway: "paypal",
        status: "success",
    });

    if (!payment || !payment.transactionId) {
        return res.status(400).json({
            success: false,
            message: "No PayPal capture found for this order",
        });
    }

    const refundResult = await paypalService.refundCapture(
        payment.transactionId,
        amount || null,
        order.currency || "USD",
        reason || "Refund requested by admin"
    );

    // Update payment record
    payment.refund = {
        refunded: true,
        refundId: refundResult.id,
        amount: amount || order.amount,
        reason: reason || "Refund requested by admin",
        refundedAt: new Date(),
    };
    payment.status = "refunded";
    await payment.save();

    // Update order
    order.paymentStatus = "refunded";
    order.orderStatus = "cancelled";
    order.tracking.push({
        status: "refunded",
        message: `Payment refunded via PayPal${reason ? `: ${reason}` : ""}`,
    });
    await order.save();

    await logAdminActivity({
        req,
        action: "REFUND",
        module: "PAYMENT",
        targetId: order._id,
        targetModel: "Order",
        description: `Refunded PayPal payment for order ${order.orderId}. Amount: ${amount || order.amount}`,
        changes: { refundId: refundResult.id, amount: amount || order.amount },
    });

    res.status(200).json({
        success: true,
        data: { order, refundId: refundResult.id },
        message: "Refund processed successfully",
    });
});
