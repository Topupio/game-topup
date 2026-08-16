import mongoose from "mongoose";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import WalletTopup from "../models/walletTopup.model.js";
import Order from "../models/order.model.js";
import { getWalletSettings } from "../models/walletSettings.model.js";
import { applyTransaction, getOrCreateWallet, WalletError } from "../services/wallet.service.js";
import {
    assertAmountWithinLimits,
    assertDailyCapAllows,
    generateTopupRef,
} from "../services/walletTopup.service.js";
import {
    DEFAULT_PAYEE_NAME,
    buildUpiDeepLink,
    getOrCreatePaymentSettings,
    isUpiAvailable,
    normalizeUtr,
} from "../services/upi.service.js";
import { formatPaise, paiseToInr } from "../utils/money.js";
import { logAdminActivity } from "../utils/adminLogger.js";

/** Turn a WalletError into a response; rethrow anything else. */
function sendWalletError(res, err) {
    if (err instanceof WalletError) {
        return res.status(err.status).json({ success: false, code: err.code, message: err.message });
    }
    throw err;
}

/**
 * @desc    Start a UPI top-up and return the QR payload
 * @route   POST /api/wallet/topups/upi/initiate
 * @access  Private
 */
export const initiateUpiTopup = asyncHandler(async (req, res) => {
    const amountPaise = Number(req.body.amountPaise);

    const settings = await getWalletSettings();
    if (!settings.enabled || !settings.upiTopupEnabled) {
        return res.status(400).json({ success: false, message: "UPI top-ups are currently unavailable" });
    }

    const upiSettings = await getOrCreatePaymentSettings();
    if (!isUpiAvailable(upiSettings)) {
        return res.status(400).json({ success: false, message: "UPI is not configured" });
    }

    try {
        assertAmountWithinLimits(amountPaise, settings);
        await assertDailyCapAllows(req.user.id, amountPaise, settings);
    } catch (err) {
        return sendWalletError(res, err);
    }

    const wallet = await getOrCreateWallet(req.user.id);

    if (wallet.status !== "active") {
        return res.status(423).json({ success: false, message: "This wallet is frozen" });
    }

    if (wallet.balancePaise + amountPaise > settings.maxBalancePaise) {
        return res.status(422).json({
            success: false,
            code: "MAX_BALANCE_EXCEEDED",
            message: `This would take your balance over the ${formatPaise(settings.maxBalancePaise)} limit`,
        });
    }

    // Cap how many top-ups can sit unpaid at once, so the queue cannot be flooded.
    const openTopups = await WalletTopup.countDocuments({
        user: req.user.id,
        status: { $in: ["pending", "paid"] },
    });
    if (openTopups >= 3) {
        return res.status(429).json({
            success: false,
            message: "You already have top-ups awaiting confirmation. Please complete them first.",
        });
    }

    const amountInr = paiseToInr(amountPaise);
    const payeeName = upiSettings.upi.payeeName || DEFAULT_PAYEE_NAME;

    // Retry on the rare reference collision, as order creation does.
    let topup = null;
    for (let attempt = 0; attempt < 3; attempt += 1) {
        const topupRef = generateTopupRef();
        try {
            topup = await WalletTopup.create({
                topupRef,
                user: req.user.id,
                wallet: wallet._id,
                method: "upi",
                amountPaise,
                originalCurrency: "INR",
                originalAmount: amountInr,
                fxRate: 1,
                status: "pending",
                expiresAt: new Date(Date.now() + settings.topupExpiryMinutes * 60 * 1000),
                upi: {
                    upiId: upiSettings.upi.upiId,
                    payeeName,
                    reference: topupRef,
                    amountInr,
                    initiatedAt: new Date(),
                    deepLink: buildUpiDeepLink({
                        upiId: upiSettings.upi.upiId,
                        payeeName,
                        amount: amountInr,
                        note: `Wallet top-up ${topupRef}`,
                        reference: topupRef,
                    }),
                },
            });
            break;
        } catch (err) {
            if (err.code !== 11000) throw err;
        }
    }

    if (!topup) {
        return res.status(500).json({ success: false, message: "Could not start the top-up. Please try again." });
    }

    res.status(201).json({
        success: true,
        data: {
            topupId: topup._id,
            topupRef: topup.topupRef,
            amountPaise,
            amountInr,
            currency: "INR",
            upiId: topup.upi.upiId,
            payeeName,
            deepLink: topup.upi.deepLink,
            qrPayload: topup.upi.deepLink,
            expiresAt: topup.expiresAt,
            instructions: upiSettings.upi.instructions || "",
        },
        message: "Scan the QR code to pay, then submit your UTR",
    });
});

