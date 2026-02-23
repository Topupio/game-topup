import ExchangeRate from "../models/exchangeRate.model.js";

const FALLBACK_RATES = {
    USD: 1,
    INR: 96,
    PHP: 56,
    BRL: 5,
    IDR: 15500,
};

/**
 * Fetch all exchange rates from DB, merged with fallbacks.
 * Returns a map of currency code -> rate (relative to 1 USD).
 */
export async function getExchangeRates() {
    const rates = { USD: 1 };

    // Start with fallbacks
    Object.assign(rates, FALLBACK_RATES);

    // Override with DB values
    const dbRates = await ExchangeRate.find({}).lean();
    for (const r of dbRates) {
        rates[r.targetCurrency] = r.rate;
    }

    return rates;
}

/**
 * Convert an amount from one currency to another using USD as pivot.
 * @param {number} amount
 * @param {string} fromCurrency
 * @param {string} toCurrency
 * @param {Record<string, number>} rates - map of currency -> rate per 1 USD
 * @returns {number} converted amount rounded to 2 decimals
 */
export function convertAmount(amount, fromCurrency, toCurrency, rates) {
    if (fromCurrency === toCurrency) return amount;

    const fromRate = rates[fromCurrency] || 1;
    const toRate = rates[toCurrency] || 1;

    // Convert: amount in fromCurrency -> USD -> toCurrency
    const usdAmount = amount / fromRate;
    const converted = usdAmount * toRate;

    return Math.round(converted * 100) / 100;
}
