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
    const lastRequestKeyRef = useRef<string>("");
    const requestVersionRef = useRef(0);

    const reset = useCallback(() => {
        setState({ verifiedName: null, isVerifying: false, verificationError: null });
        lastRequestKeyRef.current = "";
        requestVersionRef.current += 1;
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
        const requestKey = [game || "", trimmed, zoneId || "", server || ""].join("|").toLowerCase();

        // Reset if too short
        if (trimmed.length < 5) {
            setState({ verifiedName: null, isVerifying: false, verificationError: null });
            lastRequestKeyRef.current = "";
            requestVersionRef.current += 1;
            return;
        }

        // Skip only when this exact game/player/server combination is verified.
        if (requestKey === lastRequestKeyRef.current) return;
        lastRequestKeyRef.current = "";
        const requestVersion = ++requestVersionRef.current;

        // Show loading immediately
        setState((prev) => ({ ...prev, isVerifying: true, verifiedName: null, verificationError: null }));

        // Debounce the actual API call
        timerRef.current = setTimeout(async () => {
            try {
                const result = await gamesApiClient.verifyPlayer(trimmed, zoneId, server, game);
                if (requestVersion !== requestVersionRef.current) return;
                if (result.success && result.data?.unsupported) {
                    // Game doesn't support verification — silently skip
                    setState({ verifiedName: null, isVerifying: false, verificationError: null });
                    lastRequestKeyRef.current = requestKey;
                    return;
                }
                if (result.success && result.data?.verified) {
                    setState({
                        verifiedName: result.data.username,
                        isVerifying: false,
                        verificationError: null,
                    });
                    lastRequestKeyRef.current = requestKey;
                } else {
                    setState({
                        verifiedName: null,
                        isVerifying: false,
                        verificationError: "Player not found. Please check your UID.",
                    });
                }
            } catch {
                if (requestVersion !== requestVersionRef.current) return;
                setState({
                    verifiedName: null,
                    isVerifying: false,
                    verificationError: "Name verification is temporarily unavailable. Please try again.",
                });
            }
        }, 800);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            requestVersionRef.current += 1;
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    return { ...state, triggerVerify, reset };
}
