import { CURRENCIES } from "../constants/currencies";
export const CURRENCY_COOKIE = "preferredCurrency";
export const DEFAULT_CURRENCY = "USD";
export function resolveDisplayCurrency(country: string | null | undefined, saved?: string): string {
  if (saved && CURRENCIES.some(({ code }) => code === saved)) return saved;
  return country?.toUpperCase() === "IN" ? "INR" : DEFAULT_CURRENCY;
}
