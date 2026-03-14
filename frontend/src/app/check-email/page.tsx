"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiMail, FiRefreshCw } from "react-icons/fi";

function CheckEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "your email";

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-primary">
            <div className="w-full max-w-md bg-primary/40 border border-white/10 backdrop-blur-xl shadow-2xl rounded-2xl p-8 text-center">

                {/* Email Icon */}
                <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiMail className="text-secondary text-4xl" />
                </div>

                {/* Title */}
                <h2 className="text-3xl font-bold text-tertiary/80 mb-3">
                    Check Your Email
                </h2>

                {/* Message */}
                <p className="text-gray-300 mb-2">
                    We&apos;ve sent a verification link to:
                </p>
                <p className="text-secondary font-semibold mb-6">
                    {email}
                </p>

                <p className="text-sm text-gray-400 mb-8">
                    Click the link in the email to verify your account and complete your registration.
                </p>

                {/* Divider */}
                <div className="flex items-center my-6">
                    <div className="flex-1 h-px bg-white/10"></div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <button
                        onClick={() => router.push("/resend-verification")}
                        className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-200 py-2.5 rounded-lg font-medium transition"
                    >
                        <FiRefreshCw className="text-lg" />
                        Resend Verification Email
                    </button>

                    <button
                        onClick={() => router.push("/login")}
                        className="w-full bg-tertiary/80 hover:bg-tertiary text-primary py-2.5 rounded-lg font-semibold transition shadow-md"
                    >
                        Go to Login
                    </button>
                </div>

                {/* Help Text */}
                <p className="text-xs text-gray-500 mt-6">
                    Didn&apos;t receive the email? Check your spam folder or click &quot;Resend Verification Email&quot;
                </p>
            </div>
        </div>
    );
}

export default function CheckEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-primary">
                <div className="text-secondary">Loading...</div>
            </div>
        }>
            <CheckEmailContent />
        </Suspense>
    );
}
