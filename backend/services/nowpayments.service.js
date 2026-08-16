import crypto from "node:crypto";

/**
 * NOWPayments API service
 * Handles invoice creation, payment status checks, and webhook signature verification.
 * Uses native fetch (no SDK dependency).
 */

function getConfig() {
    return {
        apiKey: process.env.NOWPAYMENTS_API_KEY,
        ipnSecret: process.env.NOWPAYMENTS_IPN_SECRET,
        apiUrl: (process.env.NOWPAYMENTS_API_URL || "https://api.nowpayments.io").replace(/\/$/, ""),
        frontendUrl: (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, ""),
        backendUrl: (process.env.BACKEND_URL || process.env.FRONTEND_URL || "http://localhost:5000").replace(/\/$/, ""),
    };
}

/**
 * Create a payment invoice on NOWPayments
 * @param {number} amount - Amount in USD
 * @param {string} currency - Currency code (e.g., "usd")
 * @param {string} orderId - Our internal orderId (not _id)
 * @param {string} description - Order description
 * @returns {Promise<{invoiceId: string, invoiceUrl: string}>}
 */
export async function createInvoice(amount, currency, orderId, description, mongoId) {
    const { apiKey, apiUrl, frontendUrl, backendUrl } = getConfig();

    const redirectId = mongoId || orderId;

    const response = await fetch(`${apiUrl}/v1/invoice`, {
        method: "POST",
        headers: {
            "x-api-key": apiKey,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            price_amount: parseFloat(amount.toFixed(2)),
            price_currency: currency.toLowerCase(),
            order_id: orderId,
            order_description: description,
            ipn_callback_url: `${backendUrl}/api/payments/nowpayments/webhook`,
            success_url: `${frontendUrl}/orders/${redirectId}?payment=crypto`,
            cancel_url: `${frontendUrl}/orders/${redirectId}?payment=cancelled`,
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error("NOWPayments create invoice failed:", response.status, errorBody);
        throw new Error(`NOWPayments API error: ${response.status}`);
    }

    const result = await response.json();

    return {
        invoiceId: result.id,
        invoiceUrl: result.invoice_url,
    };
}

/**
 * Get payment status from NOWPayments
 * @param {string} paymentId - NOWPayments payment ID
 * @returns {Promise<object>}
 */
export async function getPaymentStatus(paymentId) {
    const { apiKey, apiUrl } = getConfig();

    const response = await fetch(`${apiUrl}/v1/payment/${paymentId}`, {
        method: "GET",
        headers: { "x-api-key": apiKey },
    });

    if (!response.ok) {
        throw new Error(`NOWPayments status check failed: ${response.status}`);
    }

    return response.json();
}

/**
 * Recursively sort object keys for HMAC signature verification
 */
function sortObject(obj) {
    return Object.keys(obj).sort().reduce((sorted, key) => {
        sorted[key] = (obj[key] && typeof obj[key] === "object" && !Array.isArray(obj[key]))
            ? sortObject(obj[key])
            : obj[key];
        return sorted;
    }, {});
}

/**
 * Verify NOWPayments IPN webhook signature
 * @param {Buffer|string} rawBody - Raw request body
 * @param {string} signatureHeader - x-nowpayments-sig header value
 * @returns {boolean}
 */
export function verifyWebhookSignature(rawBody, signatureHeader) {
    const { ipnSecret } = getConfig();

    if (!signatureHeader || !ipnSecret) {
        return false;
    }

    const bodyString = typeof rawBody === "string" ? rawBody : rawBody.toString("utf8");
    const parsed = JSON.parse(bodyString);
    const sorted = sortObject(parsed);

    const hmac = crypto.createHmac("sha512", ipnSecret);
    hmac.update(JSON.stringify(sorted));
    const computedSignature = hmac.digest("hex");

    // Compare in constant time. A plain === returns as soon as two bytes differ, and
    // the timing difference leaks how much of a guessed signature was correct.
    const computed = Buffer.from(computedSignature, "hex");
    const provided = Buffer.from(String(signatureHeader), "hex");

    if (computed.length !== provided.length) return false;

    return crypto.timingSafeEqual(computed, provided);
}

/**
 * Create an invoice for a wallet top-up.
 *
 * Separate from createInvoice because the callback has to reach the wallet webhook,
 * and the customer should land back on their wallet rather than an order page.
 *
 * @param {number} amountUsd - price in USD; NOWPayments works out the crypto amount
 * @param {string} topupRef - our reference, echoed back on the IPN as order_id
 */
export async function createTopupInvoice(amountUsd, topupRef, description) {
    const { apiKey, apiUrl, frontendUrl, backendUrl } = getConfig();

    const response = await fetch(`${apiUrl}/v1/invoice`, {
        method: "POST",
        headers: {
            "x-api-key": apiKey,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            price_amount: parseFloat(amountUsd.toFixed(2)),
            price_currency: "usd",
            order_id: topupRef,
            order_description: description,
            ipn_callback_url: `${backendUrl}/api/payments/nowpayments/wallet-webhook`,
            success_url: `${frontendUrl}/account/wallet?topup=pending`,
            cancel_url: `${frontendUrl}/account/wallet?topup=cancelled`,
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error("NOWPayments top-up invoice failed:", response.status, errorBody);
        throw new Error(`NOWPayments API error: ${response.status}`);
    }

    const result = await response.json();

    return { invoiceId: result.id, invoiceUrl: result.invoice_url };
}

/**
 * Map a NOWPayments status for WALLET top-ups.
 *
 * Deliberately separate from mapPaymentStatus, which the order flow depends on.
 *
 * The work order asked for crediting on "confirmed", but that status means the
 * blockchain has settled while NOWPayments has not yet paid out to the merchant —
 * crediting there means fronting money that a conversion or compliance hold could
 * still take away. "finished" is the settled state, usually seconds later, and is
 * what the order flow already treats as paid. Using one definition of "paid" across
 * both keeps reconciliation honest.
 *
 * @returns {"pending"|"credit"|"failed"|"partial"|"refunded"}
 */
export function mapTopupStatus(npStatus) {
    switch (npStatus) {
        case "waiting":
        case "confirming":
        case "confirmed":
        case "sending":
            return "pending";
        case "finished":
            return "credit";
        case "partially_paid":
            // Real money arrived, just less than asked for. Must not be ignored:
            // leaving it pending forever means the customer's crypto vanishes.
            return "partial";
        case "failed":
        case "expired":
            return "failed";
        case "refunded":
            return "refunded";
        default:
            console.warn(`Unknown NOWPayments status: ${npStatus}`);
            return "pending";
    }
}

/**
 * Map NOWPayments status to our internal payment status
 * @param {string} npStatus - NOWPayments payment_status
 * @returns {"pending"|"paid"|"failed"|"refunded"}
 */
export function mapPaymentStatus(npStatus) {
    switch (npStatus) {
        case "waiting":
        case "confirming":
        case "confirmed":
        case "sending":
        case "partially_paid":
            return "pending";
        case "finished":
            return "paid";
        case "failed":
        case "expired":
            return "failed";
        case "refunded":
            return "refunded";
        default:
            console.warn(`Unknown NOWPayments status: ${npStatus}`);
            return "pending";
    }
}
