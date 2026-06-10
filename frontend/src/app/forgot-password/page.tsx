"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { FiArrowLeft, FiMail } from "react-icons/fi";
import { clientApi } from "@/lib/http";
import { isValidEmail } from "@/utils/validation";

function getErrorMessage(error: unknown, fallback: string) {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message || error.message || fallback;
    }

    if (error instanceof Error) return error.message;

    return fallback;
}

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [touched, setTouched] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const emailValid = isValidEmail(email);

    const onSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setTouched(true);
        setMessage(null);
        setError(null);

        if (!emailValid) {
            setError("Enter a valid email address");
            return;
        }

        setLoading(true);

        try {
            const response = await clientApi.post("/api/auth/forgot-password", {
                email: email.trim(),
            });
            setMessage(response.data?.message || "Password reset email sent.");
        } catch (err: unknown) {
            setError(getErrorMessage(err, "Failed to send password reset email"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-primary">
            <div className="w-full max-w-md bg-primary/40 border border-white/10 backdrop-blur-xl shadow-2xl rounded-2xl p-8">
                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiMail className="text-secondary text-3xl" />
                </div>

                <h2 className="text-3xl font-bold text-tertiary/80 text-center mb-3">
                    Forgot Password
                </h2>
                <p className="text-center text-gray-300 mb-8">
                    Enter your email to receive a password reset link.
                </p>

                <form onSubmit={onSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="forgot-password-email" className="block text-sm font-medium text-gray-200">
                            Email
                        </label>
                        <input
                            id="forgot-password-email"
                            type="email"
                            required
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            onBlur={() => setTouched(true)}
                            placeholder="you@example.com"
                            className={`w-full mt-1 px-4 py-2.5 rounded-lg bg-primary/70 text-gray-100 border focus:outline-none focus:ring-2 focus:ring-secondary transition-all ${
                                touched && !emailValid ? "border-red-500" : "border-white/10"
                            }`}
                        />
                        {touched && !emailValid && (
                            <p className="text-xs text-red-400 mt-1">Enter a valid email address</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-tertiary/80 hover:bg-tertiary text-primary py-2.5 rounded-lg font-semibold transition shadow-md disabled:opacity-60"
                    >
                        {loading ? "Sending..." : "Send Reset Link"}
                    </button>
                </form>

                {message && (
                    <p className="mt-4 text-sm text-green-400 text-center font-medium">{message}</p>
                )}
                {error && (
                    <p className="mt-4 text-sm text-red-400 text-center font-medium">{error}</p>
                )}

                <button
                    type="button"
                    onClick={() => router.push("/login")}
                    className="mt-6 w-full flex items-center justify-center gap-2 text-sm text-secondary hover:underline transition"
                >
                    <FiArrowLeft />
                    Back to Login
                </button>
            </div>
        </div>
    );
}
