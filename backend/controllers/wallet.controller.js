import { asyncHandler } from "../middlewares/asyncHandler.js";
import Wallet from "../models/wallet.model.js";
import WalletTransaction from "../models/walletTransaction.model.js";
import WalletTopup from "../models/walletTopup.model.js";
import { getWalletSettings } from "../models/walletSettings.model.js";
import { getOrCreateWallet } from "../services/wallet.service.js";
import { paiseToInr } from "../utils/money.js";
import { convertAmount, getExchangeRates } from "../utils/currencyConverter.js";

/**
 * Shape a wallet balance for the client.
 *
 * balancePaise is the real figure. The display values are a convenience for showing
 * the balance in the user's chosen currency and are explicitly marked approximate —
 * rates are admin-managed, so a converted figure can move without any transaction.
 */
async function buildBalanceResponse(wallet, displayCurrency) {
    const balanceInr = paiseToInr(wallet.balancePaise);
    const code = String(displayCurrency || "INR").toUpperCase();

    if (code === "INR") {
        return { balancePaise: wallet.balancePaise, balanceInr, display: null };
    }

    try {
        const rates = await getExchangeRates();
        return {
            balancePaise: wallet.balancePaise,
            balanceInr,
            display: {
                amount: convertAmount(balanceInr, "INR", code, rates),
                currency: code,
                approximate: true,
            },
        };
    } catch {
        // An unconfigured display currency should not hide someone's balance.
        return { balancePaise: wallet.balancePaise, balanceInr, display: null };
    }
}

/**
 * @desc    Get the signed-in user's wallet balance
 * @route   GET /api/wallet/me
 * @access  Private
 */
export const getMyWallet = asyncHandler(async (req, res) => {
    const wallet = await getOrCreateWallet(req.user.id);
    const balance = await buildBalanceResponse(wallet, req.query.currency);

    res.status(200).json({
        success: true,
        data: {
            ...balance,
            currency: "INR",
            status: wallet.status,
            updatedAt: wallet.updatedAt,
        },
    });
});

/**
 * @desc    Get the signed-in user's wallet ledger
 * @route   GET /api/wallet/me/transactions
 * @access  Private
 */
export const getMyTransactions = asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = { user: req.user.id };
    if (req.query.type) filter.type = req.query.type;

    const [transactions, total] = await Promise.all([
        WalletTransaction.find(filter)
            .sort({ createdAt: -1, _id: -1 })
            .skip(skip)
            .limit(limit)
            .populate("order", "orderId")
            .populate("topup", "topupRef method")
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
 * @desc    Get the signed-in user's top-up history
 * @route   GET /api/wallet/me/topups
 * @access  Private
 */
export const getMyTopups = asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = { user: req.user.id };
    if (req.query.status) filter.status = req.query.status;

    const [topups, total] = await Promise.all([
        WalletTopup.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
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
 * @desc    Limits and available methods, for the Add Money screen
 * @route   GET /api/wallet/settings/public
 * @access  Public
 */
export const getPublicWalletSettings = asyncHandler(async (req, res) => {
    const settings = await getWalletSettings();

    res.status(200).json({
        success: true,
        data: {
            enabled: settings.enabled,
            minTopupPaise: settings.minTopupPaise,
            maxTopupPaise: settings.maxTopupPaise,
            dailyTopupCapPaise: settings.dailyTopupCapPaise,
            maxBalancePaise: settings.maxBalancePaise,
            upiTopupEnabled: settings.upiTopupEnabled,
            usdtTopupEnabled: settings.usdtTopupEnabled,
            walletPaymentEnabled: settings.walletPaymentEnabled,
        },
    });
});
