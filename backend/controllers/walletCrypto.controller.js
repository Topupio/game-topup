import { asyncHandler } from "../middlewares/asyncHandler.js";
import WalletTopup from "../models/walletTopup.model.js";
import { getWalletSettings } from "../models/walletSettings.model.js";
import { applyTransaction, getOrCreateWallet, WalletError } from "../services/wallet.service.js";
import {
    assertAmountWithinLimits,
    assertDailyCapAllows,
    generateTopupRef,
} from "../services/walletTopup.service.js";
import {
    createTopupInvoice,
    mapTopupStatus,
    verifyWebhookSignature,
} from "../services/nowpayments.service.js";
import { convertAmount, getExchangeRates } from "../utils/currencyConverter.js";
import { MIN_CRYPTO_AMOUNT_USD } from "../constants/payments.js";
import { formatPaise, inrToPaise, paiseToInr } from "../utils/money.js";

/**
 * Smallest top-up crypto can actually handle.
 *
 * NOWPayments rejects anything under MIN_CRYPTO_AMOUNT_USD, which at ~96 INR/USD is
 * around ₹336 — well above the ₹100 wallet minimum. Without surfacing this, a
 * customer entering ₹200 gets an opaque failure from the provider instead of a clear
 * message from us.
 */
async function getCryptoMinimumPaise(settings) {
    const rates = await getExchangeRates();
    const minInr = convertAmount(MIN_CRYPTO_AMOUNT_USD, "USD", "INR", rates);
    return Math.max(settings.minTopupPaise, inrToPaise(minInr, "up"));
}

/**
 * @desc    Start a USDT top-up and return the payment link
 * @route   POST /api/wallet/topups/usdt/initiate
 * @access  Private
 */
export const initiateCryptoTopup = asyncHandler(async (req, res) => {
    const amountPaise = Number(req.body.amountPaise);

    const settings = await getWalletSettings();
    if (!settings.enabled || !settings.usdtTopupEnabled) {
        return res.status(400).json({ success: false, message: "Crypto top-ups are currently unavailable" });
    }

    try {
        assertAmountWithinLimits(amountPaise, settings);
        await assertDailyCapAllows(req.user.id, amountPaise, settings);
    } catch (err) {
        if (err instanceof WalletError) {
            return res.status(err.status).json({ success: false, code: err.code, message: err.message });
        }
        throw err;
    }

    const minimumPaise = await getCryptoMinimumPaise(settings);
    if (amountPaise < minimumPaise) {
        return res.status(422).json({
            success: false,
            code: "BELOW_CRYPTO_MINIMUM",
            message: `The minimum crypto top-up is ${formatPaise(minimumPaise)}`,
        });
    }

    const wallet = await getOrCreateWallet(req.user.id);
    if (wallet.status !== "active") {
        return res.status(423).json({ success: false, message: "This wallet is frozen" });
    }

    if (wallet.balancePaise + amountPaise > settings.maxBalancePaise) {
        return res.status(422).json({
            success: false,
            code: "MAX_BALANCE_EXCEEDED",
            message: `This would take your balance over the ${formatPaise(settings.maxBalancePaise)} limit`,
        });
    }

    // The invoice is priced in USD, so lock the rate now and store it. The credit uses
    // the INR figure the customer asked for, not a re-conversion of whatever comes
    // back on the webhook — otherwise a rate change mid-payment silently changes what
    // they receive.
    const rates = await getExchangeRates();
    const amountInr = paiseToInr(amountPaise);
    const amountUsd = convertAmount(amountInr, "INR", "USD", rates);
    const fxRate = rates.INR;

    const topupRef = generateTopupRef();

    let invoice;
    try {
        invoice = await createTopupInvoice(
            amountUsd,
            topupRef,
            `Topupio wallet top-up ${formatPaise(amountPaise)}`
        );
    } catch (err) {
        console.error("[WALLET-CRYPTO] invoice creation failed:", err);
        return res.status(502).json({
            success: false,
            message: "Could not reach the payment provider. Please try again.",
        });
    }

    const topup = await WalletTopup.create({
        topupRef,
        user: req.user.id,
        wallet: wallet._id,
        method: "usdt",
        amountPaise,
        originalCurrency: "USD",
        originalAmount: amountUsd,
        fxRate,
        status: "pending",
        expiresAt: new Date(Date.now() + settings.topupExpiryMinutes * 60 * 1000),
        crypto: { invoiceId: invoice.invoiceId, invoiceUrl: invoice.invoiceUrl },
    });

    res.status(201).json({
        success: true,
        data: {
            topupId: topup._id,
            topupRef,
            amountPaise,
            amountUsd,
            invoiceUrl: invoice.invoiceUrl,
            expiresAt: topup.expiresAt,
        },
        message: "Complete the payment to credit your wallet",
    });
});

