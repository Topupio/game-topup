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
        <div className="min-h-screen flex items-center justify-center px-4 bg-primary">
            <div className="w-full max-w-md bg-primary/40 border border-white/10 backdrop-blur-xl shadow-2xl rounded-2xl p-8">

                <h2 className="text-3xl font-bold text-tertiary/80 text-center mb-3">
                    Verify Your Email
                </h2>
                <p className="text-center text-gray-300 mb-8">
                    Enter your email to receive a verification link
                </p>

                <form onSubmit={submit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-200">
                            Email
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full mt-1 px-4 py-2.5 rounded-lg bg-primary/70 text-gray-100 border border-white/10 focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
                        />
                    </div>

                    <button
                        disabled={loading}
                        className="w-full bg-tertiary/80 hover:bg-tertiary text-primary py-2.5 rounded-lg font-semibold transition shadow-md disabled:opacity-60"
                    >
                        {loading ? "Sending…" : "Resend Verification Email"}
                    </button>
                </form>

                {message && <p className="mt-4 text-sm text-green-400 text-center font-medium">{message}</p>}
                {error && <p className="mt-4 text-sm text-red-400 text-center font-medium">{error}</p>}

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
