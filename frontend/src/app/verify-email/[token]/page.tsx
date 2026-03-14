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
        <div className="min-h-screen flex items-center justify-center px-4 bg-primary">
            <div className="w-full max-w-md bg-primary/40 border border-white/10 backdrop-blur-xl shadow-2xl rounded-2xl p-8 text-center">

                {status === "loading" && (
                    <>
                        <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-200">Verifying your email…</h2>
                    </>
                )}

                {status === "success" && (
                    <>
                        <h2 className="text-2xl font-bold text-green-400 mb-2">Email Verified</h2>
                        <p className="text-gray-300">{message}</p>
                        <p className="text-sm mt-4 text-gray-400">Redirecting to login…</p>
                    </>
                )}

                {status === "error" && (
                    <>
                        <h2 className="text-2xl font-bold text-red-400 mb-2">Verification Failed</h2>
                        <p className="text-gray-300 mb-6">{message}</p>
                        <button
                            onClick={() => router.push("/resend-verification")}
                            className="bg-tertiary/80 hover:bg-tertiary text-primary px-6 py-2.5 rounded-lg font-semibold transition shadow-md"
                        >
                            Resend Verification Email
                        </button>
                    </>
                )}

            </div>
        </div>
    );
}
