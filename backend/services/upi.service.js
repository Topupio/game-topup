import PaymentSettings from "../models/paymentSettings.model.js";

/**
 * UPI pieces shared by order payments and wallet top-ups.
 *
 * Both flows generate the same kind of QR and accept the same kind of UTR, but they
 * are otherwise different: one settles an order, the other credits a wallet, and
 * their validation rules differ. Only the genuinely common parts live here — the two
 * controllers stay separate, so a change to top-ups cannot alter how orders are paid.
 */

export const DEFAULT_PAYEE_NAME = "topupio";

/** A UTR (Unique Transaction Reference) is always 12 digits. */
export const UTR_REGEX = /^\d{12}$/;

export const UPI_ID_REGEX = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/;

/** Fetch UPI settings, creating the document with safe defaults on first use. */
export async function getOrCreatePaymentSettings() {
    const existing = await PaymentSettings.findOne();
    if (existing) return existing;

    return PaymentSettings.create({
        upi: {
            enabled: false,
            upiId: "",
            payeeName: DEFAULT_PAYEE_NAME,
            instructions: "",
        },
    });
}

/**
 * Build a `upi://pay` link. Encoded into a QR code by the client.
 *
 * The amount is always INR — UPI does not support anything else.
 */
export function buildUpiDeepLink({ upiId, payeeName, amount, note, reference }) {
    const params = new URLSearchParams({
        pa: upiId,
        pn: payeeName,
        am: amount.toFixed(2),
        cu: "INR",
        tn: note,
        tr: reference,
    });

    return `upi://pay?${params.toString()}`;
}

/** True when UPI is switched on and actually configured. */
export function isUpiAvailable(settings) {
    return Boolean(settings?.upi?.enabled && settings?.upi?.upiId);
}

/** Normalise and validate a customer-supplied UTR. Returns null when invalid. */
export function normalizeUtr(value) {
    const utr = String(value ?? "").trim();
    return UTR_REGEX.test(utr) ? utr : null;
}
