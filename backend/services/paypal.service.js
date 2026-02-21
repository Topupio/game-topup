import {
    Client,
    Environment,
    LogLevel,
    OrdersController,
    PaymentsController,
    CheckoutPaymentIntent,
    ApiError,
} from "@paypal/paypal-server-sdk";

// Lazy-initialized PayPal client (env vars not available at module load time)
let _client = null;
let _ordersController = null;
let _paymentsController = null;

function getClient() {
    if (!_client) {
        _client = new Client({
            clientCredentialsAuthCredentials: {
                oAuthClientId: process.env.PAYPAL_CLIENT_ID,
                oAuthClientSecret: process.env.PAYPAL_CLIENT_SECRET,
            },
            timeout: 20000,
            environment:
                process.env.PAYPAL_MODE === "live"
                    ? Environment.Production
                    : Environment.Sandbox,
            logging: {
                logLevel: LogLevel.Info,
                logRequest: { logBody: true },
                logResponse: { logHeaders: true },
            },
        });
        _ordersController = new OrdersController(_client);
        _paymentsController = new PaymentsController(_client);
    }
    return { ordersController: _ordersController, paymentsController: _paymentsController };
}

/**
 * Get PayPal API base URL based on environment
 */
function getBaseUrl() {
    return process.env.PAYPAL_MODE === "live"
        ? "https://api-m.paypal.com"
        : "https://api-m.sandbox.paypal.com";
}

/**
 * Get OAuth access token for webhook verification (not covered by SDK)
 */
async function getAccessToken() {
    const baseUrl = getBaseUrl();
    const credentials = Buffer.from(
        `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString("base64");

    const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: "POST",
        headers: {
            Authorization: `Basic ${credentials}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
    });

    if (!response.ok) {
        throw new Error(`Failed to get PayPal access token: ${response.status}`);
    }

    const data = await response.json();
    return data.access_token;
}

/**
 * Create a PayPal order
 * @param {number} amount - Order amount
 * @param {string} currency - Currency code (e.g., "USD")
 * @param {string} referenceId - Our internal order ID for reconciliation
 * @returns {Promise<{id: string, status: string}>}
 */
export async function createOrder(amount, currency, referenceId) {
    const { ordersController } = getClient();
    const { result } = await ordersController.createOrder({
        body: {
            intent: CheckoutPaymentIntent.Capture,
            purchaseUnits: [
                {
                    referenceId,
                    amount: {
                        currencyCode: currency,
                        value: amount.toFixed(2),
                    },
                },
            ],
        },
        prefer: "return=minimal",
    });

    return { id: result.id, status: result.status };
}

/**
 * Capture a PayPal order after buyer approval
 * @param {string} paypalOrderId - PayPal order ID
 * @returns {Promise<{status: string, captureId: string, amount: object, fullResponse: object}>}
 */
export async function captureOrder(paypalOrderId) {
    const { ordersController } = getClient();
    const { result } = await ordersController.captureOrder({
        id: paypalOrderId,
        prefer: "return=representation",
    });

    const capture = result.purchaseUnits?.[0]?.payments?.captures?.[0];

    return {
        status: result.status,
        captureId: capture?.id || null,
        amount: capture?.amount || null,
        fullResponse: result,
    };
}

/**
 * Refund a captured payment
 * @param {string} captureId - PayPal capture ID
 * @param {number|null} amount - Partial refund amount (null = full refund)
 * @param {string} currency - Currency code
 * @param {string} reason - Reason for refund
 * @returns {Promise<{id: string, status: string, fullResponse: object}>}
 */
export async function refundCapture(captureId, amount, currency, reason) {
    const body = {};

    if (amount) {
        body.amount = {
            currencyCode: currency,
            value: amount.toFixed(2),
        };
    }

    if (reason) {
        body.noteToPayer = reason.substring(0, 255);
    }

    const { paymentsController } = getClient();
    const { result } = await paymentsController.refundCapturedPayment({
        captureId,
        body: Object.keys(body).length > 0 ? body : undefined,
    });

    return {
        id: result.id,
        status: result.status,
        fullResponse: result,
    };
}

/**
 * Verify a PayPal webhook signature
 * Uses raw fetch since webhook verification is not in the SDK
 * @param {object} headers - Request headers from PayPal webhook
 * @param {string|Buffer} rawBody - Raw request body
 * @returns {Promise<boolean>}
 */
export async function verifyWebhookSignature(headers, rawBody) {
    const accessToken = await getAccessToken();
    const baseUrl = getBaseUrl();

    const body = typeof rawBody === "string" ? rawBody : rawBody.toString("utf8");

    const verificationPayload = {
        auth_algo: headers["paypal-auth-algo"],
        cert_url: headers["paypal-cert-url"],
        transmission_id: headers["paypal-transmission-id"],
        transmission_sig: headers["paypal-transmission-sig"],
        transmission_time: headers["paypal-transmission-time"],
        webhook_id: process.env.PAYPAL_WEBHOOK_ID,
        webhook_event: JSON.parse(body),
    };

    const response = await fetch(
        `${baseUrl}/v1/notifications/verify-webhook-signature`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(verificationPayload),
        }
    );

    if (!response.ok) {
        console.error("Webhook verification failed:", response.status);
        return false;
    }

    const result = await response.json();
    return result.verification_status === "SUCCESS";
}

export { ApiError };
