import mongoose from "mongoose";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import Wallet from "../models/wallet.model.js";
import WalletTransaction from "../models/walletTransaction.model.js";
import WalletTopup from "../models/walletTopup.model.js";
import { getWalletSettings } from "../models/walletSettings.model.js";
import WalletAudit from "../models/walletAudit.model.js";
import User from "../models/user.model.js";
import { runWalletAudit } from "../jobs/auditWalletBalances.js";
import { applyTransaction, getOrCreateWallet, WalletError } from "../services/wallet.service.js";
import { assertDailyCapAllows } from "../services/walletTopup.service.js";
import { formatPaise } from "../utils/money.js";
import { logAdminActivity } from "../utils/adminLogger.js";

/** Reject anything that is not a positive whole number of paise. */
function parseAmountPaise(value) {
    const amountPaise = Number(value);
    if (!Number.isInteger(amountPaise) || amountPaise <= 0) return null;
    return amountPaise;
}

/**
 * @desc    List wallets with their owners
 * @route   GET /api/wallet/admin/wallets
 * @access  Admin
 */
export const listWallets = asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = {};

    // Search matches the user, so resolve names and emails to ids first.
    if (req.query.search && req.query.search.length <= 100) {
        const term = String(req.query.search).trim();
        const users = await User.find({
            $or: [
                { name: { $regex: term, $options: "i" } },
                { email: { $regex: term, $options: "i" } },
            ],
        }).select("_id").lean();
        filter.user = { $in: users.map((u) => u._id) };
    }

    if (req.query.minBalancePaise) {
        const min = Number(req.query.minBalancePaise);
        if (Number.isFinite(min)) filter.balancePaise = { $gte: min };
    }

    const [wallets, total] = await Promise.all([
        Wallet.find(filter)
            .sort({ balancePaise: -1 })
            .skip(skip)
            .limit(limit)
            .populate("user", "name email status")
            .lean(),
        Wallet.countDocuments(filter),
    ]);

    res.status(200).json({
        success: true,
        data: {
            wallets,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        },
    });
});

/**
 * @desc    One user's wallet with recent activity
 * @route   GET /api/wallet/admin/wallets/:userId
 * @access  Admin
 */
export const getUserWallet = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ success: false, message: "Invalid user id" });
    }

    const user = await User.findById(userId).select("name email status createdAt").lean();
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

    const wallet = await getOrCreateWallet(userId);
    const transactions = await WalletTransaction.find({ user: userId })
        .sort({ createdAt: -1, _id: -1 })
        .limit(20)
        .populate("order", "orderId")
        .populate("admin", "name email")
        .lean();

    res.status(200).json({ success: true, data: { user, wallet, transactions } });
});

/**
 * @desc    One user's full ledger
 * @route   GET /api/wallet/admin/wallets/:userId/transactions
 * @access  Admin
 */
export const getUserTransactions = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ success: false, message: "Invalid user id" });
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
        WalletTransaction.find({ user: userId })
            .sort({ createdAt: -1, _id: -1 })
            .skip(skip)
            .limit(limit)
            .populate("order", "orderId")
            .populate("admin", "name email")
            .lean(),
        WalletTransaction.countDocuments({ user: userId }),
    ]);

    res.status(200).json({
        success: true,
        data: {
            transactions,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        },
    });
});

/**
 * Credit or debit a wallet by hand. A reason is mandatory — the ledger row is the
 * only lasting record of why this money moved, since the admin log expires.
 */
