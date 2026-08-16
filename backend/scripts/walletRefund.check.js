/**
 * Wallet payment and refund, including the exchange-rate round trip.
 *
 *   WALLET_CHECK_ALLOW=1 node scripts/walletRefund.check.js
 *
 * The important case: a customer pays for a USD-priced order from an INR wallet, an
 * admin then edits the exchange rate, and the order is refunded. The refund must
 * return exactly what was taken, not a recalculation at the new rate. Getting this
 * wrong shorts either the customer or the business every time a rate moves.
 *
 * Creates a throwaway user, game and orders, and removes them afterwards.
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/connectDB.js";
import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import Wallet from "../models/wallet.model.js";
import WalletTransaction from "../models/walletTransaction.model.js";
import ExchangeRate from "../models/exchangeRate.model.js";
import { applyTransaction, getOrCreateWallet, WalletError } from "../services/wallet.service.js";
import { getOrderDebitPaise, resolveRefundablePaise } from "../services/walletPricing.service.js";
import { inrToPaise, formatPaise } from "../utils/money.js";
import { assertChecksAllowed } from "./checkGuard.js";

dotenv.config();
assertChecksAllowed();

let failures = 0;

function check(label, ok, detail = "") {
    if (!ok) failures += 1;
    console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${detail ? `: ${detail}` : ""}`);
}

/** Temporarily force a USD->INR rate so the test is not at the mercy of live data. */
async function setInrRate(rate) {
    await ExchangeRate.updateOne(
        { targetCurrency: "INR" },
        { $set: { baseCurrency: "USD", targetCurrency: "INR", rate } },
        { upsert: true }
    );
}

const objectId = () => new mongoose.Types.ObjectId();

