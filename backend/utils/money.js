/**
 * The boundary between rupees and paise.
 *
 * The wallet stores integers (paise) because floats lose money. `4.99 * 100` is
 * 498.99999999999994 in JavaScript, and errors like that accumulate across thousands
 * of transactions into a balance that will not reconcile.
 *
 * The rest of the app keeps float major units (order.amount = 4.99). Converting the
 * whole codebase to minor units is a much larger job, so paise stays inside the wallet
 * and this file is the only crossing point. Every variable and field holding paise is
 * named with a `Paise` suffix — that convention is what stops the two being mixed up.
 */

/** Largest value we accept, ~₹90 trillion. Beyond this, integers stop being exact. */
const MAX_SAFE_PAISE = Number.MAX_SAFE_INTEGER;

/**
 * Convert rupees to paise.
 *
 * @param {number} inr
 * @param {"round"|"up"|"down"} [rounding] - see the callers for which to use and why
 * @returns {number} integer paise
 */
export function inrToPaise(inr, rounding = "round") {
    if (!Number.isFinite(inr)) {
        throw new Error(`inrToPaise: expected a finite number, got ${inr}`);
    }

    const scaled = inr * 100;

    // Undo float representation error before rounding: 4.99 * 100 lands just under
    // 499, so a plain Math.floor would return 498 and quietly lose a paisa.
    const nearest = Math.round(scaled);
    const value = Math.abs(scaled - nearest) < 1e-6 ? nearest : scaled;

    let paise;
    if (rounding === "up") paise = Math.ceil(value);
    else if (rounding === "down") paise = Math.floor(value);
    else paise = Math.round(value);

    if (!Number.isSafeInteger(paise)) {
        throw new Error(`inrToPaise: ${inr} is outside the safe integer range`);
    }

    return paise;
}

/** Convert paise back to rupees. For display and API responses only. */
export function paiseToInr(paise) {
    return assertPaise(paise) / 100;
}

/** Throw unless the value is a usable paise amount. */
export function assertPaise(value, label = "value") {
    if (!Number.isInteger(value)) {
        throw new Error(`${label} must be an integer number of paise, got ${value}`);
    }
    if (Math.abs(value) > MAX_SAFE_PAISE) {
        throw new Error(`${label} is outside the safe integer range`);
    }
    return value;
}

/** Format paise as INR for emails, logs and admin descriptions. e.g. 96000 -> "₹960.00" */
export function formatPaise(paise) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(paiseToInr(paise));
}
