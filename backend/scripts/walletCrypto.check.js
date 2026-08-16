/**
 * Crypto top-up webhook handling.
 *
 *   WALLET_CHECK_ALLOW=1 node scripts/walletCrypto.check.js
 *
 * This is the only path where money reaches a wallet with no human involved, so the
 * cases that matter are: a replayed webhook must not credit twice, an underpayment
 * must credit only what arrived, and the signature check must actually reject a
 * forged request.
 *
 * Drives the handler directly with a fake request and response rather than over HTTP,
 * so no server is needed. Creates a throwaway user and removes it afterwards.
 */
import dotenv from "dotenv";
import crypto from "node:crypto";
import mongoose from "mongoose";
import connectDB from "../config/connectDB.js";
import User from "../models/user.model.js";
import Wallet from "../models/wallet.model.js";
import WalletTransaction from "../models/walletTransaction.model.js";
import WalletTopup from "../models/walletTopup.model.js";
import { getOrCreateWallet } from "../services/wallet.service.js";
import { generateTopupRef } from "../services/walletTopup.service.js";
import { verifyWebhookSignature } from "../services/nowpayments.service.js";
import { handleWalletWebhook } from "../controllers/walletCrypto.controller.js";
import { inrToPaise } from "../utils/money.js";
import { assertChecksAllowed } from "./checkGuard.js";

dotenv.config();
assertChecksAllowed();

let failures = 0;

