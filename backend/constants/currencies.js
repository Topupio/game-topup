/**
 * Single source of truth for currencies on the backend.
 *
 * Rates are always expressed as "units of this currency per 1 USD" — USD is the
 * pivot for every conversion (see utils/currencyConverter.js). The frontend keeps
 * a mirror of this list at frontend/src/lib/constants/currencies.ts; the two must
 * be kept in sync manually, as the apps do not share a package.
 */

export const SUPPORTED_CURRENCIES = [
    { code: "USD", symbol: "$", name: "US Dollar", decimals: 2 },
    { code: "INR", symbol: "₹", name: "Indian Rupee", decimals: 2 },
    { code: "PHP", symbol: "₱", name: "Philippine Peso", decimals: 2 },
    { code: "BRL", symbol: "R$", name: "Brazilian Real", decimals: 2 },
    { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah", decimals: 0 },
    { code: "RUB", symbol: "₽", name: "Russian Ruble", decimals: 2 },
    { code: "AED", symbol: "د.إ", name: "UAE Dirham", decimals: 2 },
    { code: "BDT", symbol: "৳", name: "Bangladeshi Taka", decimals: 2 },
];

export const SUPPORTED_CURRENCY_CODES = SUPPORTED_CURRENCIES.map((c) => c.code);

export const CURRENCY_BY_CODE = Object.fromEntries(
    SUPPORTED_CURRENCIES.map((c) => [c.code, c])
);

/**
 * Rates used when a currency has no row in the ExchangeRate collection.
 *
 * These are a safety net for a cold database, not a pricing source — an admin is
 * expected to configure real rates in Admin → Settings. Currencies absent from this
 * map and absent from the DB will make convertAmount() throw rather than silently
 * convert at 1:1, which is the behaviour that previously hid mispriced conversions.
 */
export const DEFAULT_FALLBACK_RATES = {
    USD: 1,
    INR: 96,
    PHP: 56,
    BRL: 5,
    IDR: 15500,
};

export const isSupportedCurrency = (code) =>
    typeof code === "string" && SUPPORTED_CURRENCY_CODES.includes(code.toUpperCase());

export const getCurrencyDecimals = (code) =>
    CURRENCY_BY_CODE[String(code).toUpperCase()]?.decimals ?? 2;
