import WalletTransaction from "../models/walletTransaction.model.js";
import { convertAmount, getExchangeRates } from "../utils/currencyConverter.js";
import { inrToPaise } from "../utils/money.js";

/**
 * Working out how much INR an order is worth, in both directions.
 *
 * The rule running through all of this: a refund returns what was actually charged,
 * never a fresh conversion of it. Exchange rates are admin-managed with no automatic
 * feed, so re-converting makes the refunded amount depend on when the refund happens.
 * A $9.99 order charged at 96 INR/USD took ₹960; if someone edits the rate to 92
 * before the refund, recomputing would hand back ₹919 and the customer loses ₹41 for
 * no reason they can see. Reading the stored figure removes that entirely.
 */

/**
 * How much to debit for an order.
 *
 * Rounds up, so the customer covers any fraction of a paisa. Rounding down would sell
 * the product for fractionally less than its price, and that adds up.
 */
export async function getOrderDebitPaise(order) {
    const currency = order.currency || "USD";
    const rates = await getExchangeRates();

    if (currency === "INR") {
        return {
            amountPaise: inrToPaise(order.amount, "up"),
            originalCurrency: "INR",
            originalAmount: order.amount,
            fxRate: 1,
        };
    }

    // Throws CurrencyError for an unconfigured currency, which the error middleware
    // turns into a 422. Better than silently charging the wrong amount.
    const inr = convertAmount(order.amount, currency, "INR", rates);

    return {
        amountPaise: inrToPaise(inr, "up"),
        originalCurrency: currency,
        originalAmount: order.amount,
        fxRate: rates.INR / rates[currency],
    };
}

/**
 * How much can still be refunded on an order, and where that figure came from.
 *
 * The source depends on how the order was paid:
 *
 *   wallet - reuse the exact paise taken by the original debit. No conversion, so no
 *            drift whatsoever.
 *   upi    - the customer paid rupees, and the exact amount is on the order already.
 *   other  - PayPal and crypto were charged in USD and the historical rate is not
 *            recoverable, so this is the one case that must convert at today's rate.
 *            The caller records the rate used and the admin UI says so.
 */
export async function resolveRefundablePaise(order) {
    if (order.paymentMethod === "wallet") {
        const debit = await WalletTransaction.findOne({
            order: order._id,
            type: "debit_order",
        }).lean();

        if (!debit) {
            return { error: "This order was paid from a wallet but has no matching debit" };
        }

        return {
            originalPaise: debit.amountPaise,
            converted: false,
            fx: null,
        };
    }

    const upi = order.paymentInfo?.paymentGatewayResponse?.upi;
    if (order.paymentMethod === "upi" && Number.isFinite(upi?.amount)) {
        return {
            originalPaise: inrToPaise(upi.amount),
            converted: false,
            fx: null,
        };
    }

    const { amountPaise, originalCurrency, originalAmount, fxRate } =
        await getOrderDebitPaise(order);

    return {
        originalPaise: amountPaise,
        converted: originalCurrency !== "INR",
        fx: { originalCurrency, originalAmount, fxRate },
    };
}