function check(label, ok, detail = "") {
    if (!ok) failures += 1;
    console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${detail ? `: ${detail}` : ""}`);
}

/** Sign a payload the way NOWPayments does: sorted keys, HMAC-SHA512. */
function sign(payload, secret) {
    const sorted = Object.keys(payload).sort().reduce((acc, key) => {
        acc[key] = payload[key];
        return acc;
    }, {});
    return crypto.createHmac("sha512", secret).update(JSON.stringify(sorted)).digest("hex");
}

/**
 * Minimal req/res pair so the controller can run outside Express.
 *
 * asyncHandler does not return its promise, so awaiting the call is not enough —
 * it resolves before the handler has finished. Wait for res.json() instead, which
 * every path calls exactly once when the work is genuinely done.
 */
function deliverWebhook(payload, secret) {
    const raw = Buffer.from(JSON.stringify(payload), "utf8");

    const req = {
        body: raw,
        headers: { "x-nowpayments-sig": sign(payload, secret) },
    };

    return new Promise((resolve, reject) => {
        let statusCode = 200;
        const res = {
            status(code) { statusCode = code; return this; },
            json(body) { resolve({ statusCode, body }); return this; },
        };

        handleWalletWebhook(req, res, (err) => (err ? reject(err) : resolve({ statusCode })));
    });
}

async function run() {
    await connectDB();

    const secret = process.env.NOWPAYMENTS_IPN_SECRET;
    if (!secret) {
        console.error("NOWPAYMENTS_IPN_SECRET is not set; cannot exercise the webhook.");
        process.exit(1);
    }

    const user = await User.create({
        name: "Wallet Crypto Check",
        email: `wallet-crypto-${Date.now()}@check.local`,
        password: "check-only-account",
    });

    try {
        const wallet = await getOrCreateWallet(user._id);

        console.log("\nSignature verification\n");

        const sample = { order_id: "X", payment_status: "finished" };
        const raw = Buffer.from(JSON.stringify(sample), "utf8");
        check("a correct signature is accepted", verifyWebhookSignature(raw, sign(sample, secret)));
        check("a forged signature is rejected", !verifyWebhookSignature(raw, "deadbeef"));
        check("a missing signature is rejected", !verifyWebhookSignature(raw, undefined));
        check("a wrong-length signature is rejected", !verifyWebhookSignature(raw, "ab"));

        console.log("\nFull payment credits once\n");

        const amountPaise = inrToPaise(1000);
        const topup = await WalletTopup.create({
            topupRef: generateTopupRef(),
            user: user._id,
            wallet: wallet._id,
            method: "usdt",
            amountPaise,
            originalCurrency: "USD",
            originalAmount: 10.42,
            fxRate: 96,
            status: "pending",
            crypto: { invoiceId: "INV-CHECK" },
        });

        const paymentId = Date.now();
        const finished = {
            order_id: topup.topupRef,
            payment_status: "finished",
            payment_id: paymentId,
            actually_paid: 10.42,
            pay_currency: "usdt",
        };

        await deliverWebhook(finished, secret);

        let state = await WalletTopup.findById(topup._id).lean();
        let balance = (await Wallet.findById(wallet._id).lean()).balancePaise;

        check("top-up confirmed", state.status === "confirmed");
        check("wallet credited", balance === amountPaise, `${balance} paise`);
        check("provider reference stored", state.providerRef === String(paymentId));
        check("ledger row linked", Boolean(state.creditTransaction));

        console.log("\nThe same webhook delivered four more times\n");

        for (let i = 0; i < 4; i += 1) await deliverWebhook(finished, secret);

        balance = (await Wallet.findById(wallet._id).lean()).balancePaise;
        check("balance unchanged", balance === amountPaise, `${balance} paise`);
        check("still one ledger row",
            await WalletTransaction.countDocuments({ topup: topup._id }) === 1);

        console.log("\nFive copies arriving at once\n");

        const raceTopup = await WalletTopup.create({
            topupRef: generateTopupRef(),
            user: user._id,
            wallet: wallet._id,
            method: "usdt",
            amountPaise: inrToPaise(500),
            originalCurrency: "USD",
            originalAmount: 5.21,
            fxRate: 96,
            status: "pending",
        });

        const racePayload = {
            order_id: raceTopup.topupRef,
            payment_status: "finished",
            payment_id: Date.now() + 1,
            actually_paid: 5.21,
            pay_currency: "usdt",
        };

        await Promise.all(Array.from({ length: 5 }, () => deliverWebhook(racePayload, secret)));

        balance = (await Wallet.findById(wallet._id).lean()).balancePaise;
        check("credited exactly once",
            balance === amountPaise + inrToPaise(500), `${balance} paise`);
        check("one ledger row",
            await WalletTransaction.countDocuments({ topup: raceTopup._id }) === 1);

        console.log("\nUnderpayment credits only what arrived\n");

        const partialTopup = await WalletTopup.create({
            topupRef: generateTopupRef(),
            user: user._id,
            wallet: wallet._id,
            method: "usdt",
            amountPaise: inrToPaise(1000),
            originalCurrency: "USD",
            originalAmount: 10.42,
            fxRate: 96,
            status: "pending",
        });

        const before = (await Wallet.findById(wallet._id).lean()).balancePaise;

        // Customer sent about half of what the invoice asked for.
        await deliverWebhook({
            order_id: partialTopup.topupRef,
            payment_status: "partially_paid",
            payment_id: Date.now() + 2,
            actually_paid: 5.0,
            pay_currency: "usdt",
        }, secret);

        const after = (await Wallet.findById(wallet._id).lean()).balancePaise;
        const credited = after - before;

        check("something was credited rather than silently dropped", credited > 0, `${credited} paise`);
        check("credited less than the full amount", credited < inrToPaise(1000), `${credited} paise`);

        const partialRow = await WalletTransaction.findOne({ topup: partialTopup._id }).lean();
        check("flagged as partial in the ledger", partialRow?.meta?.partial === true);

        console.log("\nStatuses that must not credit\n");

        for (const status of ["waiting", "confirming", "confirmed", "sending"]) {
            const pendingTopup = await WalletTopup.create({
                topupRef: generateTopupRef(),
                user: user._id,
                wallet: wallet._id,
                method: "usdt",
                amountPaise: inrToPaise(300),
                status: "pending",
            });

            const balanceBefore = (await Wallet.findById(wallet._id).lean()).balancePaise;
            await deliverWebhook({
                order_id: pendingTopup.topupRef,
                payment_status: status,
                payment_id: Date.now() + Math.floor(Math.random() * 1e6),
            }, secret);
            const balanceAfter = (await Wallet.findById(wallet._id).lean()).balancePaise;

            check(`"${status}" does not credit`, balanceBefore === balanceAfter);
        }

        console.log("\nUnknown reference is ignored safely\n");

        const result = await deliverWebhook({
            order_id: "WTU-does-not-exist",
            payment_status: "finished",
            payment_id: Date.now() + 3,
        }, secret);
        check("answers 200 so the provider stops retrying", result.statusCode === 200);
    } finally {
        await WalletTransaction.collection.deleteMany({ user: user._id });
        await WalletTopup.deleteMany({ user: user._id });
        await Wallet.deleteOne({ user: user._id });
        await User.deleteOne({ _id: user._id });
    }

    console.log(failures === 0 ? "\nAll checks passed.\n" : `\n${failures} check(s) FAILED.\n`);
    await mongoose.disconnect();
    process.exit(failures === 0 ? 0 : 1);
}

run().catch((err) => {
    console.error("Crypto check errored:", err);
    process.exit(1);
});