/**
 * @desc    Submit the UTR for a UPI top-up
 * @route   POST /api/wallet/topups/:id/utr
 * @access  Private
 */
export const submitTopupUtr = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid top-up id" });
    }

    const utr = normalizeUtr(req.body.utrNumber);
    if (!utr) {
        return res.status(400).json({ success: false, message: "UTR must be exactly 12 digits" });
    }

    const topup = await WalletTopup.findOne({ _id: id, user: req.user.id });
    if (!topup) {
        return res.status(404).json({ success: false, message: "Top-up not found" });
    }

    if (topup.status !== "pending") {
        return res.status(400).json({
            success: false,
            message: `This top-up is already ${topup.status}`,
        });
    }

    if (topup.expiresAt && topup.expiresAt < new Date()) {
        return res.status(400).json({ success: false, message: "This top-up has expired. Please start a new one." });
    }

    // One UTR belongs to one payment. Check orders too, since both flows accept them.
    const usedOnOrder = await Order.exists({ "paymentInfo.utrNumber": utr });
    if (usedOnOrder) {
        return res.status(409).json({
            success: false,
            message: "This UTR has already been used for another payment",
        });
    }

    topup.upi.utrNumber = utr;
    topup.upi.utrSubmittedAt = new Date();
    topup.status = "paid";

    try {
        await topup.save();
    } catch (err) {
        // The unique index caught a UTR already claimed by another top-up.
        if (err.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "This UTR has already been used for another payment",
            });
        }
        throw err;
    }

    res.status(200).json({
        success: true,
        data: { topupId: topup._id, status: topup.status },
        message: "UTR submitted. Your wallet will be credited once it is verified.",
    });
});

/**
 * @desc    Check a single top-up (used for polling after payment)
 * @route   GET /api/wallet/topups/:id
 * @access  Private
 */
export const getTopup = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid top-up id" });
    }

    const topup = await WalletTopup.findOne({ _id: id, user: req.user.id })
        .select("-rawProviderPayload")
        .lean();

    if (!topup) {
        return res.status(404).json({ success: false, message: "Top-up not found" });
    }

    res.status(200).json({ success: true, data: topup });
});

/**
 * @desc    Top-ups awaiting review
 * @route   GET /api/wallet/admin/topups
 * @access  Admin
 */
export const listTopups = asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.method) filter.method = req.query.method;

    const [topups, total] = await Promise.all([
        WalletTopup.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("user", "name email")
            .populate("admin", "name email")
            .select("-rawProviderPayload")
            .lean(),
        WalletTopup.countDocuments(filter),
    ]);

    res.status(200).json({
        success: true,
        data: {
            topups,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        },
    });
});

/**
 * @desc    Approve a top-up and credit the wallet
 * @route   POST /api/wallet/admin/topups/:id/approve
 * @access  Admin
 */
