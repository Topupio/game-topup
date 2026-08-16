import mongoose from "mongoose";
import WalletTopup from "../models/walletTopup.model.js";
import { WalletError } from "./wallet.service.js";
import { formatPaise } from "../utils/money.js";

/**
 * Top-up helpers shared by the customer and admin controllers.
 */

/** Generate a top-up reference, matching the ORD-xxxxxx-XXX style used by orders. */
export function generateTopupRef() {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `WTU-${timestamp}-${random}`;
}

/**
 * Start and end of today in IST.
 *
 * The cap resets at midnight India time, not UTC — an INR wallet resetting at 5:30am
 * local would confuse every customer who noticed.
 */
export function istDayBounds(now = new Date()) {
    const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(now.getTime() + IST_OFFSET_MS);

    const istMidnight = Date.UTC(
        istNow.getUTCFullYear(),
        istNow.getUTCMonth(),
        istNow.getUTCDate()
    );

    return {
        start: new Date(istMidnight - IST_OFFSET_MS),
        end: new Date(istMidnight - IST_OFFSET_MS + 24 * 60 * 60 * 1000),
    };
}

/** Total credited to this user's wallet today, in paise. */
export async function getTodaysTopupTotalPaise(userId) {
    const { start, end } = istDayBounds();

    const [result] = await WalletTopup.aggregate([
        {
            $match: {
                user: new mongoose.Types.ObjectId(String(userId)),
                status: "confirmed",
                creditedAt: { $gte: start, $lt: end },
            },
        },
        { $group: { _id: null, total: { $sum: "$amountPaise" } } },
    ]);

    return result?.total || 0;
}

/**
 * Throw unless another top-up of this size stays within the daily cap.
 *
 * Called both when a top-up starts and again when it is credited. The first check is
 * advisory — two requests can pass it at once — so the one that matters is the second,
 * immediately before the money moves.
 */
export async function assertDailyCapAllows(userId, amountPaise, settings) {
    const capPaise = settings?.dailyTopupCapPaise;
    if (!capPaise) return;

    const alreadyPaise = await getTodaysTopupTotalPaise(userId);

    if (alreadyPaise + amountPaise > capPaise) {
        const remainingPaise = Math.max(0, capPaise - alreadyPaise);
        throw new WalletError(
            "DAILY_CAP_EXCEEDED",
            `Daily top-up limit reached. You can add up to ${formatPaise(remainingPaise)} more today.`,
            422
        );
    }
}

/** Validate a requested top-up amount against the configured limits. */
export function assertAmountWithinLimits(amountPaise, settings) {
    if (!Number.isInteger(amountPaise) || amountPaise <= 0) {
        throw new WalletError("BAD_AMOUNT", "Enter a valid amount", 400);
    }

    if (amountPaise < settings.minTopupPaise) {
        throw new WalletError(
            "BELOW_MINIMUM",
            `The minimum top-up is ${formatPaise(settings.minTopupPaise)}`,
            422
        );
    }

    if (amountPaise > settings.maxTopupPaise) {
        throw new WalletError(
            "ABOVE_MAXIMUM",
            `The maximum top-up is ${formatPaise(settings.maxTopupPaise)}`,
            422
        );
    }
}
