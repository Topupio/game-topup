/**
 * Proves a repeated credit cannot be applied twice.
 *
 *   node scripts/walletIdempotency.check.js
 *
 * Payment providers resend webhooks when they do not get a clean response, so the
 * same "payment finished" event can arrive several times. Each replay must be a
 * no-op, or a customer is credited two or three times for one payment.
 *
 * Covers both the sequential replay and the harder case of identical events arriving
 * simultaneously, where the unique index rather than the lookup is what saves us.
 *
 * Creates a throwaway user and deletes it afterwards.
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/connectDB.js";
import User from "../models/user.model.js";
import Wallet from "../models/wallet.model.js";
import WalletTransaction from "../models/walletTransaction.model.js";
import { applyTransaction, getOrCreateWallet } from "../services/wallet.service.js";
import { assertChecksAllowed } from "./checkGuard.js";

dotenv.config();
assertChecksAllowed();

const CREDIT_PAISE = 50_000; // ₹500
const REPLAYS = 5;

let failures = 0;

function check(label, actual, expected) {
    const ok = actual === expected;
    if (!ok) failures += 1;
    console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}: ${actual}${ok ? "" : ` (expected ${expected})`}`);
}

async function run() {
    await connectDB();

    const user = await User.create({
        name: "Wallet Idempotency Check",
        email: `wallet-idempotency-${Date.now()}@check.local`,
        password: "check-only-account",
    });

    try {
        await getOrCreateWallet(user._id);

        // --- Sequential replay, as a provider retrying after a timeout ---
        const key = `nowpayments:${Date.now()}`;
        console.log(`\nDelivering the same credit ${REPLAYS} times, key "${key}"...\n`);

        const sequential = [];
        for (let i = 0; i < REPLAYS; i += 1) {
            sequential.push(
                await applyTransaction({
                    userId: user._id,
                    type: "credit_topup",
                    amountPaise: CREDIT_PAISE,
                    idempotencyKey: key,
                })
            );
        }

        check("first delivery credited", sequential[0].duplicate, false);
        check("replays treated as duplicates", sequential.slice(1).every((r) => r.duplicate), true);
        check(
            "every replay returns the same ledger row",
            new Set(sequential.map((r) => String(r.transaction._id))).size,
            1
        );

        let wallet = await Wallet.findOne({ user: user._id }).lean();
        check("balance credited once (paise)", wallet.balancePaise, CREDIT_PAISE);
        check("ledger rows for this key", await WalletTransaction.countDocuments({ idempotencyKey: key }), 1);

        // --- Simultaneous delivery, where the fast-path lookup cannot help ---
        const raceKey = `nowpayments:race:${Date.now()}`;
        console.log(`\nDelivering ${REPLAYS} copies simultaneously, key "${raceKey}"...\n`);

        const concurrent = await Promise.all(
            Array.from({ length: REPLAYS }, () =>
                applyTransaction({
                    userId: user._id,
                    type: "credit_topup",
                    amountPaise: CREDIT_PAISE,
                    idempotencyKey: raceKey,
                })
            )
        );

        check("exactly one was applied", concurrent.filter((r) => !r.duplicate).length, 1);
        check("the rest were duplicates", concurrent.filter((r) => r.duplicate).length, REPLAYS - 1);
        check("ledger rows for this key", await WalletTransaction.countDocuments({ idempotencyKey: raceKey }), 1);

        wallet = await Wallet.findOne({ user: user._id }).lean();
        check("balance after both rounds (paise)", wallet.balancePaise, CREDIT_PAISE * 2);

        // --- Credits without a key must not collide with each other ---
        console.log("\nTwo credits with no idempotency key...\n");
        await applyTransaction({ userId: user._id, type: "credit_promo", amountPaise: 100 });
        await applyTransaction({ userId: user._id, type: "credit_promo", amountPaise: 100 });

        wallet = await Wallet.findOne({ user: user._id }).lean();
        check("both keyless credits applied (paise)", wallet.balancePaise, CREDIT_PAISE * 2 + 200);

        const rows = await WalletTransaction.find({ user: user._id }).sort({ seq: 1 }).lean();
        const ledgerSum = rows.reduce((total, r) => total + r.deltaPaise, 0);
        check("ledger sum matches balance", ledgerSum, wallet.balancePaise);
    } finally {
        await WalletTransaction.collection.deleteMany({ user: user._id });
        await Wallet.deleteOne({ user: user._id });
        await User.deleteOne({ _id: user._id });
    }

    console.log(failures === 0 ? "\nAll checks passed.\n" : `\n${failures} check(s) FAILED.\n`);
    await mongoose.disconnect();
    process.exit(failures === 0 ? 0 : 1);
}

run().catch((err) => {
    console.error("Idempotency check errored:", err);
    process.exit(1);
});
