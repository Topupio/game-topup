"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiMail, FiRefreshCw } from "react-icons/fi";

function CheckEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "your email";

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
            <div className="w-full max-w-md bg-card rounded-2xl shadow-2xl p-8 text-center">

                {/* Email Icon */}
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiMail className="text-blue-600 text-4xl" />
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-foreground mb-3">
                    Check Your Email
                </h1>

                {/* Message */}
                <p className="text-muted-foreground mb-2">
                    We've sent a verification link to:
                </p>
                <p className="text-blue-600 font-semibold mb-6">
                    {email}
                </p>

                <p className="text-sm text-muted-foreground mb-8">
                    Click the link in the email to verify your account and complete your registration.
                </p>

                {/* Divider */}
                <div className="border-t border-border my-6"></div>

                {/* Actions */}
                <div className="space-y-3">
                    <button
                        onClick={() => router.push("/resend-verification")}
                        className="w-full flex items-center justify-center gap-2 bg-muted hover:bg-muted text-foreground py-2.5 rounded-lg font-medium transition"
                    >
                        <FiRefreshCw className="text-lg" />
                        Resend Verification Email
                    </button>

                    <button
                        onClick={() => router.push("/login")}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition"
                    >
                        Go to Login
                    </button>
                </div>

                {/* Help Text */}
                <p className="text-xs text-muted-foreground mt-6">
                    Didn't receive the email? Check your spam folder or click "Resend Verification Email"
                </p>
            </div>
        </div>
    );
}

export default function CheckEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="text-blue-600">Loading...</div>
            </div>
        }>
            <CheckEmailContent />
        </Suspense>
    );
}
