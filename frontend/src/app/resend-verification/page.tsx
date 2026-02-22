"use client";

import { useState } from "react";
import { clientApi } from "@/lib/http";
import { useRecaptcha } from "@/hooks/useRecaptcha";
import { ReCaptchaProvider } from "@/providers/ReCaptchaProvider";
import { AxiosError } from "axios";

function ResendVerificationContent() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const { getRecaptchaToken } = useRecaptcha();
    const [error, setError] = useState<string | null>(null);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        setError(null);

        try {
            const recaptchaToken = await getRecaptchaToken("resend_verification");
            const res = await clientApi.post("/api/auth/resend-verification", { email, recaptchaToken });
            setMessage(res.data.message || "Verification email sent.");
        } catch (err: unknown) {
            const error = err as AxiosError<{ message: string }>;
            setError(error.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted px-4">
            <div className="w-full max-w-md bg-card rounded-2xl p-8 shadow-xl">

                <h1 className="text-2xl font-bold text-foreground text-center mb-2">
                    Verify Your Email
                </h1>
                <p className="text-center text-muted-foreground mb-6">
                    Enter your email to receive a verification link
                </p>

                <form onSubmit={submit} className="space-y-4">
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                    />

                    <button
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium disabled:opacity-60 transition-colors"
                    >
                        {loading ? "Sending…" : "Resend Verification Email"}
                    </button>
                </form>

                {message && <p className="mt-4 text-sm text-green-600 text-center font-medium">{message}</p>}
                {error && <p className="mt-4 text-sm text-red-600 text-center font-medium">{error}</p>}

            </div>
        </div>
    );
}

export default function ResendVerificationPage() {
    return (
        <ReCaptchaProvider>
            <ResendVerificationContent />
        </ReCaptchaProvider>
    );
}