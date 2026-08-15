/**
 * Proves the ledger's rules hold: rows cannot be altered, admin rows need a reason,
 * and a frozen wallet cannot be spent from.
 *
 *   node scripts/walletLedger.check.js
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
import { inrToPaise } from "../utils/money.js";
import { assertChecksAllowed } from "./checkGuard.js";

dotenv.config();
assertChecksAllowed();

let failures = 0;

function check(label, ok, detail = "") {
    if (!ok) failures += 1;
    console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${detail ? `: ${detail}` : ""}`);
}

/** Assert that an operation is rejected, optionally with a specific error code. */
async function expectRejection(label, fn, code = null) {
    try {
        await fn();
        check(label, false, "was allowed");
    } catch (err) {
        const matches = !code || err.code === code;
        check(label, matches, matches ? "" : `wrong error: ${err.code ?? err.message}`);
    }
}

async function run() {
    await connectDB();

    const user = await User.create({
        name: "Wallet Ledger Check",
        email: `wallet-ledger-${Date.now()}@check.local`,
        password: "check-only-account",
    });

    try {
        await getOrCreateWallet(user._id);

        const { transaction } = await applyTransaction({
            userId: user._id,
            type: "credit_manual",
            amountPaise: inrToPaise(500),
            adminId: user._id,
            reason: "Ledger check setup",
        });

        console.log("\nAppend-only enforcement\n");

        await expectRejection("updateOne is refused", () =>
            WalletTransaction.updateOne({ _id: transaction._id }, { $set: { amountPaise: 1 } })
        );
        await expectRejection("findOneAndUpdate is refused", () =>
            WalletTransaction.findOneAndUpdate({ _id: transaction._id }, { $set: { amountPaise: 1 } })
        );
        await expectRejection("deleteOne is refused", () =>
            WalletTransaction.deleteOne({ _id: transaction._id })
        );
        await expectRejection("re-saving an existing row is refused", async () => {
            const row = await WalletTransaction.findById(transaction._id);
            row.reason = "tampered";
            await row.save();
        });

        const untouched = await WalletTransaction.findById(transaction._id).lean();
        check("original row is unchanged", untouched.amountPaise === inrToPaise(500) && untouched.reason === "Ledger check setup");

        console.log("\nAdmin actions require a reason\n");

        await expectRejection(
            "admin credit without a reason is refused",
            () => applyTransaction({
                userId: user._id,
                type: "credit_manual",
                amountPaise: 1000,
                adminId: user._id,
            }),
            "REASON_REQUIRED"
        );

        await expectRejection(
            "a blank reason is refused",
            () => applyTransaction({
                userId: user._id,
                type: "debit_manual",
                amountPaise: 1000,
                adminId: user._id,
                reason: "   ",
            }),
            "REASON_REQUIRED"
        );

        console.log("\nInput validation\n");

        await expectRejection(
            "fractional paise is refused",
            () => applyTransaction({ userId: user._id, type: "credit_promo", amountPaise: 10.5 }),
            "BAD_AMOUNT"
        );
        await expectRejection(
            "a zero amount is refused",
            () => applyTransaction({ userId: user._id, type: "credit_promo", amountPaise: 0 }),
            "BAD_AMOUNT"
        );
        await expectRejection(
            "a negative amount is refused",
            () => applyTransaction({ userId: user._id, type: "credit_promo", amountPaise: -500 }),
            "BAD_AMOUNT"
        );
        await expectRejection(
            "an unknown transaction type is refused",
            () => applyTransaction({ userId: user._id, type: "credit_mystery", amountPaise: 500 }),
            "BAD_TYPE"
        );

        console.log("\nFrozen wallets\n");

        await Wallet.updateOne({ user: user._id }, { $set: { status: "frozen" } });

        await expectRejection(
            "spending from a frozen wallet is refused",
            () => applyTransaction({ userId: user._id, type: "debit_order", amountPaise: 100 }),
            "WALLET_FROZEN"
        );
        await expectRejection(
            "crediting a frozen wallet is refused",
            () => applyTransaction({ userId: user._id, type: "credit_promo", amountPaise: 100 }),
            "WALLET_FROZEN"
        );

        await Wallet.updateOne({ user: user._id }, { $set: { status: "active" } });

        const wallet = await Wallet.findOne({ user: user._id }).lean();
        check("balance survived every rejected attempt", wallet.balancePaise === inrToPaise(500), `${wallet.balancePaise} paise`);
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
    console.error("Ledger check errored:", err);
    process.exit(1);
});