async function adjustWallet(req, res, type) {
    const { userId } = req.params;
    const { amountPaise: rawAmount, reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ success: false, message: "Invalid user id" });
    }

    const amountPaise = parseAmountPaise(rawAmount);
    if (!amountPaise) {
        return res.status(400).json({
            success: false,
            message: "amountPaise must be a positive whole number of paise",
        });
    }

    if (!reason || !String(reason).trim()) {
        return res.status(400).json({ success: false, message: "A reason is required" });
    }

    const user = await User.findById(userId).select("_id name").lean();
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

    const settings = await getWalletSettings();
    if (type === "credit_manual") {
        const wallet = await getOrCreateWallet(userId);
        if (wallet.balancePaise + amountPaise > settings.maxBalancePaise) {
            return res.status(422).json({
                success: false,
                code: "MAX_BALANCE_EXCEEDED",
                message: `This would take the balance over the ${formatPaise(settings.maxBalancePaise)} limit`,
            });
        }
    }

    try {
        const { wallet, transaction } = await applyTransaction({
            userId,
            type,
            amountPaise,
            adminId: req.user.id,
            reason: String(reason).trim(),
        });

        logAdminActivity(req, {
            action: type === "credit_manual" ? "CREDIT" : "DEBIT",
            module: "wallet",
            targetId: transaction._id,
            targetModel: "WalletTransaction",
            description: `${type === "credit_manual" ? "Credited" : "Debited"} ${formatPaise(amountPaise)} ${type === "credit_manual" ? "to" : "from"} ${user.name}'s wallet: ${String(reason).trim()}`,
            changes: { userId, amountPaise, reason: String(reason).trim() },
        });

        return res.status(200).json({
            success: true,
            data: { balancePaise: wallet.balancePaise, transaction },
            message: "Wallet updated",
        });
    } catch (err) {
        if (err instanceof WalletError) {
            return res.status(err.status).json({
                success: false,
                code: err.code,
                message: err.message,
            });
        }
        throw err;
    }
}

export const creditWallet = asyncHandler((req, res) => adjustWallet(req, res, "credit_manual"));
export const debitWallet = asyncHandler((req, res) => adjustWallet(req, res, "debit_manual"));

/**
 * @desc    Freeze or unfreeze a wallet
 * @route   PATCH /api/wallet/admin/wallets/:userId/status
 * @access  Admin
 */
export const setWalletStatus = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { status, reason } = req.body;

    if (!["active", "frozen"].includes(status)) {
        return res.status(400).json({ success: false, message: "Status must be active or frozen" });
    }

    if (status === "frozen" && !String(reason || "").trim()) {
        return res.status(400).json({ success: false, message: "A reason is required to freeze a wallet" });
    }

    const wallet = await getOrCreateWallet(userId);

    wallet.status = status;
    wallet.frozenReason = status === "frozen" ? String(reason).trim() : null;
    wallet.frozenAt = status === "frozen" ? new Date() : null;
    wallet.frozenBy = status === "frozen" ? req.user.id : null;
    await wallet.save();

    logAdminActivity(req, {
        action: status === "frozen" ? "FREEZE" : "UNFREEZE",
        module: "wallet",
        targetId: wallet._id,
        targetModel: "Wallet",
        description: `${status === "frozen" ? "Froze" : "Unfroze"} wallet for user ${userId}`,
        changes: { status, reason: wallet.frozenReason },
    });

    res.status(200).json({ success: true, data: wallet, message: `Wallet ${status}` });
});

/**
 * @desc    Every ledger row, filterable
 * @route   GET /api/wallet/admin/transactions
 * @access  Admin
 */
export const listTransactions = asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.userId && mongoose.Types.ObjectId.isValid(req.query.userId)) {
        filter.user = req.query.userId;
    }
    // Admin-initiated rows only: every one of these has an admin and a reason.
    if (req.query.adminOnly === "true") filter.admin = { $ne: null };

    if (req.query.from || req.query.to) {
        filter.createdAt = {};
        if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
        if (req.query.to) filter.createdAt.$lte = new Date(req.query.to);
    }

    const [transactions, total] = await Promise.all([
        WalletTransaction.find(filter)
            .sort({ createdAt: -1, _id: -1 })
            .skip(skip)
            .limit(limit)
            .populate("user", "name email")
            .populate("order", "orderId")
            .populate("admin", "name email")
            .lean(),
        WalletTransaction.countDocuments(filter),
    ]);

    res.status(200).json({
        success: true,
        data: {
            transactions,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        },
    });
});

