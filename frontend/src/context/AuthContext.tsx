"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "@/services/authApi";
import { clearCachedCsrf } from "@/lib/http";

export type AuthUser = {
    id: string;
    name: string;
    email: string;
    role: "user" | "admin";
};

type AuthContextType = {
    user: AuthUser | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const me = await authApi.getProfile();
                if (mounted) setUser(me);
            } catch {
                if (mounted) setUser(null);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    const login = async (email: string, password: string) => {
        await authApi.loginUser({ email, password });
        const me = await authApi.getProfile();
        setUser(me);
    };

    const register = async (name: string, email: string, password: string) => {
        await authApi.registerUser({ name, email, password });
        const me = await authApi.getProfile();
        setUser(me);
    };

    const logout = async () => {
        await authApi.logoutUser();
        clearCachedCsrf();
        setUser(null);
    };

    const value = useMemo(
        () => ({ user, loading, login, register, logout, refresh: async () => {
            const me = await authApi.getProfile();
            setUser(me);
        }}),
        [user, loading]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