/**
 * @desc    NOWPayments callback for wallet top-ups
 * @route   POST /api/payments/nowpayments/wallet-webhook
 * @access  Public, verified by HMAC signature
 *
 * Separate from the order webhook so the two cannot interfere: that handler looks up
 * an Order and would otherwise need a wallet fallback bolted onto a long switch.
 *
 * Always answers 200, even on failure, because NOWPayments retries anything else and
 * a retry storm helps nobody. Failures are logged loudly instead — an unhandled one
 * here is money that arrived and was never credited.
 */
export const handleWalletWebhook = asyncHandler(async (req, res) => {
    const signature = req.headers["x-nowpayments-sig"];

    if (!verifyWebhookSignature(req.body, signature)) {
        console.error("[WALLET-IPN] signature verification failed");
        return res.status(401).json({ message: "Invalid signature" });
    }

    let payload;
    try {
        payload = typeof req.body === "string"
            ? JSON.parse(req.body)
            : JSON.parse(req.body.toString("utf8"));
    } catch {
        console.error("[WALLET-IPN-FAIL] could not parse payload");
        return res.status(200).json({ received: true });
    }

    const {
        order_id: topupRef,
        payment_status: paymentStatus,
        payment_id: paymentId,
        actually_paid: actuallyPaid,
        pay_currency: payCurrency,
    } = payload;

    try {
        const topup = await WalletTopup.findOne({ topupRef, method: "usdt" });

        if (!topup) {
            console.error(`[WALLET-IPN-FAIL] no top-up found for ref ${topupRef}`);
            return res.status(200).json({ received: true });
        }

        topup.crypto = {
            ...topup.crypto,
            lastIpnStatus: paymentStatus,
            lastIpnAt: new Date(),
            actuallyPaid,
            payCurrency,
        };
        topup.rawProviderPayload = payload;

        // Claim the provider's payment id. The unique (method, providerRef) index means
        // a second, different payment against this top-up is rejected rather than
        // silently accepted.
        if (!topup.providerRef && paymentId) {
            topup.providerRef = String(paymentId);
        }

        const outcome = mapTopupStatus(paymentStatus);

        if (outcome === "pending") {
            await topup.save();
            return res.status(200).json({ received: true });
        }

        if (outcome === "failed" || outcome === "refunded") {
            if (topup.status !== "confirmed") {
                topup.status = outcome === "failed" ? "rejected" : "rejected";
                topup.adminNote = `Payment ${paymentStatus} at provider`;
            }
            await topup.save();
            return res.status(200).json({ received: true });
        }

        if (topup.status === "confirmed") {
            await topup.save();
            return res.status(200).json({ received: true, note: "already credited" });
        }

        // How much to credit. A full payment credits what was requested. An
        // underpayment credits only what actually arrived, floored so we never credit
        // more than was received.
        let creditPaise = topup.amountPaise;

        if (outcome === "partial") {
            const rates = await getExchangeRates();
            const paidUsd = Number(actuallyPaid);

            if (!Number.isFinite(paidUsd) || paidUsd <= 0) {
                console.error(`[WALLET-IPN-FAIL] partial payment with no usable amount on ${topupRef}`);
                return res.status(200).json({ received: true });
            }

            creditPaise = inrToPaise(convertAmount(paidUsd, "USD", "INR", rates), "down");

            if (creditPaise <= 0) {
                console.error(`[WALLET-IPN-FAIL] partial payment too small to credit on ${topupRef}`);
                return res.status(200).json({ received: true });
            }
        }

        await topup.save();

        const { transaction } = await applyTransaction({
            userId: topup.user,
            type: "credit_topup",
            amountPaise: creditPaise,
            topupId: topup._id,
            // Keyed on the provider's payment id, so replays of the same event cannot
            // credit twice no matter how many arrive or how close together.
            idempotencyKey: `nowpayments:${paymentId}`,
            fx: {
                originalCurrency: topup.originalCurrency,
                originalAmount: topup.originalAmount,
                fxRate: topup.fxRate,
            },
            meta: outcome === "partial" ? { partial: true, actuallyPaid, payCurrency } : {},
            withinTxn: async (session) => {
                await WalletTopup.updateOne(
                    { _id: topup._id, status: { $ne: "confirmed" } },
                    {
                        $set: {
                            status: "confirmed",
                            creditedAt: new Date(),
                            amountPaise: creditPaise,
                        },
                    },
                    { session }
                );
            },
        });

        await WalletTopup.updateOne(
            { _id: topup._id },
            { $set: { creditTransaction: transaction._id } }
        );

        console.log(
            `[WALLET-IPN] Credited ${formatPaise(creditPaise)} to wallet for ${topupRef}` +
            (outcome === "partial" ? " (partial payment)" : "")
        );

        return res.status(200).json({ received: true });
    } catch (err) {
        // Loud, greppable, and still a 200 so the provider stops retrying. Anything
        // landing here needs a human: the customer's crypto arrived.
        console.error(`[WALLET-IPN-FAIL] ${topupRef}:`, err);
        return res.status(200).json({ received: true });
    }
});
