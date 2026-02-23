export interface CurrencyInfo {
    code: string;
    symbol: string;
    name: string;
}

export const CURRENCIES: CurrencyInfo[] = [
    { code: "USD", symbol: "$", name: "US Dollar" },
    { code: "INR", symbol: "₹", name: "Indian Rupee" },
    { code: "PHP", symbol: "₱", name: "Philippine Peso" },
    { code: "BRL", symbol: "R$", name: "Brazilian Real" },
    { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah" },
    { code: "RUB", symbol: "₽", name: "Russian Ruble" },
    { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
    { code: "BDT", symbol: "৳", name: "Bangladeshi Taka" },
];

export const CURRENCY_SYMBOL_MAP: Record<string, string> = Object.fromEntries(
    CURRENCIES.map((c) => [c.code, c.symbol])
);

export const getCurrencySymbol = (code: string): string =>
    CURRENCY_SYMBOL_MAP[code] || "$";
