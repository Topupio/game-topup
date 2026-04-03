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

    return computedSignature === signatureHeader;
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
