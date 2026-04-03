import PaymentSettings from "../models/paymentSettings.model.js";
import Order from "../models/order.model.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { logAdminActivity } from "../utils/adminLogger.js";
import { convertAmount, getExchangeRates } from "../utils/currencyConverter.js";

const UTR_REGEX = /^\d{12}$/;

const DEFAULT_PAYEE_NAME = "Game Topup";
const UPI_ID_REGEX = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/;

async function getOrCreatePaymentSettings() {
    let settings = await PaymentSettings.findOne();

    if (!settings) {
        settings = await PaymentSettings.create({
            upi: {
                enabled: false,
                upiId: "",
                payeeName: DEFAULT_PAYEE_NAME,
                instructions: "",
            },
        });
    }

    return settings;
}

function buildUpiDeepLink({
    upiId,
    payeeName,
    amount,
    note,
    reference,
}) {
    const params = new URLSearchParams({
        pa: upiId,
        pn: payeeName,
        am: amount.toFixed(2),
        cu: "INR",
        tn: note,
        tr: reference,
    });

    return `upi://pay?${params.toString()}`;
}

/**
 * @desc    Get payment settings for admin
 * @route   GET /api/payments/settings
 * @access  Private/Admin
 */
export const getPaymentSettings = asyncHandler(async (req, res) => {
    const settings = await getOrCreatePaymentSettings();

    res.status(200).json({
        success: true,
        data: {
            upi: {
                enabled: settings.upi.enabled,
                upiId: settings.upi.upiId,
                payeeName: settings.upi.payeeName || DEFAULT_PAYEE_NAME,
                instructions: settings.upi.instructions || "",
                updatedAt: settings.updatedAt,
            },
        },
    });
});

/**
 * @desc    Update payment settings for admin
 * @route   PUT /api/payments/settings
 * @access  Private/Admin
 */
export const updatePaymentSettings = asyncHandler(async (req, res) => {
    const upiInput = req.body?.upi || {};
    const enabled = Boolean(upiInput.enabled);
    const upiId = String(upiInput.upiId || "").trim();
    const payeeName = String(upiInput.payeeName || DEFAULT_PAYEE_NAME).trim();
    const instructions = String(upiInput.instructions || "").trim();

    if (enabled && !upiId) {
        return res.status(400).json({
            success: false,
            message: "UPI ID is required when UPI QR is enabled",
        });
    }

    if (upiId && !UPI_ID_REGEX.test(upiId)) {
        return res.status(400).json({
            success: false,
            message: "Please enter a valid UPI ID",
        });
    }

    const settings = await getOrCreatePaymentSettings();

    settings.upi.enabled = enabled;
    settings.upi.upiId = upiId;
    settings.upi.payeeName = payeeName || DEFAULT_PAYEE_NAME;
    settings.upi.instructions = instructions;
    settings.upi.updatedBy = req.user.id;

    await settings.save();

    await logAdminActivity({
        req,
        action: "UPDATE",
        module: "payments",
        targetId: settings._id,
        targetModel: "PaymentSettings",
        description: `Updated UPI payment settings (${enabled ? "enabled" : "disabled"})`,
        changes: {
            upi: {
                enabled,
                upiId,
                payeeName: settings.upi.payeeName,
            },
        },
    });

    res.status(200).json({
        success: true,
        data: {
            upi: {
                enabled: settings.upi.enabled,
                upiId: settings.upi.upiId,
                payeeName: settings.upi.payeeName,
                instructions: settings.upi.instructions,
                updatedAt: settings.updatedAt,
            },
        },
        message: "Payment settings updated successfully",
    });
});

/**
 * @desc    Initiate UPI QR payment for an order
 * @route   POST /api/payments/upi/initiate
 * @access  Private
 */
