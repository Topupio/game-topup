"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { apiClient } from "@/lib/http";
import { isValidEmail, hasMinLength } from "@/utils/validation";
import { useRecaptcha } from "@/hooks/useRecaptcha";
import { useAuth } from "@/context/AuthContext";

export default function AdminLoginPage() {
    const router = useRouter();
    const { refresh } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});

    const { getRecaptchaToken } = useRecaptcha();
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
        <div className="max-w-md mx-auto py-12">
            <h1 className="text-3xl font-semibold mb-8 text-center">Admin Login</h1>
            <form onSubmit={onSubmit} className="space-y-5 rounded-lg border p-6 bg-white">
                <div>
                    <label className="block text-sm mb-1">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                        required
                        className={`w-full border rounded px-3 py-2 ${touched.email && !emailValid ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="admin@example.com"
                    />
                    {touched.email && !emailValid && (
                        <p className="text-xs text-red-600 mt-1">Enter a valid email address</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm mb-1">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                        required
                        minLength={6}
                        className={`w-full border rounded px-3 py-2 ${touched.password && !passwordValid ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="••••••••"
                    />
                    {touched.password && !passwordValid && (
                        <p className="text-xs text-red-600 mt-1">Password must be at least 6 characters</p>
                    )}
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded disabled:opacity-60"
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    );
}