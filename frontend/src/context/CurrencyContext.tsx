"use client";

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { getCurrencySymbol } from "@/lib/constants/currencies";
import { convertMoney, formatConverted, formatFixed } from "@/lib/utils/money";
import { exchangeRateApiClient } from "@/services/exchangeRate/exchangeRateApi.client";
import { authApi } from "@/services/authApi";
import { useAuth } from "@/context/AuthContext";

type CurrencyContextType = {
    currency: string;
    symbol: string;
    setCurrency: (code: string) => void;
    convertPrice: (amount: number, fromCurrency: string) => number;
    formatPrice: (amount: number, fromCurrency: string) => string;
    rates: Record<string, number>;
    loading: boolean;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

/**
 * Cookie holding the display currency.
 *
 * Deliberately readable by JavaScript: the client needs it without a round-trip, and
 * it carries no authority. A user editing it only changes what they themselves see.
 * Prices and wallet debits are always resolved server-side from the database — a
 * client-supplied currency must never influence what someone is charged.
 */
export const CURRENCY_COOKIE = "preferredCurrency";

function writeCurrencyCookie(code: string) {
    const oneYear = 60 * 60 * 24 * 365;
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${CURRENCY_COOKIE}=${encodeURIComponent(code)}; path=/; max-age=${oneYear}; SameSite=Lax${secure}`;
}

const FALLBACK_RATES: Record<string, number> = {
    USD: 1,
    INR: 96,
    PHP: 56,
    BRL: 5,
    IDR: 15500,
};

function detectDefaultCurrency(): string {
    try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (tz.includes("Kolkata") || tz.includes("Calcutta")) return "INR";
        if (tz.includes("Manila")) return "PHP";
        if (
            tz.startsWith("America/") &&
            ["Sao_Paulo", "Fortaleza", "Recife", "Bahia"].some((c) => tz.includes(c))
        )
            return "BRL";
        if (tz.includes("Jakarta") || tz.includes("Makassar") || tz.includes("Jayapura"))
            return "IDR";
        if (tz.includes("Dhaka")) return "BDT";
        if (tz.includes("Dubai") || tz.includes("Riyadh") || tz.includes("Qatar")) return "AED";
        if (
            [
                "Moscow",
                "Vladivostok",
                "Yekaterinburg",
                "Novosibirsk",
                "Kaliningrad",
                "Kamchatka",
                "Krasnoyarsk",
                "Omsk",
                "Volgograd",
                "Samara"
            ].some((c) => tz.includes(c))
        )
            return "RUB";
    } catch {
        // ignore
    }
    return "USD";
}

export function CurrencyProvider({
    children,
    initialCurrency,
}: {
    children: React.ReactNode;
    /** Cookie value read on the server, so the first paint is already correct. */
    initialCurrency?: string;
}) {
    const { user } = useAuth();
    const [currency, setCurrencyState] = useState(initialCurrency || "USD");
    const [rates, setRates] = useState<Record<string, number>>(FALLBACK_RATES);
    const [loading, setLoading] = useState(true);

    // No cookie yet (first visit): guess from the timezone and remember it.
    useEffect(() => {
        if (initialCurrency) return;
        const detected = detectDefaultCurrency();
        setCurrencyState(detected);
        writeCurrencyCookie(detected);
    }, [initialCurrency]);

    // A signed-in user's saved preference wins over the cookie, so their choice
    // follows them across devices.
    useEffect(() => {
        const preferred = user?.preferredCurrency;
        if (preferred && preferred !== currency) {
            setCurrencyState(preferred);
            writeCurrencyCookie(preferred);
        }
        // Only react to the profile value; currency is intentionally not a dep,
        // otherwise switching currency would be immediately undone.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.preferredCurrency]);

    // Fetch exchange rates from API
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await exchangeRateApiClient.getAll();
                if (!cancelled && res.success) {
                    const ratesMap: Record<string, number> = { USD: 1 };
                    for (const r of res.data) {
                        ratesMap[r.targetCurrency] = r.rate;
                    }
                    setRates(ratesMap);
                }
            } catch {
                // Use fallback rates
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const setCurrency = useCallback(
        (code: string) => {
            setCurrencyState(code);
            writeCurrencyCookie(code);

            // Persist to the profile so the choice survives a new device. Fire and
            // forget: the cookie already covers this session, so a failed save is
            // not worth interrupting the user for.
            if (user) {
                authApi.updatePreferences({ preferredCurrency: code }).catch(() => { });
            }
        },
        [user]
    );

    const convertPrice = useCallback(
        (amount: number, fromCurrency: string): number =>
            convertMoney(amount, fromCurrency, currency, rates),
        [currency, rates]
    );

    const symbol = getCurrencySymbol(currency);

    // Delegates to the shared formatter so storefront and admin render money
    // identically. Signature is unchanged, so existing call sites keep working and
    // gain thousands separators and per-currency decimals for free.
    const formatPrice = useCallback(
        (amount: number, fromCurrency: string): string =>
            formatConverted(amount, fromCurrency, currency, rates),
        [currency, rates]
    );

    const value = useMemo(
        () => ({
            currency,
            symbol,
            setCurrency,
            convertPrice,
            formatPrice,
            rates,
            loading,
        }),
        [currency, symbol, setCurrency, convertPrice, formatPrice, rates, loading]
    );

    return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

const currencyFallback: CurrencyContextType = {
    currency: "USD",
    symbol: "$",
    setCurrency: () => {},
    convertPrice: (amount) => amount,
    formatPrice: (amount, fromCurrency) => formatFixed(amount, fromCurrency),
    rates: FALLBACK_RATES,
    loading: false,
};

export function useCurrency() {
    const ctx = useContext(CurrencyContext);
    if (!ctx) {
        if (process.env.NODE_ENV === "development") return currencyFallback;
        throw new Error("useCurrency must be used within CurrencyProvider");
    }
    return ctx;
}
