"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { apiClient } from "@/lib/http";
import { isValidEmail, hasMinLength } from "@/utils/validation";
import { useRecaptcha } from "@/hooks/useRecaptcha";
import { ReCaptchaProvider } from "@/providers/ReCaptchaProvider";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import logo from "@/assets/logo/logo-2.png";

function AdminLoginContent() {
    const router = useRouter();
    const { refresh } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});

    const { getRecaptchaToken, isRecaptchaLoading } = useRecaptcha();
    const emailValid = isValidEmail(email);
    const passwordValid = hasMinLength(password, 6);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (!emailValid || !passwordValid) {
                setTouched({ email: true, password: true });
                throw new Error("Please fix the validation errors");
            }
            const recaptchaToken = await getRecaptchaToken("admin_login");
            if (!recaptchaToken) {
                throw new Error("reCAPTCHA not ready. Please wait a moment and try again.");
            }
            await apiClient.post("/api/admin/login", { email, password, recaptchaToken });
            await refresh();
            toast.success("Admin logged in");
            router.push("/admin/dashboard");
        } catch (err: unknown) {
            let message = "Login failed";
            if (err instanceof Error) message = err.message;
            else if (typeof err === "object" && err !== null && "response" in err) {
                const e = err as { response?: { data?: { message?: string } } };
                message = e.response?.data?.message ?? message;
            }
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* ── Left Panel: Branding ── */}
            <div className="hidden lg:flex flex-col items-center justify-center relative bg-[#0F172A] overflow-hidden">
                {/* Background glows */}
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#6366F1]/20 rounded-full blur-[120px]" />
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#FBBF24]/15 rounded-full blur-[120px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#6366F1]/5 rounded-full blur-[100px]" />

                <div className="relative z-10 px-12 text-center">
                    <Image
                        src={logo}
                        alt="Topupio.com"
                        className="h-28 w-auto mx-auto mb-8"
                    />
                    <h2 className="text-3xl font-bold text-white mb-3">
                        Welcome back
                    </h2>
                    <p className="text-slate-400 text-base max-w-sm mx-auto leading-relaxed">
                        Manage your game top-up platform, track orders, and grow your business.
                    </p>

                    {/* Feature highlights */}
                    <div className="mt-10 space-y-4 text-left max-w-xs mx-auto">
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-[#6366F1]/20 flex items-center justify-center">
                                <svg className="w-4 h-4 text-[#6366F1]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                                </svg>
                            </div>
                            <span className="text-sm text-slate-300">Real-time analytics dashboard</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-[#FBBF24]/15 flex items-center justify-center">
                                <svg className="w-4 h-4 text-[#FBBF24]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                </svg>
                            </div>
                            <span className="text-sm text-slate-300">Order & inventory management</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-[#22C55E]/15 flex items-center justify-center">
                                <svg className="w-4 h-4 text-[#22C55E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                </svg>
                            </div>
                            <span className="text-sm text-slate-300">Secure & encrypted platform</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Right Panel: Login Form ── */}
            <div className="flex flex-col items-center justify-center bg-[#0B1120] relative overflow-hidden px-6">
                {/* Subtle background glow for mobile */}
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#6366F1]/10 rounded-full blur-[100px] lg:hidden" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#FBBF24]/5 rounded-full blur-[100px] lg:hidden" />

                <div className="relative w-full max-w-sm animate-fadeIn">
                    {/* Mobile logo - hidden on desktop */}
                    <div className="lg:hidden text-center mb-8">
                        <Image
                            src={logo}
                            alt="Topupio.com"
                            className="h-20 w-auto mx-auto mb-4"
                        />
                    </div>

                    {/* Form header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-white tracking-tight">
                            Admin Portal
                        </h1>
                        <p className="text-sm text-slate-400 mt-1.5">
                            Sign in to manage your dashboard
                        </p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={onSubmit} className="space-y-5">
                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                Email address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                                required
                                className={`w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 bg-white/[0.06] border outline-none transition-all duration-200 focus:ring-2 focus:ring-[#6366F1]/50 focus:border-[#6366F1] ${
                                    touched.email && !emailValid
                                        ? "border-red-500/60 focus:ring-red-500/30 focus:border-red-500"
                                        : "border-white/[0.08] hover:border-white/[0.15]"
                                }`}
                                placeholder="admin@example.com"
                            />
                            {touched.email && !emailValid && (
                                <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                                    <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
                                    Enter a valid email address
                                </p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                                required
                                minLength={6}
                                className={`w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 bg-white/[0.06] border outline-none transition-all duration-200 focus:ring-2 focus:ring-[#6366F1]/50 focus:border-[#6366F1] ${
                                    touched.password && !passwordValid
                                        ? "border-red-500/60 focus:ring-red-500/30 focus:border-red-500"
                                        : "border-white/[0.08] hover:border-white/[0.15]"
                                }`}
                                placeholder="••••••••"
                            />
                            {touched.password && !passwordValid && (
                                <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                                    <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
                                    Password must be at least 6 characters
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || isRecaptchaLoading}
                            className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5558E6] hover:to-[#7C53EB] shadow-lg shadow-[#6366F1]/25 hover:shadow-[#6366F1]/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                        >
                            {isRecaptchaLoading ? "Loading..." : loading ? "Signing in..." : "Sign in"}
                        </button>
                    </form>

                    {/* Footer */}
                    <p className="text-center text-xs text-slate-600 mt-8">
                        Protected by reCAPTCHA
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function AdminLoginPage() {
    return (
        <ReCaptchaProvider>
            <AdminLoginContent />
        </ReCaptchaProvider>
    );
}