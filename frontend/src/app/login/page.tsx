"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import { isValidEmail, hasMinLength } from "@/utils/validation";
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth(); // Make sure googleLogin exists
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});
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

            await login(email, password);

            toast.success("Logged in successfully");
            router.push("/");
        } catch (err: unknown) {
            let message = "Login failed";
            if (err instanceof Error) message = err.message;
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setGoogleLoading(true);
            // await googleLogin();
            toast.success("Logged in with Google");
            router.push("/");
        } catch (err: unknown) {
            let message = "Google login failed";
            if (err instanceof Error) message = err.message;
            toast.error(message);
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white/70 backdrop-blur-xl shadow-xl rounded-2xl p-8 border border-white/40">

                {/* Title */}
                <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">
                    Welcome Back
                </h2>
                <p className="text-center text-gray-500 mb-8">
                    Sign in to access your gaming utilities and account tools.
                </p>

                {/* Google Button */}
                <button
                    onClick={handleGoogleLogin}
                    disabled={googleLoading}
                    className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg py-2.5 mb-6 hover:bg-gray-50 transition shadow-sm"
                >
                    <FcGoogle size={22} />
                    <span className="text-gray-700 font-medium">
                        {googleLoading ? "Signing in..." : "Sign in with Google"}
                    </span>
                </button>

                {/* Divider */}
                <div className="flex items-center my-4">
                    <div className="flex-1 h-px bg-gray-300"></div>
                    <span className="px-3 text-gray-500 text-sm">OR</span>
                    <div className="flex-1 h-px bg-gray-300"></div>
                </div>

                {/* Email & Password Form */}
                <form onSubmit={onSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                            className={`w-full mt-1 px-4 py-2.5 rounded-lg border text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition ${touched.email && !emailValid ? "border-red-500" : "border-gray-300"
                                }`}
                            placeholder="you@example.com"
                        />
                        {touched.email && !emailValid && (
                            <p className="text-xs text-red-600 mt-1">Enter a valid email address</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                            className={`w-full mt-1 px-4 py-2.5 rounded-lg border text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition ${touched.password && !passwordValid
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }`}
                            placeholder="••••••••"
                        />
                        {touched.password && !passwordValid && (
                            <p className="text-xs text-red-600 mt-1">
                                Password must be at least 6 characters
                            </p>
                        )}
                    </div>

                    {/* Login button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition disabled:opacity-60 shadow-md"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                {/* Bottom link */}
                <p className="text-center text-sm mt-6 text-gray-700">
                    Don&apos;t have an account?{" "}
                    <button
                        className="text-blue-600 hover:underline cursor-pointer"
                        onClick={() => router.push("/signup")}
                    >
                        Sign up
                    </button>
                </p>
            </div>
        </div>
    );
}