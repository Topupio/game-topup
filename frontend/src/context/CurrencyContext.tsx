"use client";

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { getCurrencySymbol } from "@/lib/constants/currencies";
import { convertMoney, formatConverted, formatFixed } from "@/lib/utils/money";
import { exchangeRateApiClient } from "@/services/exchangeRate/exchangeRateApi.client";

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

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
    const [currency, setCurrencyState] = useState("INR");
    const [rates, setRates] = useState<Record<string, number>>(FALLBACK_RATES);
    const [loading, setLoading] = useState(true);
    const [hydrated, setHydrated] = useState(false);

    // Hydrate from localStorage + geo-detect on first mount
    useEffect(() => {
        const stored = localStorage.getItem("preferredCurrency");
        if (stored) {
            setCurrencyState(stored);
        } else {
            const detected = detectDefaultCurrency();
            setCurrencyState(detected);
            localStorage.setItem("preferredCurrency", detected);
        }
        setHydrated(true);
    }, []);

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

    const setCurrency = useCallback((code: string) => {
        setCurrencyState(code);
        localStorage.setItem("preferredCurrency", code);
    }, []);

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
            currency: hydrated ? currency : "INR",
            symbol: hydrated ? symbol : "₹",
            setCurrency,
            convertPrice,
            formatPrice,
            rates,
            loading,
        }),
        [currency, symbol, setCurrency, convertPrice, formatPrice, rates, loading, hydrated]
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