export const initiateUpiPayment = asyncHandler(async (req, res) => {
    const { orderId } = req.body;

    if (!orderId) {
        return res.status(400).json({
            success: false,
            message: "Order ID is required",
        });
    }

    const query = req.user.role === "admin"
        ? { _id: orderId }
        : { _id: orderId, user: req.user.id };

    const order = await Order.findOne(query);

    if (!order) {
        return res.status(404).json({
            success: false,
            message: "Order not found",
        });
    }

    if (order.orderStatus === "expired") {
        return res.status(400).json({
            success: false,
            message: "This order has expired. Please place a new order.",
        });
    }

    if (order.paymentStatus === "paid") {
        return res.status(400).json({
            success: false,
            message: "This order has already been paid",
        });
    }

    const settings = await getOrCreatePaymentSettings();

    if (!settings.upi.enabled || !settings.upi.upiId) {
        return res.status(400).json({
            success: false,
            message: "UPI payments are currently unavailable",
        });
    }

    const orderCurrency = order.currency || "USD";
    const rates = await getExchangeRates();
    const inrAmount = convertAmount(order.amount, orderCurrency, "INR", rates);

    if (!Number.isFinite(inrAmount) || inrAmount <= 0) {
        return res.status(400).json({
            success: false,
            message: "Unable to generate a valid INR payment amount for this order",
        });
    }

    const payeeName = settings.upi.payeeName || DEFAULT_PAYEE_NAME;
    const reference = order.orderId;
    const note = `Order ${order.orderId}`;
    const deepLink = buildUpiDeepLink({
        upiId: settings.upi.upiId,
        payeeName,
        amount: inrAmount,
        note,
        reference,
    });

    const alreadyInitialized = order.paymentMethod === "upi"
        && order.paymentInfo?.paymentGatewayResponse?.upi?.reference === reference;

    order.paymentMethod = "upi";
    order.paymentInfo = {
        ...order.paymentInfo,
        transactionId: reference,
        paymentGatewayResponse: {
            ...order.paymentInfo?.paymentGatewayResponse,
            upi: {
                upiId: settings.upi.upiId,
                payeeName,
                amount: inrAmount,
                currency: "INR",
                originalAmount: order.amount,
                originalCurrency: orderCurrency,
                note,
                reference,
                deepLink,
                initiatedAt: new Date(),
            },
        },
    };

    if (!alreadyInitialized) {
        order.tracking.push({
            status: order.orderStatus,
            message: "UPI QR generated. Awaiting customer payment and manual verification.",
        });
    }

    await order.save();

    res.status(200).json({
        success: true,
        data: {
            orderId: order._id,
            orderReference: order.orderId,
            upiId: settings.upi.upiId,
            payeeName,
            amount: inrAmount,
            currency: "INR",
            originalAmount: order.amount,
            originalCurrency: orderCurrency,
            note,
            reference,
            deepLink,
            qrPayload: deepLink,
            instructions: settings.upi.instructions || "",
        },
        message: "UPI payment is ready",
    });
});

/**
 * @desc    Submit UTR / Transaction ID for a UPI order
 * @route   POST /api/payments/upi/submit-utr
 * @access  Private
 */
export const submitUtrNumber = asyncHandler(async (req, res) => {
    const { orderId, utrNumber } = req.body;

    if (!orderId) {
        return res.status(400).json({ success: false, message: "Order ID is required" });
    }

    if (!utrNumber || !UTR_REGEX.test(String(utrNumber).trim())) {
        return res.status(400).json({
            success: false,
            message: "UTR must be exactly 12 digits",
        });
    }

    const query = req.user.role === "admin"
        ? { _id: orderId }
        : { _id: orderId, user: req.user.id };

    const order = await Order.findOne(query);

    if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.paymentMethod !== "upi") {
        return res.status(400).json({
            success: false,
            message: "UTR submission is only valid for UPI orders",
        });
    }

    if (order.paymentStatus === "paid") {
        return res.status(400).json({
            success: false,
            message: "This order has already been paid",
        });
    }

    const utr = String(utrNumber).trim();

    // Keep transactionId in sync with utrNumber so admin panels that read
    // transactionId also see the UTR without schema changes elsewhere.
    order.paymentInfo = {
        ...order.paymentInfo,
        transactionId: utr,
        utrNumber: utr,
        utrSubmittedAt: new Date(),
    };

    order.tracking.push({
        status: order.orderStatus,
        message: `Customer submitted UTR ${utr}. Awaiting admin verification.`,
    });

    await order.save();

    res.status(200).json({
        success: true,
        message: "UTR submitted. We will verify and update your order shortly.",
    });
});
