/**
 * Walks a UPI top-up from start to credited, and checks the guards along the way.
 *
 *   WALLET_CHECK_ALLOW=1 node scripts/walletTopupFlow.check.js
 *
 * Exercises the service layer directly rather than over HTTP, so it needs no running
 * server. Creates a throwaway user and removes it afterwards.
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/connectDB.js";
import User from "../models/user.model.js";
import Wallet from "../models/wallet.model.js";
import WalletTransaction from "../models/walletTransaction.model.js";
import WalletTopup from "../models/walletTopup.model.js";
import { applyTransaction, getOrCreateWallet, WalletError } from "../services/wallet.service.js";
import {
    assertAmountWithinLimits,
    assertDailyCapAllows,
    generateTopupRef,
    getTodaysTopupTotalPaise,
} from "../services/walletTopup.service.js";
import { runWalletAudit } from "../jobs/auditWalletBalances.js";
import { expireWalletTopups } from "../jobs/expireWalletTopups.js";
import { inrToPaise } from "../utils/money.js";
import { assertChecksAllowed } from "./checkGuard.js";

dotenv.config();
assertChecksAllowed();

const SETTINGS = {
    minTopupPaise: inrToPaise(100),
    maxTopupPaise: inrToPaise(50000),
    dailyTopupCapPaise: inrToPaise(50000),
    maxBalancePaise: inrToPaise(200000),
};

let failures = 0;

function check(label, ok, detail = "") {
    if (!ok) failures += 1;
    console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${detail ? `: ${detail}` : ""}`);
}

async function expectRejection(label, fn, code) {
    try {
        await fn();
        check(label, false, "was allowed");
    } catch (err) {
        check(label, err.code === code, err.code === code ? "" : `got ${err.code ?? err.message}`);
    }
}

async function run() {
    await connectDB();

    const user = await User.create({
        name: "Wallet Topup Flow Check",
        email: `wallet-topup-${Date.now()}@check.local`,
        password: "check-only-account",
    });

    try {
        const wallet = await getOrCreateWallet(user._id);

        console.log("\nAmount limits\n");

        await expectRejection("below the minimum is refused", async () =>
            assertAmountWithinLimits(inrToPaise(50), SETTINGS), "BELOW_MINIMUM");
        await expectRejection("above the maximum is refused", async () =>
            assertAmountWithinLimits(inrToPaise(60000), SETTINGS), "ABOVE_MAXIMUM");
        await expectRejection("fractional paise is refused", async () =>
            assertAmountWithinLimits(10.5, SETTINGS), "BAD_AMOUNT");

        assertAmountWithinLimits(inrToPaise(500), SETTINGS);
        check("a valid amount is accepted", true);

        console.log("\nUPI top-up, start to credited\n");

        const amountPaise = inrToPaise(500);
        const topup = await WalletTopup.create({
            topupRef: generateTopupRef(),
            user: user._id,
            wallet: wallet._id,
            method: "upi",
            amountPaise,
            originalCurrency: "INR",
            originalAmount: 500,
            fxRate: 1,
            status: "pending",
            expiresAt: new Date(Date.now() + 60 * 60 * 1000),
            upi: { upiId: "test@ybl", payeeName: "topupio", reference: "x", amountInr: 500 },
        });
        check("top-up created as pending", topup.status === "pending");

        topup.upi.utrNumber = String(Date.now()).slice(-12);
        topup.upi.utrSubmittedAt = new Date();
        topup.status = "paid";
        await topup.save();
        check("moves to paid once a UTR is submitted", topup.status === "paid");

        // Approving credits the wallet and flips the top-up in one transaction.
        const approve = () =>
            applyTransaction({
                userId: user._id,
                type: "credit_topup",
                amountPaise,
                topupId: topup._id,
                adminId: user._id,
                reason: "Approved in flow check",
                idempotencyKey: `topup:${topup._id}`,
                withinTxn: async (session) => {
                    const updated = await WalletTopup.updateOne(
                        { _id: topup._id, status: { $in: ["pending", "paid"] } },
                        { $set: { status: "confirmed", creditedAt: new Date(), admin: user._id } },
                        { session }
                    );
                    if (updated.matchedCount === 0) {
                        throw new WalletError("ALREADY_PROCESSED", "Already processed", 409);
                    }
                },
            });

        const first = await approve();
        check("approval credits the wallet", first.wallet.balancePaise === amountPaise, `${first.wallet.balancePaise} paise`);

        const confirmed = await WalletTopup.findById(topup._id).lean();
        check("top-up is marked confirmed", confirmed.status === "confirmed");

        // Approving again must not credit a second time.
        const second = await approve();
        check("a second approval is a no-op", second.duplicate === true);

        const after = await Wallet.findById(wallet._id).lean();
        check("balance unchanged by the repeat", after.balancePaise === amountPaise, `${after.balancePaise} paise`);
        check("one ledger row for this top-up", await WalletTransaction.countDocuments({ topup: topup._id }) === 1);

        console.log("\nDaily cap\n");

        const spentToday = await getTodaysTopupTotalPaise(user._id);
        check("today's total includes the credited top-up", spentToday === amountPaise, `${spentToday} paise`);

        await expectRejection(
            "a top-up beyond the daily cap is refused",
            () => assertDailyCapAllows(user._id, inrToPaise(49_800), SETTINGS),
            "DAILY_CAP_EXCEEDED"
        );

        await assertDailyCapAllows(user._id, inrToPaise(100), SETTINGS);
        check("a top-up within the cap is allowed", true);

        console.log("\nExpiry\n");

        const stale = await WalletTopup.create({
            topupRef: generateTopupRef(),
            user: user._id,
            wallet: wallet._id,
            method: "upi",
            amountPaise: inrToPaise(200),
            status: "pending",
            expiresAt: new Date(Date.now() - 60 * 1000),
        });
        const claimed = await WalletTopup.create({
            topupRef: generateTopupRef(),
            user: user._id,
            wallet: wallet._id,
            method: "upi",
            amountPaise: inrToPaise(200),
            status: "paid",
            expiresAt: new Date(Date.now() - 60 * 1000),
            upi: { utrNumber: String(Date.now() + 1).slice(-12) },
        });

        await expireWalletTopups();

        check("an abandoned pending top-up expires",
            (await WalletTopup.findById(stale._id).lean()).status === "expired");
        check("a paid top-up awaiting review is left alone",
            (await WalletTopup.findById(claimed._id).lean()).status === "paid");

        console.log("\nAudit\n");

        const audit = await runWalletAudit({ full: true });
        check("audit reports no mismatches", audit.mismatchCount === 0, `${audit.mismatchCount}`);
        check("wallet totals equal ledger totals",
            audit.globalWalletSumPaise === audit.globalLedgerSumPaise,
            `${audit.globalWalletSumPaise} vs ${audit.globalLedgerSumPaise}`);

        // Corrupt a balance behind the ledger's back; the audit must catch it.
        await Wallet.collection.updateOne({ _id: wallet._id }, { $inc: { balancePaise: 12345 } });
        const dirty = await runWalletAudit({ full: true });
        check("audit detects a tampered balance", dirty.mismatchCount >= 1, `${dirty.mismatchCount} found`);
        check("audit reports the difference",
            dirty.mismatches.some((m) => m.differencePaise === 12345));

        await Wallet.collection.updateOne({ _id: wallet._id }, { $inc: { balancePaise: -12345 } });
    } finally {
        const { default: WalletAudit } = await import("../models/walletAudit.model.js");
        await WalletTransaction.collection.deleteMany({ user: user._id });
        await WalletTopup.deleteMany({ user: user._id });
        await Wallet.deleteOne({ user: user._id });
        await User.deleteOne({ _id: user._id });
        // Remove the audit rows this run produced.
        await WalletAudit.deleteMany({ createdAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) } });
    }

    console.log(failures === 0 ? "\nAll checks passed.\n" : `\n${failures} check(s) FAILED.\n`);
    await mongoose.disconnect();
    process.exit(failures === 0 ? 0 : 1);
}

run().catch((err) => {
    console.error("Top-up flow check errored:", err);
    process.exit(1);
});