/**
 * @desc    Totals for the admin wallet dashboard
 * @route   GET /api/wallet/admin/stats
 * @access  Admin
 */
export const getWalletStats = asyncHandler(async (req, res) => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [liability, walletCount, pendingTopups, topupsToday] = await Promise.all([
        Wallet.aggregate([{ $group: { _id: null, total: { $sum: "$balancePaise" } } }]),
        Wallet.countDocuments(),
        WalletTopup.countDocuments({ status: { $in: ["pending", "paid"] } }),
        WalletTopup.countDocuments({ status: "confirmed", creditedAt: { $gte: startOfToday } }),
    ]);

    res.status(200).json({
        success: true,
        data: {
            // What the platform owes customers in store credit.
            totalLiabilityPaise: liability[0]?.total || 0,
            walletCount,
            pendingTopups,
            topupsToday,
        },
    });
});

/**
 * @desc    Most recent reconciliation run
 * @route   GET /api/wallet/admin/audit/latest
 * @access  Admin
 */
export const getLatestAudit = asyncHandler(async (req, res) => {
    const audit = await WalletAudit.findOne().sort({ createdAt: -1 }).lean();

    // An audit that silently stopped running is worse than one reporting problems,
    // so treat a stale result as something the admin needs to see.
    const isStale =
        !audit || Date.now() - new Date(audit.createdAt).getTime() > 36 * 60 * 60 * 1000;

    res.status(200).json({ success: true, data: { audit, isStale } });
});

/**
 * @desc    Run the reconciliation now
 * @route   POST /api/wallet/admin/audit/run
 * @access  Admin
 */
export const runAuditNow = asyncHandler(async (req, res) => {
    const result = await runWalletAudit({ full: req.body.full === true });

    logAdminActivity(req, {
        action: "AUDIT",
        module: "wallet",
        description: `Ran wallet audit: ${result.mismatchCount} mismatch(es) across ${result.walletsChecked} wallet(s)`,
        changes: { mismatchCount: result.mismatchCount },
    });

    res.status(200).json({ success: true, data: result });
});

/**
 * @desc    Read wallet settings
 * @route   GET /api/wallet/admin/settings
 * @access  Admin
 */
export const getSettings = asyncHandler(async (req, res) => {
    const settings = await getWalletSettings();
    res.status(200).json({ success: true, data: settings });
});

/**
 * @desc    Update wallet settings
 * @route   PUT /api/wallet/admin/settings
 * @access  Admin
 */
export const updateSettings = asyncHandler(async (req, res) => {
    const settings = await getWalletSettings();

    const numericFields = [
        "minTopupPaise",
        "maxTopupPaise",
        "dailyTopupCapPaise",
        "maxBalancePaise",
        "topupExpiryMinutes",
    ];
    const booleanFields = [
        "enabled",
        "upiTopupEnabled",
        "usdtTopupEnabled",
        "walletPaymentEnabled",
    ];

    for (const field of numericFields) {
        if (req.body[field] === undefined) continue;
        const value = Number(req.body[field]);
        if (!Number.isInteger(value) || value < 0) {
            return res.status(400).json({
                success: false,
                message: `${field} must be a whole number of paise, zero or greater`,
            });
        }
        settings[field] = value;
    }

    for (const field of booleanFields) {
        if (req.body[field] !== undefined) settings[field] = Boolean(req.body[field]);
    }

    if (settings.minTopupPaise > settings.maxTopupPaise) {
        return res.status(400).json({
            success: false,
            message: "The minimum top-up cannot be more than the maximum",
        });
    }

    settings.updatedBy = req.user.id;
    await settings.save();

    logAdminActivity(req, {
        action: "UPDATE",
        module: "wallet",
        targetId: settings._id,
        targetModel: "WalletSettings",
        description: "Updated wallet settings",
        changes: req.body,
    });

    res.status(200).json({ success: true, data: settings, message: "Wallet settings updated" });
});
