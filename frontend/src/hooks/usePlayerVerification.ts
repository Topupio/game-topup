"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { gamesApiClient } from "@/services/games/gamesApi.client";

interface VerificationState {
    verifiedName: string | null;
    isVerifying: boolean;
    verificationError: string | null;
}

export function usePlayerVerification() {
    const [state, setState] = useState<VerificationState>({
        verifiedName: null,
        isVerifying: false,
        verificationError: null,
    });
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastUidRef = useRef<string>("");

    const reset = useCallback(() => {
        setState({ verifiedName: null, isVerifying: false, verificationError: null });
        lastUidRef.current = "";
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const triggerVerify = useCallback((uid: string, zoneId?: string, server?: string, game?: string) => {
        // Clear previous timer
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        const trimmed = uid.trim();

        // Reset if too short
        if (trimmed.length < 5) {
            setState({ verifiedName: null, isVerifying: false, verificationError: null });
            lastUidRef.current = "";
            return;
        }

        // Skip if same UID already verified
        if (trimmed === lastUidRef.current) return;

        // Show loading immediately
        setState((prev) => ({ ...prev, isVerifying: true, verifiedName: null, verificationError: null }));

        // Debounce the actual API call
        timerRef.current = setTimeout(async () => {
            try {
                const result = await gamesApiClient.verifyPlayer(trimmed, zoneId, server, game);
                if (result.success && result.data?.unsupported) {
                    // Game doesn't support verification — silently skip
                    setState({ verifiedName: null, isVerifying: false, verificationError: null });
                    return;
                }
                if (result.success && result.data?.verified) {
                    setState({
                        verifiedName: result.data.playerName,
                        isVerifying: false,
                        verificationError: null,
                    });
                    lastUidRef.current = trimmed;
                } else {
                    setState({
                        verifiedName: null,
                        isVerifying: false,
                        verificationError: "Player not found. Please check your UID.",
                    });
                }
            } catch {
                setState({
                    verifiedName: null,
                    isVerifying: false,
                    verificationError: "Could not verify. Please check your UID.",
                });
            }
        }, 800);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    return { ...state, triggerVerify, reset };
}
