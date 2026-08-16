"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { walletApiClient } from "@/services/wallet/walletApi.client";
import type { WalletBalance, WalletSettings } from "@/services/wallet/types";

/**
 * Wallet balance, shared across the sidebar, drawer, wallet page and checkout.
 *
 * One fetch serves all of them rather than each component polling separately.
 */
type WalletContextType = {
    balance: WalletBalance | null;
    settings: WalletSettings | null;
    loading: boolean;
    /** Call after anything that moves money, so every surface updates at once. */
    refresh: () => Promise<void>;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [balance, setBalance] = useState<WalletBalance | null>(null);
    const [settings, setSettings] = useState<WalletSettings | null>(null);
    const [loading, setLoading] = useState(false);

    const refresh = useCallback(async () => {
        if (!user) {
            setBalance(null);
            return;
        }

        setLoading(true);
        try {
            const res = await walletApiClient.getBalance();
            if (res.success) setBalance(res.data);
        } catch {
            // A balance that fails to load should not break the page around it.
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    // Settings are public and rarely change, so they load once regardless of sign-in.
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await walletApiClient.getSettings();
                if (!cancelled && res.success) setSettings(res.data);
            } catch {
                // Treated as "wallet unavailable" by consumers.
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const value = useMemo(
        () => ({ balance, settings, loading, refresh }),
        [balance, settings, loading, refresh]
    );

    return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
    const ctx = useContext(WalletContext);
    if (!ctx) {
        throw new Error("useWallet must be used within a WalletProvider");
    }
    return ctx;
}
