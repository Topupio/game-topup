"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { clientApi } from "@/lib/http";
import { AxiosError } from "axios";

export default function VerifyEmailPage() {
    const { token } = useParams();
    const router = useRouter();

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!token) return;

        const verify = async () => {
            try {
                const res = await clientApi.get(`/api/auth/verify-email/${token}`);
                setMessage(res.data.message || "Email verified successfully");
                setStatus("success");

                setTimeout(() => router.push("/login"), 2500);
            } catch (err: unknown) {
                const error = err as AxiosError<{ message: string }>;
                setMessage(error.response?.data?.message || "Verification failed");
                setStatus("error");
            }
        };

        verify();
    }, [token, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted px-4">
            <div className="w-full max-w-md bg-card rounded-2xl p-8 shadow-xl text-center">

                {status === "loading" && (
                    <>
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-foreground">Verifying your email…</h2>
                    </>
                )}

                {status === "success" && (
                    <>
                        <h2 className="text-2xl font-bold text-green-600 mb-2">Email Verified 🎉</h2>
                        <p className="text-muted-foreground">{message}</p>
                        <p className="text-sm mt-4 text-muted-foreground">Redirecting to login…</p>
                    </>
                )}

                {status === "error" && (
                    <>
                        <h2 className="text-2xl font-bold text-red-600 mb-2">Verification Failed</h2>
                        <p className="text-muted-foreground mb-6">{message}</p>
                        <button
                            onClick={() => router.push("/resend-verification")}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                        >
                            Resend Verification Email
                        </button>
                    </>
                )}

            </div>
        </div>
    );
}