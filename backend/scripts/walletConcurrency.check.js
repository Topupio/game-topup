/**
 * Proves a wallet cannot be overdrawn by simultaneous requests.
 *
 *   node scripts/walletConcurrency.check.js
 *
 * Fires many debits at once against a balance that can only cover some of them. The
 * conditional update in wallet.service.js should let exactly the affordable number
 * succeed, leave the balance at zero, and never go negative.
 *
 * Node being single-threaded does not make this safe on its own: every await hands
 * control back to the event loop, so concurrent requests interleave freely.
 *
 * Creates a throwaway user and deletes it afterwards.
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/connectDB.js";
import User from "../models/user.model.js";
import Wallet from "../models/wallet.model.js";
import WalletTransaction from "../models/walletTransaction.model.js";
import { applyTransaction, getOrCreateWallet, WalletError } from "../services/wallet.service.js";
import { assertChecksAllowed } from "./checkGuard.js";

dotenv.config();
assertChecksAllowed();

const STARTING_PAISE = 15_000;   // ₹150
const DEBIT_PAISE = 10_000;      // ₹100 — only one can succeed
const ATTEMPTS = 20;

let failures = 0;

function check(label, actual, expected) {
    const ok = actual === expected;
    if (!ok) failures += 1;
    console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}: ${actual}${ok ? "" : ` (expected ${expected})`}`);
}

async function run() {
    await connectDB();

    const user = await User.create({
        name: "Wallet Concurrency Check",
        email: `wallet-concurrency-${Date.now()}@check.local`,
        password: "check-only-account",
    });

    try {
        await getOrCreateWallet(user._id);
        await applyTransaction({
            userId: user._id,
            type: "credit_manual",
            amountPaise: STARTING_PAISE,
            adminId: user._id,
            reason: "Concurrency check setup",
        });

        console.log(`\nBalance ₹${STARTING_PAISE / 100}, firing ${ATTEMPTS} concurrent debits of ₹${DEBIT_PAISE / 100}...\n`);

        const results = await Promise.allSettled(
            Array.from({ length: ATTEMPTS }, () =>
                applyTransaction({
                    userId: user._id,
                    type: "debit_manual",
                    amountPaise: DEBIT_PAISE,
                    adminId: user._id,
                    reason: "Concurrency check",
                })
            )
        );

        const succeeded = results.filter((r) => r.status === "fulfilled").length;
        const insufficient = results.filter(
            (r) => r.status === "rejected" && r.reason instanceof WalletError
                && r.reason.code === "INSUFFICIENT_FUNDS"
        ).length;
        const unexpected = results.filter(
            (r) => r.status === "rejected"
                && !(r.reason instanceof WalletError && r.reason.code === "INSUFFICIENT_FUNDS")
        );

        const affordable = Math.floor(STARTING_PAISE / DEBIT_PAISE);

        check("debits succeeded", succeeded, affordable);
        check("rejected for insufficient funds", insufficient, ATTEMPTS - affordable);
        check("unexpected errors", unexpected.length, 0);
        for (const u of unexpected) console.log("        ", u.reason?.message);

        const wallet = await Wallet.findOne({ user: user._id }).lean();
        check("final balance (paise)", wallet.balancePaise, STARTING_PAISE - affordable * DEBIT_PAISE);
        check("balance is not negative", wallet.balancePaise >= 0, true);

        // The ledger must agree with the balance, and its sequence must have no gaps
        // or repeats — that is what proves no two writes claimed the same position.
        const rows = await WalletTransaction.find({ user: user._id }).sort({ seq: 1 }).lean();
        const ledgerSum = rows.reduce((total, r) => total + r.deltaPaise, 0);
        const seqs = rows.map((r) => r.seq);

        check("ledger sum matches balance", ledgerSum, wallet.balancePaise);
        check("ledger rows", rows.length, affordable + 1);
        check("sequence has no duplicates", new Set(seqs).size, seqs.length);
        check("sequence is contiguous", seqs.join(","), seqs.map((_, i) => i + 1).join(","));
        check("balanceAfter on final row", rows.at(-1).balanceAfterPaise, wallet.balancePaise);
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
    console.error("Concurrency check errored:", err);
    process.exit(1);
});
