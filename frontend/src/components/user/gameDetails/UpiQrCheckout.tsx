"use client";

import { useEffect, useRef, useState } from "react";
import { paymentsApiClient } from "@/services/payments/paymentsApi.client";
import { UpiPaymentInitData } from "@/services/payments/types";
import { toast } from "react-toastify";
import {
    RiBankCardLine,
    RiCheckboxCircleLine,
    RiCheckLine,
    RiFileCopyLine,
    RiLoader4Line,
    RiQrCodeLine,
    RiShieldCheckLine,
    RiSmartphoneLine,
} from "react-icons/ri";
import { IoWarningOutline } from "react-icons/io5";

interface Props {
    orderId: string;
    onUtrSubmitted?: () => void;
}

const UTR_REGEX = /^\d{12}$/;

function getErrorMessage(error: unknown, fallback: string) {
    if (typeof error === "object" && error !== null && "response" in error) {
        const response = (error as {
            response?: { data?: { message?: string } };
        }).response;

        if (response?.data?.message) {
            return response.data.message;
        }
    }

    if (error instanceof Error && error.message) {
        return error.message;
    }

    return fallback;
}

export default function UpiQrCheckout({ orderId, onUtrSubmitted }: Props) {
    const [loading, setLoading] = useState(true);
    const [paymentData, setPaymentData] = useState<UpiPaymentInitData | null>(null);
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
    const [error, setError] = useState("");

    const [utrValue, setUtrValue] = useState("");
    const [utrTouched, setUtrTouched] = useState(false);
    const [utrSubmitting, setUtrSubmitting] = useState(false);
    const [utrSubmitted, setUtrSubmitted] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);

    const utrIsValid = UTR_REGEX.test(utrValue);
    const showUtrError = utrTouched && utrValue.length > 0 && !utrIsValid;

    useEffect(() => {
        let cancelled = false;

        const loadUpiSession = async () => {
            setLoading(true);
            setError("");

            try {
                const res = await paymentsApiClient.initiateUpiPayment(orderId);
                if (cancelled) return;

                setPaymentData(res.data);

                const qrModule = await import("qrcode");
                const dataUrl = await qrModule.toDataURL(res.data.qrPayload, {
                    width: 256,
                    margin: 2,
                    errorCorrectionLevel: "M",
                    color: {
                        dark: "#111827",
                        light: "#FFFFFF",
                    },
                });

                if (!cancelled) {
                    setQrCodeDataUrl(dataUrl);
                }
            } catch (err: unknown) {
                if (cancelled) return;

                const message = getErrorMessage(err, "Failed to load UPI QR payment");
                setError(message);
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadUpiSession();

        return () => {
            cancelled = true;
        };
    }, [orderId]);

    const handleCopy = async (value: string, label: string) => {
        try {
            await navigator.clipboard.writeText(value);
            toast.success(`${label} copied`);
        } catch {
            toast.error(`Failed to copy ${label.toLowerCase()}`);
        }
    };

    const handleUtrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, "").slice(0, 12);
        setUtrValue(raw);
        if (!utrTouched && raw.length > 0) {
            setUtrTouched(true);
        }
    };

    const handleUtrBlur = () => {
        if (utrValue.length > 0) {
            setUtrTouched(true);
        }
    };

    const handleUtrSubmit = async () => {
        if (!utrIsValid || utrSubmitting) return;

        setUtrSubmitting(true);
        try {
            await paymentsApiClient.submitUtrNumber(orderId, utrValue);
            setUtrSubmitted(true);
            onUtrSubmitted?.();
        } catch (err: unknown) {
            const message = getErrorMessage(err, "Failed to submit UTR. Please try again.");
            toast.error(message);
        } finally {
            setUtrSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                    <RiLoader4Line className="animate-spin text-2xl text-muted-foreground" />
                </div>
                <p className="text-sm font-semibold text-foreground">
                    Generating secure UPI QR
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    We&apos;re preparing a payment link with your exact order amount and reference.
                </p>
            </div>
        );
    }

    if (error || !paymentData) {
        return (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-center">
                <p className="text-sm font-semibold text-red-700">
                    UPI QR unavailable
                </p>
                <p className="mt-1 text-xs leading-relaxed text-red-600">
                    {error || "Please try another payment method for now."}
                </p>
            </div>
        );
    }

    const amountLabel = `${paymentData.currency} ${paymentData.amount.toFixed(2)}`;
    const convertedNote = paymentData.originalCurrency === "INR"
        ? null
        : `Converted from ${paymentData.originalCurrency} ${paymentData.originalAmount.toFixed(2)}`;

    const inputBorderClass = utrIsValid
        ? "border-green-500 focus:ring-green-500/20 focus:border-green-500"
        : showUtrError
            ? "border-red-400 focus:ring-red-400/20 focus:border-red-400"
            : "border-border focus:ring-secondary/20 focus:border-secondary";

    const submitDisabled = !utrIsValid || utrSubmitting;

    return (
        <div className="space-y-3">
            {/* Main card: amount → QR → details stacked vertically */}
            <div className="rounded-xl border border-border bg-card p-3">
                <div className="flex flex-col space-y-3">
                    {/* Badge + amount */}
                    <div>
                        <div className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-green-700">
                            <RiShieldCheckLine className="shrink-0" />
                            Dynamic QR
                        </div>
                        <p className="mt-1.5 text-lg font-bold leading-tight text-foreground">
                            ₹{paymentData.amount.toFixed(2)}
                        </p>
                        {convertedNote && (
                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                                {convertedNote}
                            </p>
                        )}
                    </div>

                    {/* QR code — centered */}
                    <div className="flex flex-col items-center">
                        <div className="rounded-xl border border-border bg-white p-2 shadow-sm">
                            {qrCodeDataUrl ? (
                                <img
                                    src={qrCodeDataUrl}
                                    alt={`UPI QR for order ${paymentData.orderReference}`}
                                    className="h-40 w-40 rounded-lg"
                                />
                            ) : (
                                <div className="flex h-40 w-40 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                    <RiQrCodeLine className="text-4xl" />
                                </div>
                            )}
                        </div>
                        <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                            Scan &amp; pay
                        </p>
                    </div>

                    {/* Detail rows */}
                    <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2 rounded-lg bg-muted/50 px-2 py-1">
                            <span className="shrink-0 text-xs text-muted-foreground">Payee</span>
                            <span className="truncate text-right text-xs font-semibold text-foreground max-w-[150px]">
                                {paymentData.payeeName}
                            </span>
                        </div>
                        <div className="flex items-center justify-between gap-2 rounded-lg bg-muted/50 px-2 py-1">
                            <span className="shrink-0 text-xs text-muted-foreground">UPI ID</span>
                            <button
                                type="button"
                                onClick={() => handleCopy(paymentData.upiId, "UPI ID")}
                                className="flex min-w-0 items-center gap-1 text-xs font-semibold text-secondary transition active:opacity-60"
                            >
                                <span className="truncate max-w-[150px]">{paymentData.upiId}</span>
                                <RiFileCopyLine className="shrink-0 text-xs" />
                            </button>
                        </div>
                        <div className="flex items-center justify-between gap-2 rounded-lg bg-muted/50 px-2 py-1">
                            <span className="shrink-0 text-xs text-muted-foreground">Ref</span>
                            <button
                                type="button"
                                onClick={() => handleCopy(paymentData.reference, "Reference")}
                                className="flex items-center gap-1 text-xs font-semibold text-secondary transition active:opacity-60"
                            >
                                <span className="truncate max-w-[150px]">{paymentData.reference}</span>
                                <RiFileCopyLine className="shrink-0 text-xs" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2">
                <a
                    href={paymentData.deepLink}
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-secondary px-3 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98]"
                >
                    <RiSmartphoneLine className="shrink-0" />
                    Open UPI App
                </a>
                <button
                    type="button"
                    onClick={() => handleCopy(paymentData.deepLink, "UPI payment link")}
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted active:scale-[0.98]"
                >
                    <RiBankCardLine className="shrink-0" />
                    Copy Link
                </button>
            </div>

            {/* UTR submission section */}
            <div className="rounded-xl border border-border bg-card p-3">
                {utrSubmitted ? (
                    <div className="flex items-start gap-2.5">
                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100">
                            <RiCheckLine className="text-sm text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-green-800">
                                UTR submitted
                            </p>
                            <p className="mt-0.5 text-xs leading-relaxed text-green-700">
                                We&apos;ll verify and update your order shortly.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2.5">
                        <div className="flex items-center gap-1.5">
                            <RiCheckboxCircleLine className="shrink-0 text-sm text-secondary" />
                            <p className="text-sm font-semibold text-foreground">
                                Already paid? Enter UTR number
                            </p>
                        </div>

                        <div className="space-y-1.5">
                            <div className="relative">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    inputMode="numeric"
                                    value={utrValue}
                                    onChange={handleUtrChange}
                                    onBlur={handleUtrBlur}
                                    placeholder="e.g. 427391820394"
                                    maxLength={12}
                                    aria-label="UTR / Transaction ID"
                                    aria-describedby="utr-hint utr-error"
                                    aria-invalid={showUtrError}
                                    className={[
                                        "w-full rounded-lg border bg-muted/40 px-3 py-2.5 pr-9 text-sm font-mono",
                                        "text-foreground placeholder:text-muted-foreground/50",
                                        "outline-none ring-2 ring-transparent transition-all",
                                        inputBorderClass,
                                    ].join(" ")}
                                />
                                {utrIsValid && (
                                    <RiCheckboxCircleLine
                                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-base text-green-500"
                                        aria-hidden="true"
                                    />
                                )}
                            </div>

                            <p id="utr-hint" className="text-[11px] text-muted-foreground">
                                12-digit number from your UPI app
                            </p>

                            {showUtrError && (
                                <p id="utr-error" role="alert" className="text-[11px] font-medium text-red-500">
                                    Must be exactly 12 digits
                                </p>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={handleUtrSubmit}
                            disabled={submitDisabled}
                            aria-busy={utrSubmitting}
                            className={[
                                "flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition",
                                submitDisabled
                                    ? "cursor-not-allowed bg-muted text-muted-foreground opacity-50"
                                    : "bg-secondary text-white hover:opacity-90 active:scale-[0.98]",
                            ].join(" ")}
                        >
                            {utrSubmitting ? (
                                <>
                                    <RiLoader4Line className="animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                "Submit UTR"
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* Verification note — collapsed, minimal */}
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
                <div className="flex items-start gap-2">
                    <IoWarningOutline className="mt-0.5 shrink-0 text-sm text-amber-600" />
                    <div>
                        <p className="text-xs font-semibold text-amber-900">
                            Pay exactly {amountLabel} — order verified manually.
                        </p>
                        <p className="mt-0.5 text-[11px] leading-relaxed text-amber-800">
                            Never share your UPI PIN, OTP, or card details on this page.
                        </p>
                        {paymentData.instructions && (
                            <p className="mt-0.5 text-[11px] leading-relaxed text-amber-800">
                                {paymentData.instructions}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