async function makeOrder(userId, { amount, currency, paymentMethod }) {
    return Order.create({
        orderId: `CHK-${Date.now()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
        user: userId,
        game: objectId(),
        product: objectId(),
        amount,
        quantity: 1,
        unitPrice: amount,
        currency,
        paymentMethod,
        paymentStatus: "pending",
        orderStatus: "pending",
    });
}

/** Mirrors the refund controller, including its limit checks. */
async function refund(order, adminId, amountPaise = null) {
    const resolved = await resolveRefundablePaise(order);
    if (resolved.error) throw new Error(resolved.error);

    const alreadyPaise = order.refund?.totalRefundedPaise || 0;
    const remainingPaise = resolved.originalPaise - alreadyPaise;

    if (remainingPaise <= 0) {
        throw new WalletError("ALREADY_REFUNDED", "This order is already fully refunded", 409);
    }

    const refundPaise = amountPaise ?? remainingPaise;

    if (refundPaise > remainingPaise) {
        throw new WalletError(
            "EXCEEDS_REFUNDABLE",
            `At most ${formatPaise(remainingPaise)} can still be refunded`,
            400
        );
    }

    const entryIndex = order.refund?.entries?.length || 0;
    const willBeFull = alreadyPaise + refundPaise >= resolved.originalPaise;

    return applyTransaction({
        userId: order.user,
        type: "credit_refund",
        amountPaise: refundPaise,
        orderId: order._id,
        adminId,
        reason: "Refund check",
        idempotencyKey: `refund:${order._id}:${entryIndex}`,
        fx: resolved.fx,
        withinTxn: async (session, ledgerRow) => {
            const updated = await Order.updateOne(
                { _id: order._id, "refund.entries": { $size: entryIndex } },
                {
                    $inc: { "refund.totalRefundedPaise": refundPaise },
                    $set: {
                        "refund.isFullyRefunded": willBeFull,
                        ...(willBeFull && { paymentStatus: "refunded", orderStatus: "refunded" }),
                    },
                    $push: {
                        "refund.entries": {
                            amountPaise: refundPaise,
                            destination: "wallet",
                            walletTransaction: ledgerRow._id,
                            reason: "Refund check",
                            admin: adminId,
                            at: new Date(),
                        },
                    },
                },
                { session }
            );
            if (updated.matchedCount === 0) {
                throw new WalletError("REFUND_CONFLICT", "Refund state moved", 409);
            }
        },
    });
}

async function run() {
    await connectDB();

    const originalRate = await ExchangeRate.findOne({ targetCurrency: "INR" }).lean();
    const user = await User.create({
        name: "Wallet Refund Check",
        email: `wallet-refund-${Date.now()}@check.local`,
        password: "check-only-account",
    });
    const createdOrders = [];

    try {
        await getOrCreateWallet(user._id);
        await setInrRate(96);

        // Fund the wallet generously so balance is never the limiting factor.
        await applyTransaction({
            userId: user._id,
            type: "credit_manual",
            amountPaise: inrToPaise(5000),
            adminId: user._id,
            reason: "Refund check setup",
        });

        console.log("\nPaying a USD order from an INR wallet (rate 96)\n");

        const usdOrder = await makeOrder(user._id, { amount: 9.99, currency: "USD", paymentMethod: "paypal" });
        createdOrders.push(usdOrder._id);

        const quote = await getOrderDebitPaise(usdOrder);
        check("debit is rounded up", quote.amountPaise === inrToPaise(959.04, "up"), `${quote.amountPaise} paise`);
        check("fx rate recorded", quote.fxRate === 96, String(quote.fxRate));

        const balanceBefore = (await Wallet.findOne({ user: user._id }).lean()).balancePaise;

        await applyTransaction({
            userId: user._id,
            type: "debit_order",
            amountPaise: quote.amountPaise,
            orderId: usdOrder._id,
            idempotencyKey: `order_pay:${usdOrder._id}`,
            fx: quote,
            withinTxn: async (session) => {
                await Order.updateOne(
                    { _id: usdOrder._id, paymentStatus: "pending" },
                    { $set: { paymentStatus: "paid", orderStatus: "paid", paymentMethod: "wallet" } },
                    { session }
                );
            },
        });

        const afterPay = (await Wallet.findOne({ user: user._id }).lean()).balancePaise;
        check("wallet debited by the quoted amount", balanceBefore - afterPay === quote.amountPaise);
        check("order marked paid",
            (await Order.findById(usdOrder._id).lean()).paymentStatus === "paid");

        console.log("\nRate changes to 92, then the order is refunded\n");

        await setInrRate(92);

        const paidOrder = await Order.findById(usdOrder._id);
        const resolved = await resolveRefundablePaise(paidOrder);
        check("refundable equals the original debit",
            resolved.originalPaise === quote.amountPaise,
            `${resolved.originalPaise} vs ${quote.amountPaise} paise`);

        // What a naive re-conversion would have produced, for contrast.
        const naive = inrToPaise(9.99 * 92, "up");
        check("and is NOT a recalculation at the new rate",
            resolved.originalPaise !== naive,
            `stored ${formatPaise(resolved.originalPaise)} vs recomputed ${formatPaise(naive)}`);

        const beforeRefund = (await Wallet.findOne({ user: user._id }).lean()).balancePaise;
        await refund(paidOrder, user._id);
        const afterRefund = (await Wallet.findOne({ user: user._id }).lean()).balancePaise;

        check("refund credits exactly what was debited",
            afterRefund - beforeRefund === quote.amountPaise,
            `${afterRefund - beforeRefund} paise`);
        check("customer is whole again", afterRefund === balanceBefore,
            `${afterRefund} vs ${balanceBefore} paise`);

        const refunded = await Order.findById(usdOrder._id).lean();
        check("order status is refunded", refunded.orderStatus === "refunded");
        check("refund recorded on the order", refunded.refund.entries.length === 1);
        check("marked fully refunded", refunded.refund.isFullyRefunded === true);

        console.log("\nRefunding twice\n");

        let blocked = false;
        try {
            await refund(await Order.findById(usdOrder._id), user._id);
        } catch {
            blocked = true;
        }
        const afterSecond = (await Wallet.findOne({ user: user._id }).lean()).balancePaise;
        check("a second refund is refused", blocked || afterSecond === afterRefund);
        check("balance unchanged", afterSecond === afterRefund, `${afterSecond} paise`);

        console.log("\nUPI order refunds the rupees actually charged\n");

        const upiOrder = await makeOrder(user._id, { amount: 12, currency: "USD", paymentMethod: "upi" });
        createdOrders.push(upiOrder._id);
        // The UPI flow stores the exact INR figure that was charged.
        upiOrder.paymentStatus = "paid";
        upiOrder.paymentInfo = {
            paymentGatewayResponse: { upi: { amount: 1150.5, currency: "INR" } },
        };
        await upiOrder.save();

        const upiResolved = await resolveRefundablePaise(upiOrder);
        check("uses the stored INR amount, not a conversion",
            upiResolved.originalPaise === inrToPaise(1150.5),
            `${upiResolved.originalPaise} paise`);
        check("no conversion flagged", upiResolved.converted === false);

        console.log("\nPartial refunds\n");

        const partialOrder = await makeOrder(user._id, { amount: 1000, currency: "INR", paymentMethod: "upi" });
        createdOrders.push(partialOrder._id);
        partialOrder.paymentStatus = "paid";
        partialOrder.paymentInfo = {
            paymentGatewayResponse: { upi: { amount: 1000, currency: "INR" } },
        };
        await partialOrder.save();

        await refund(await Order.findById(partialOrder._id), user._id, inrToPaise(400));
        let state = await Order.findById(partialOrder._id).lean();
        check("first partial recorded", state.refund.totalRefundedPaise === inrToPaise(400));
        check("not marked fully refunded", state.refund.isFullyRefunded === false);
        check("status left alone", state.orderStatus !== "refunded", state.orderStatus);

        await refund(await Order.findById(partialOrder._id), user._id, inrToPaise(600));
        state = await Order.findById(partialOrder._id).lean();
        check("second partial completes it", state.refund.totalRefundedPaise === inrToPaise(1000));
        check("now fully refunded", state.refund.isFullyRefunded === true);
        check("two entries kept", state.refund.entries.length === 2);

        let overRefundBlocked = false;
        try {
            await refund(await Order.findById(partialOrder._id), user._id, inrToPaise(1));
        } catch {
            overRefundBlocked = true;
        }
        check("refunding beyond the total is refused", overRefundBlocked);
    } finally {
        if (originalRate) await setInrRate(originalRate.rate);
        await WalletTransaction.collection.deleteMany({ user: user._id });
        await Order.deleteMany({ _id: { $in: createdOrders } });
        await Wallet.deleteOne({ user: user._id });
        await User.deleteOne({ _id: user._id });
    }

    console.log(failures === 0 ? "\nAll checks passed.\n" : `\n${failures} check(s) FAILED.\n`);
    await mongoose.disconnect();
    process.exit(failures === 0 ? 0 : 1);
}

run().catch((err) => {
    console.error("Refund check errored:", err);
    process.exit(1);
});
