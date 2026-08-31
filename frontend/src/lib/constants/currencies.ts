// Mirrors backend/constants/currencies.js — keep the two in sync.
export interface CurrencyInfo {
    code: string;
    symbol: string;
    name: string;
    /** Decimal places used when formatting. IDR is conventionally written without any. */
    decimals: number;
}

export const CURRENCIES: CurrencyInfo[] = [
    { code: "USD", symbol: "$", name: "US Dollar", decimals: 2 },
    { code: "INR", symbol: "₹", name: "Indian Rupee", decimals: 2 },
    { code: "PHP", symbol: "₱", name: "Philippine Peso", decimals: 2 },
    { code: "BRL", symbol: "R$", name: "Brazilian Real", decimals: 2 },
    { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah", decimals: 0 },
    { code: "RUB", symbol: "₽", name: "Russian Ruble", decimals: 2 },
    { code: "AED", symbol: "د.إ", name: "UAE Dirham", decimals: 2 },
    { code: "BDT", symbol: "৳", name: "Bangladeshi Taka", decimals: 2 },
];

export const SUPPORTED_CURRENCY_CODES = CURRENCIES.map((c) => c.code);

export const CURRENCY_SYMBOL_MAP: Record<string, string> = Object.fromEntries(
    CURRENCIES.map((c) => [c.code, c.symbol])
);

export const getCurrencySymbol = (code: string): string =>
    CURRENCY_SYMBOL_MAP[code] || "$";

const CURRENCY_DECIMALS_MAP: Record<string, number> = Object.fromEntries(
    CURRENCIES.map((c) => [c.code, c.decimals])
);

export const getCurrencyDecimals = (code: string): number =>
    CURRENCY_DECIMALS_MAP[String(code).toUpperCase()] ?? 2;

/**
 * Rates used when live exchange rates are unavailable (or, for JSON-LD, when
 * there is no per-request rate fetch at all). Mirrors backend/constants/currencies.js.
 */
export const DEFAULT_FALLBACK_RATES: Record<string, number> = {
    USD: 1,
    INR: 96,
    PHP: 56,
    BRL: 5,
    IDR: 15500,
};
