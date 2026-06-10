"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { FiArrowLeft, FiLock } from "react-icons/fi";
import { clientApi } from "@/lib/http";
import { hasMinLength } from "@/utils/validation";

function getErrorMessage(error: unknown, fallback: string) {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message || error.message || fallback;
    }

    if (error instanceof Error) return error.message;

    return fallback;
}

export default function ResetPasswordPage() {
    const router = useRouter();
    const { token } = useParams<{ token?: string | string[] }>();
    const resetToken = Array.isArray(token) ? token[0] : token;

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [touched, setTouched] = useState<{ password?: boolean; confirmPassword?: boolean }>({});
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const passwordValid = hasMinLength(password, 6);
    const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

    const onSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setTouched({ password: true, confirmPassword: true });
        setMessage(null);
        setError(null);

        if (!resetToken) {
            setError("Password reset token is missing");
            return;
        }

        if (!passwordValid) {
            setError("Password must be at least 6 characters");
            return;
        }

        if (!passwordsMatch) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            const response = await clientApi.put(`/api/auth/reset-password/${resetToken}`, {
                password,
            });
            setMessage(response.data?.message || "Password reset successful");
            setPassword("");
            setConfirmPassword("");
            setTimeout(() => router.push("/login"), 1800);
        } catch (err: unknown) {
            setError(getErrorMessage(err, "Failed to reset password"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-primary">
            <div className="w-full max-w-md bg-primary/40 border border-white/10 backdrop-blur-xl shadow-2xl rounded-2xl p-8">
                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiLock className="text-secondary text-3xl" />
                </div>

                <h2 className="text-3xl font-bold text-tertiary/80 text-center mb-3">
                    Reset Password
                </h2>
                <p className="text-center text-gray-300 mb-8">
                    Create a new password for your account.
                </p>

                <form onSubmit={onSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="reset-password" className="block text-sm font-medium text-gray-200">
                            New Password
                        </label>
                        <input
                            id="reset-password"
                            type="password"
                            required
                            minLength={6}
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            onBlur={() => setTouched((value) => ({ ...value, password: true }))}
                            placeholder="********"
                            className={`w-full mt-1 px-4 py-2.5 rounded-lg bg-primary/70 text-gray-100 border focus:outline-none focus:ring-2 focus:ring-secondary transition-all ${
                                touched.password && !passwordValid ? "border-red-500" : "border-white/10"
                            }`}
                        />
                        {touched.password && !passwordValid && (
                            <p className="text-xs text-red-400 mt-1">
                                Password must be at least 6 characters
                            </p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="reset-password-confirm" className="block text-sm font-medium text-gray-200">
                            Confirm Password
                        </label>
                        <input
                            id="reset-password-confirm"
                            type="password"
                            required
                            minLength={6}
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            onBlur={() => setTouched((value) => ({ ...value, confirmPassword: true }))}
                            placeholder="********"
                            className={`w-full mt-1 px-4 py-2.5 rounded-lg bg-primary/70 text-gray-100 border focus:outline-none focus:ring-2 focus:ring-secondary transition-all ${
                                touched.confirmPassword && !passwordsMatch
                                    ? "border-red-500"
                                    : "border-white/10"
                            }`}
                        />
                        {touched.confirmPassword && !passwordsMatch && (
                            <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-tertiary/80 hover:bg-tertiary text-primary py-2.5 rounded-lg font-semibold transition shadow-md disabled:opacity-60"
                    >
                        {loading ? "Resetting..." : "Reset Password"}
                    </button>
                </form>

                {message && (
                    <p className="mt-4 text-sm text-green-400 text-center font-medium">
                        {message}. Redirecting to login...
                    </p>
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