export const approveTopup = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const adminNote = String(req.body.adminNote || "").trim();

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid top-up id" });
    }

    const topup = await WalletTopup.findById(id).populate("user", "name email");
    if (!topup) {
        return res.status(404).json({ success: false, message: "Top-up not found" });
    }

    // Approving twice is harmless — report the existing outcome.
    if (topup.status === "confirmed") {
        return res.status(200).json({
            success: true,
            data: { topup },
            message: "This top-up was already credited",
        });
    }

    if (!["pending", "paid"].includes(topup.status)) {
        return res.status(409).json({
            success: false,
            message: `Cannot approve a top-up that is ${topup.status}`,
        });
    }

    const settings = await getWalletSettings();

    try {
        // Re-check the cap here rather than trusting the check made at initiation:
        // this is the moment the money actually moves.
        await assertDailyCapAllows(topup.user._id, topup.amountPaise, settings);

        const { wallet, transaction } = await applyTransaction({
            userId: topup.user._id,
            type: "credit_topup",
            amountPaise: topup.amountPaise,
            topupId: topup._id,
            adminId: req.user.id,
            reason: adminNote || `UPI top-up approved (UTR ${topup.upi?.utrNumber || "n/a"})`,
            // One credit per top-up, no matter how many times this is called.
            idempotencyKey: `topup:${topup._id}`,
            fx: {
                originalCurrency: topup.originalCurrency,
                originalAmount: topup.originalAmount,
                fxRate: topup.fxRate,
            },
            withinTxn: async (session) => {
                // Guarded so two simultaneous approvals cannot both credit.
                const updated = await WalletTopup.updateOne(
                    { _id: topup._id, status: { $in: ["pending", "paid"] } },
                    {
                        $set: {
                            status: "confirmed",
                            creditedAt: new Date(),
                            admin: req.user.id,
                            adminNote: adminNote || null,
                            reviewedAt: new Date(),
                        },
                    },
                    { session }
                );

                if (updated.matchedCount === 0) {
                    throw new WalletError("ALREADY_PROCESSED", "This top-up was already processed", 409);
                }
            },
        });

        // Informational back-link, written after the commit. If it fails the ledger
        // row still points at the top-up, so nothing is lost.
        await WalletTopup.updateOne(
            { _id: topup._id },
            { $set: { creditTransaction: transaction._id } }
        );

        logAdminActivity(req, {
            action: "APPROVE",
            module: "wallet",
            targetId: topup._id,
            targetModel: "WalletTopup",
            description: `Approved ${formatPaise(topup.amountPaise)} top-up ${topup.topupRef} for ${topup.user.name}`,
            changes: { amountPaise: topup.amountPaise, utr: topup.upi?.utrNumber, adminNote },
        });

        return res.status(200).json({
            success: true,
            data: { balancePaise: wallet.balancePaise, transaction },
            message: "Top-up approved and wallet credited",
        });
    } catch (err) {
        return sendWalletError(res, err);
    }
});

/**
 * @desc    Reject a top-up
 * @route   POST /api/wallet/admin/topups/:id/reject
 * @access  Admin
 */
export const rejectTopup = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const adminNote = String(req.body.adminNote || "").trim();

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid top-up id" });
    }

    // Rejecting takes money away from a customer who believes they paid, so the
    // reason is mandatory and visible to them.
    if (!adminNote) {
        return res.status(400).json({ success: false, message: "A note is required when rejecting a top-up" });
    }

    const topup = await WalletTopup.findById(id).populate("user", "name email");
    if (!topup) {
        return res.status(404).json({ success: false, message: "Top-up not found" });
    }

    if (topup.status === "confirmed") {
        return res.status(409).json({
            success: false,
            message: "This top-up was already credited. Use a manual debit to reverse it.",
        });
    }

    if (topup.status === "rejected") {
        return res.status(200).json({ success: true, data: { topup }, message: "Already rejected" });
    }

    topup.status = "rejected";
    topup.admin = req.user.id;
    topup.adminNote = adminNote;
    topup.reviewedAt = new Date();
    await topup.save();

    logAdminActivity(req, {
        action: "REJECT",
        module: "wallet",
        targetId: topup._id,
        targetModel: "WalletTopup",
        description: `Rejected ${formatPaise(topup.amountPaise)} top-up ${topup.topupRef} for ${topup.user.name}: ${adminNote}`,
        changes: { amountPaise: topup.amountPaise, adminNote },
    });

    res.status(200).json({ success: true, data: { topup }, message: "Top-up rejected" });
});
