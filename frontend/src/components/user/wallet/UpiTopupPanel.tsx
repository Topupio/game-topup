"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { RiFileCopyLine, RiCheckLine } from "react-icons/ri";
import { walletApiClient } from "@/services/wallet/walletApi.client";
import type { UpiTopupSession } from "@/services/wallet/types";
import { formatFixed } from "@/lib/utils/money";

/**
 * Pay by UPI, then submit the UTR.
 *
 * The wallet is not credited here. The customer states they have paid, and an admin
 * checks the UTR against the bank before any money appears — same manual verification
 * the order flow uses.
 */
export default function UpiTopupPanel({
    session,
    onDone,
    onCancel,
}: {
    session: UpiTopupSession;
    onDone: () => void;
    onCancel: () => void;
}) {
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
    const [utr, setUtr] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const qrModule = await import("qrcode");
                const dataUrl = await qrModule.toDataURL(session.qrPayload, {
                    width: 256,
                    margin: 2,
                    errorCorrectionLevel: "M",
                    color: { dark: "#111827", light: "#FFFFFF" },
                });
                if (!cancelled) setQrDataUrl(dataUrl);
            } catch {
                // The UPI id below is enough to pay without a QR code.
            }
        })();

        return () => { cancelled = true; };
    }, [session.qrPayload]);

    const copyUpiId = async () => {
        try {
            await navigator.clipboard.writeText(session.upiId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Could not copy. Please copy the UPI ID manually.");
        }
    };

    const submitUtr = async () => {
        const trimmed = utr.trim();

        if (!/^\d{12}$/.test(trimmed)) {
            toast.error("UTR must be exactly 12 digits");
            return;
        }

        setSubmitting(true);
        try {
            const res = await walletApiClient.submitUtr(session.topupId, trimmed);
            if (res.success) {
                toast.success("Submitted. Your wallet will be credited once verified.");
                onDone();
            }
        } catch (err) {
            const message =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                "Could not submit the UTR. Please try again.";
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="text-center">
                <p className="text-sm text-gray-500">Adding to wallet</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                    {formatFixed(session.amountInr, "INR")}
                </p>
                <p className="mt-1 text-xs text-gray-400">Reference {session.topupRef}</p>
            </div>

            {/* Step 1 — pay */}
            <div className="mt-5 rounded-xl border border-gray-200 p-4">
                <p className="text-sm font-medium text-gray-900">1. Pay using any UPI app</p>

                <div className="mt-3 flex flex-col items-center gap-3">
                    {qrDataUrl ? (
                        <Image
                            src={qrDataUrl}
                            alt={`UPI QR code for ${formatFixed(session.amountInr, "INR")}`}
                            width={200}
                            height={200}
                            unoptimized
                            className="rounded-lg border border-gray-100"
                        />
                    ) : (
                        <div className="h-[200px] w-[200px] animate-pulse rounded-lg bg-gray-100" />
                    )}

                    <div className="flex w-full items-center justify-between gap-2 rounded-lg bg-gray-50 px-3 py-2">
                        <span className="truncate text-sm text-gray-700">{session.upiId}</span>
                        <button
                            onClick={copyUpiId}
                            className="shrink-0 text-gray-400 transition-colors hover:text-gray-900"
                            aria-label="Copy UPI ID"
                        >
                            {copied ? <RiCheckLine className="text-green-600" /> : <RiFileCopyLine />}
                        </button>
                    </div>

                    <a
                        href={session.deepLink}
                        className="w-full rounded-xl border border-secondary py-2.5 text-center text-sm font-semibold text-secondary transition-colors hover:bg-secondary/5 sm:hidden"
                    >
                        Open UPI app
                    </a>
                </div>

                {session.instructions && (
                    <p className="mt-3 text-xs text-gray-500">{session.instructions}</p>
                )}
            </div>

            {/* Step 2 — prove it */}
            <div className="mt-4 rounded-xl border border-gray-200 p-4">
                <label htmlFor="utr" className="text-sm font-medium text-gray-900">
                    2. Enter the 12-digit UTR from your payment
                </label>

                <input
                    id="utr"
                    value={utr}
                    onChange={(e) => setUtr(e.target.value.replace(/\D/g, "").slice(0, 12))}
                    inputMode="numeric"
                    placeholder="123456789012"
                    className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-3 text-sm tracking-wide outline-none focus:border-secondary"
                />

                <p className="mt-1.5 text-xs text-gray-500">
                    Shown as the reference or transaction ID in your UPI app.
                </p>

                <button
                    onClick={submitUtr}
                    disabled={submitting || utr.trim().length !== 12}
                    className="mt-3 w-full rounded-xl bg-secondary py-3 text-sm font-semibold text-white transition-colors hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {submitting ? "Submitting…" : "Submit UTR"}
                </button>
            </div>

            <p className="mt-4 text-center text-xs text-gray-500">
                Your wallet is credited after an admin verifies the payment, usually within a
                few hours.
            </p>

            <button
                onClick={onCancel}
                className="mt-3 w-full text-center text-sm text-gray-500 transition-colors hover:text-gray-900"
            >
                Change amount
            </button>
        </div>
    );
}
