import { getCurrencySymbol, getCurrencyDecimals } from "@/lib/constants/currencies";

/**
 * Money formatting for the whole app. Two functions:
 *
 *   formatFixed(amount, currency)              - format as-is, no conversion (admin)
 *   formatConverted(amount, from, to, rates)   - convert, then format (storefront)
 *
 * Before this, storefront and admin used different formatters that disagreed on the
 * same number: one concatenated a symbol by hand with always-2 decimals, the other
 * used Intl but never converted.
 */

/** Format an amount in the currency it is already denominated in. */
export function formatFixed(amount: number, currency = "USD"): string {
    const code = (currency || "USD").toUpperCase();
    const value = Number.isFinite(amount) ? amount : 0;
    const decimals = getCurrencyDecimals(code);

    try {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: code,
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        }).format(value);
    } catch {
        // Intl throws on currency codes it does not recognise.
        return `${getCurrencySymbol(code)}${value.toFixed(decimals)}`;
    }
}

/**
 * Convert between currencies using USD as the pivot, mirroring the backend.
 *
 * Returns the amount unchanged when a rate is missing, rather than throwing: this runs
 * during render, and a blank price helps nobody. The backend throws instead, and it is
 * the authority for anything that actually charges money.
 */
export function convertMoney(
    amount: number,
    from: string,
    to: string,
    rates: Record<string, number>
): number {
    if (!Number.isFinite(amount)) return 0;

    const fromCode = (from || "").toUpperCase();
    const toCode = (to || "").toUpperCase();
    if (!fromCode || !toCode || fromCode === toCode) return amount;

    const fromRate = rates?.[fromCode];
    const toRate = rates?.[toCode];
    if (!fromRate || !toRate || fromRate <= 0) return amount;

    const converted = (amount / fromRate) * toRate;
    const factor = 10 ** getCurrencyDecimals(toCode);
    return Math.round(converted * factor) / factor;
}

/** Convert an amount into the display currency, then format it. */
export function formatConverted(
    amount: number,
    from: string,
    to: string,
    rates: Record<string, number>
): string {
    return formatFixed(convertMoney(amount, from, to, rates), to);
}

/** Format integer paise as INR, e.g. 96000 -> "₹960.00". */
export function formatPaiseAsInr(paise: number): string {
    return formatFixed((Number(paise) || 0) / 100, "INR");
}
