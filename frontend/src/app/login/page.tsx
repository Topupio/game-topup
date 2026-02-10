"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import { isValidEmail, hasMinLength } from "@/utils/validation";
import { useRecaptcha } from "@/hooks/useRecaptcha";
import { ReCaptchaProvider } from "@/providers/ReCaptchaProvider";
// import { FcGoogle } from "react-icons/fc";
import axios from "axios";

function LoginContent() {
    const router = useRouter();
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    // const [googleLoading, setGoogleLoading] = useState(false);

    const { getRecaptchaToken } = useRecaptcha();
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

            const recaptchaToken = await getRecaptchaToken("login");
            await login(email, password, recaptchaToken);

            toast.success("Logged in successfully");
            router.push("/");
        } catch (err: unknown) {
            let message = "Login failed";
            if (axios.isAxiosError(err)) {
                message = err.response?.data?.message || err.message;
            } else if (err instanceof Error) {
                message = err.message;
            }

            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    // const handleGoogleLogin = async () => {
    //     try {
    //         setGoogleLoading(true);
    //         // await googleLogin();
    //         toast.success("Logged in with Google");
    //         router.push("/");
    //     } catch (err: unknown) {
    //         let message = "Google login failed";
    //         if (err instanceof Error) message = err.message;
    //         toast.error(message);
    //     } finally {
    //         setGoogleLoading(false);
    //     }
    // };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-primary">

            <div className="w-full max-w-md bg-primary/40 border border-white/10 backdrop-blur-xl shadow-2xl rounded-2xl p-8">

                <h2 className="text-3xl font-bold text-tertiary/80 text-center mb-3">
                    Welcome Back
                </h2>
                <p className="text-center text-gray-300 mb-8">
                    Sign in to access your gaming utilities.
                </p>

                {/* Google Button */}
                {/* <button
                    onClick={handleGoogleLogin}
                    disabled={googleLoading}
                    className="w-full flex items-center justify-center gap-3 bg-primary border border-white/10 text-gray-200 rounded-lg py-2.5 mb-6 hover:bg-primary/80 transition shadow-sm"
                >
                    <FcGoogle size={22} />
                    <span>
                        {googleLoading ? "Signing in..." : "Sign in with Google"}
                    </span>
                </button> */}

                {/* Divider */}
                {/* <div className="flex items-center my-4">
                    <div className="flex-1 h-px bg-white/10"></div>
                    <span className="px-3 text-gray-400 text-sm">OR</span>
                    <div className="flex-1 h-px bg-white/10"></div>
                </div> */}

                {/* Form */}
                <form onSubmit={onSubmit} className="space-y-5">

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-200">
                            Email
                        </label>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                            className={`w-full mt-1 px-4 py-2.5 rounded-lg bg-primary/70 text-gray-100 border focus:outline-none focus:ring-2 focus:ring-secondary ${touched.email && !emailValid ? "border-red-500" : "border-white/10"
                                }`}
                            placeholder="you@example.com"
                        />

                        {touched.email && !emailValid && (
                            <p className="text-xs text-red-400 mt-1">Enter a valid email</p>
                        )}
                    </div>

                    <div>
                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-200">
                                Password
                            </label>

                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                                className={`w-full mt-1 px-4 py-2.5 rounded-lg bg-primary/70 text-gray-100 border focus:outline-none focus:ring-2 focus:ring-secondary ${touched.password && !passwordValid ? "border-red-500" : "border-white/10"
                                    }`}
                                placeholder="••••••••"
                            />

                            {touched.password && !passwordValid && (
                                <p className="text-xs text-red-400 mt-1">
                                    Password must be at least 6 characters
                                </p>
                            )}
                        </div>

                        {/* Forgot Password */}
                        <div className="flex justify-end mt-1">
                            <button
                                type="button"
                                onClick={() => router.push("/forgot-password")}
                                className="text-xs text-secondary hover:underline transition cursor-pointer"
                            >
                                Forgot password?
                            </button>
                        </div>
                    </div>

                    {/* Login button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-tertiary/80 hover:bg-tertiary text-primary py-2.5 rounded-lg font-semibold transition shadow-md disabled:opacity-60"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                </form>

                {/* Bottom Link */}
                <p className="text-center text-sm mt-6 text-gray-300">
                    Don&apos;t have an account?{" "}
                    <button
                        className="text-secondary hover:underline"
                        onClick={() => router.push("/signup")}
                    >
                        Sign up
                    </button>
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <ReCaptchaProvider>
            <LoginContent />
        </ReCaptchaProvider>
    );
}