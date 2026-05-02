import { getCurrencySymbol } from "@/lib/constants/currencies";

const ZERO_DECIMAL_CURRENCIES = new Set(["IDR"]);

export function formatCurrencyAmount(amount: number, currency = "USD") {
    const currencyCode = currency.toUpperCase();
    const safeAmount = Number.isFinite(amount) ? amount : 0;
    const fractionDigits = ZERO_DECIMAL_CURRENCIES.has(currencyCode) ? 0 : 2;

    try {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currencyCode,
            minimumFractionDigits: fractionDigits,
            maximumFractionDigits: fractionDigits,
        }).format(safeAmount);
    } catch {
        return `${getCurrencySymbol(currencyCode)}${safeAmount.toFixed(fractionDigits)}`;
    }
}
