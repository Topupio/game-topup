import ExchangeRate from "../models/exchangeRate.model.js";
import { DEFAULT_FALLBACK_RATES, getCurrencyDecimals } from "../constants/currencies.js";

/**
 * Thrown when a conversion is attempted with a currency that has no usable rate.
 *
 * Callers should map this to a 422 rather than letting it surface as a 500 — it means
 * the product or order is priced in a currency an admin has not configured, which is a
 * configuration problem rather than a server fault.
 */
export class CurrencyError extends Error {
    constructor(message, currency) {
        super(message);
        this.name = "CurrencyError";
        this.code = "UNSUPPORTED_CURRENCY";
        this.currency = currency;
        this.status = 422;
    }
}

/**
 * Fetch all exchange rates from DB, merged with fallbacks.
 * Returns a map of currency code -> rate (relative to 1 USD).
 */
export async function getExchangeRates() {
    const rates = { ...DEFAULT_FALLBACK_RATES, USD: 1 };

    // Override with DB values
    const dbRates = await ExchangeRate.find({}).lean();
    for (const r of dbRates) {
        rates[r.targetCurrency] = r.rate;
    }

    return rates;
}

/**
 * Resolve a single rate, rejecting anything unusable.
 *
 * Previously an unknown currency fell back to `|| 1`, so a code with no configured
 * rate converted at 1:1 against USD and produced a silently wrong amount. Money paths
 * must fail loudly instead.
 */
function resolveRate(currency, rates) {
    const rate = rates?.[currency];

    if (!Number.isFinite(rate) || rate <= 0) {
        throw new CurrencyError(
            `No exchange rate configured for currency "${currency}". ` +
            `Add it in Admin → Settings → Exchange Rates.`,
            currency
        );
    }

    return rate;
}

/**
 * Convert an amount from one currency to another using USD as pivot.
 *
 * @param {number} amount
 * @param {string} fromCurrency
 * @param {string} toCurrency
 * @param {Record<string, number>} rates - map of currency -> rate per 1 USD
 * @param {{ decimals?: number }} [opts] - override the target currency's decimal places
 * @returns {number} converted amount, rounded to the target currency's precision
 * @throws {CurrencyError} when either currency has no usable rate
 */
export function convertAmount(amount, fromCurrency, toCurrency, rates, opts = {}) {
    if (!Number.isFinite(amount)) {
        throw new CurrencyError(`Cannot convert a non-numeric amount: ${amount}`, fromCurrency);
    }

    if (fromCurrency === toCurrency) return amount;

    const fromRate = resolveRate(fromCurrency, rates);
    const toRate = resolveRate(toCurrency, rates);

    // Convert: amount in fromCurrency -> USD -> toCurrency
    const usdAmount = amount / fromRate;
    const converted = usdAmount * toRate;

    const decimals = opts.decimals ?? getCurrencyDecimals(toCurrency);
    const factor = 10 ** decimals;

    return Math.round(converted * factor) / factor;
}
