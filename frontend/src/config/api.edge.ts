// config/api.edge.ts
// Edge-safe API helpers (Middleware compatible)

const normalizeBase = (value?: string) =>
    value ? value.replace(/\/$/, "") : "";

export const API_BASE = normalizeBase(
    process.env.NEXT_PUBLIC_API_BASE
);

// Keep this minimal — only what middleware needs
type Token = string;

export const endpoints = {
    auth: {
        verifyEmail: (token: Token) => `/api/auth/verify-email/${token}`,
        resendVerification: "/api/auth/resend-verification",
    },
};
