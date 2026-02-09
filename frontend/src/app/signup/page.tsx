"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import { useRecaptcha } from "@/hooks/useRecaptcha";
import { ReCaptchaProvider } from "@/providers/ReCaptchaProvider";
import { FcGoogle } from "react-icons/fc";

function SignupContent() {
    const router = useRouter();
    const { register } = useAuth();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [touched, setTouched] = useState<{ name?: boolean; email?: boolean; password?: boolean }>({});
    const { getRecaptchaToken } = useRecaptcha();
    const [googleLoading, setGoogleLoading] = useState(false);

    const nameValid = name.trim().length >= 2;
    const emailValid = /.+@.+\..+/.test(email);
    const passwordValid = password.length >= 6;

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (!nameValid || !emailValid || !passwordValid) {
                setTouched({ name: true, email: true, password: true });
                throw new Error("Please fix the validation errors");
            }
            const recaptchaToken = await getRecaptchaToken("register");
            await register(name, email, password, recaptchaToken);
            toast.success("Account created! Please check your email to verify.");
            router.push(`/check-email?email=${encodeURIComponent(email)}`);
        } catch (err: unknown) {
            let message = "Signup failed";
            if (err instanceof Error) message = err.message;
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
        try {
            setGoogleLoading(true);
            // implement google signup flow
            toast.success("Signed up with Google");
            router.push("/");
        } catch (err: unknown) {
            let message = "Google signup failed";
            if (err instanceof Error) message = err.message;
            toast.error(message);
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-blue-100 px-4">
            <div className="w-full max-w-md bg-white/70 backdrop-blur-xl shadow-xl rounded-2xl p-8 border border-white/40">

                {/* Title */}
                <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">
                    Create an Account
                </h1>
                <p className="text-center text-gray-500 mb-8">
                    Sign up to access exclusive gaming tools, deals, and utilities.
                </p>

                {/* Google Sign Up */}
                <button
                    onClick={handleGoogleSignUp}
                    disabled={googleLoading}
                    className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg py-2.5 mb-6 hover:bg-gray-50 transition shadow-sm"
                >
                    <FcGoogle size={22} />
                    <span className="text-gray-700 font-medium">
                        {googleLoading ? "Signing up..." : "Sign up with Google"}
                    </span>
                </button>

                {/* Divider */}
                <div className="flex items-center my-4">
                    <div className="flex-1 h-px bg-gray-300"></div>
                    <span className="px-3 text-gray-500 text-sm">OR</span>
                    <div className="flex-1 h-px bg-gray-300"></div>
                </div>

                {/* Form */}
                <form onSubmit={onSubmit} className="space-y-5">

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                            required
                            minLength={2}
                            className={`w-full mt-1 px-4 py-2.5 rounded-lg border text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition ${touched.name && !nameValid ? "border-red-500" : "border-gray-300"
                                }`}
                            placeholder="John Doe"
                        />
                        {touched.name && !nameValid && (
                            <p className="text-xs text-red-600 mt-1">Name must be at least 2 characters</p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                            required
                            className={`w-full mt-1 px-4 py-2.5 rounded-lg border text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition ${touched.email && !emailValid ? "border-red-500" : "border-gray-300"
                                }`}
                            placeholder="you@example.com"
                        />
                        {touched.email && !emailValid && (
                            <p className="text-xs text-red-600 mt-1">Enter a valid email address</p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                            required
                            minLength={6}
                            className={`w-full mt-1 px-4 py-2.5 rounded-lg border text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition ${touched.password && !passwordValid ? "border-red-500" : "border-gray-300"
                                }`}
                            placeholder="••••••••"
                        />
                        {touched.password && !passwordValid && (
                            <p className="text-xs text-red-600 mt-1">Password must be at least 6 characters</p>
                        )}
                    </div>

                    {/* Submit button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition disabled:opacity-60 shadow-md"
                    >
                        {loading ? "Signing up..." : "Sign Up"}
                    </button>
                </form>

                {/* Login link */}
                <p className="text-center text-sm mt-6 text-gray-700">
                    Already have an account?{" "}
                    <button
                        className="text-blue-600 hover:underline cursor-pointer"
                        onClick={() => router.push("/login")}
                    >
                        Log in
                    </button>
                </p>
            </div>
        </div>
    );
}

export default function SignupPage() {
    return (
        <ReCaptchaProvider>
            <SignupContent />
        </ReCaptchaProvider>
    );
}
