"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { RiArrowLeftLine, RiQrCodeLine, RiCopperCoinLine } from "react-icons/ri";
import { useWallet } from "@/context/WalletContext";
import { walletApiClient } from "@/services/wallet/walletApi.client";
import type { TopupMethod, UpiTopupSession } from "@/services/wallet/types";
import { formatFixed } from "@/lib/utils/money";
import UpiTopupPanel from "./UpiTopupPanel";

const QUICK_AMOUNTS_INR = [200, 500, 1000, 2000];

/** Read a server error message, falling back to something the user can act on. */
function errorMessage(err: unknown, fallback: string) {
    const response = (err as { response?: { data?: { message?: string } } })?.response;
    return response?.data?.message || fallback;
}

export default function AddMoneyFlow() {
    const router = useRouter();
    const { settings, refresh } = useWallet();

    const [amountInr, setAmountInr] = useState<string>("");
    const [method, setMethod] = useState<TopupMethod>("upi");
    const [submitting, setSubmitting] = useState(false);
    const [session, setSession] = useState<UpiTopupSession | null>(null);

    // Redirect out if the feature is off, rather than showing a form that cannot submit.
    useEffect(() => {
        if (settings && !settings.enabled) {
            router.replace("/account/wallet");
        }
    }, [settings, router]);

    // Default to whichever method is actually switched on.
    useEffect(() => {
        if (!settings) return;
        if (!settings.upiTopupEnabled && settings.usdtTopupEnabled) setMethod("usdt");
    }, [settings]);

    const amountPaise = useMemo(() => {
        const parsed = Number(amountInr);
        if (!Number.isFinite(parsed) || parsed <= 0) return 0;
        return Math.round(parsed * 100);
    }, [amountInr]);

    const minPaise = settings?.minTopupPaise ?? 10_000;
    const maxPaise = settings?.maxTopupPaise ?? 5_000_000;

    // Mirrors the server's limits so the user gets feedback before submitting. The
    // server checks again — this is convenience, not enforcement.
    const validationError = useMemo(() => {
        if (!amountPaise) return null;
        if (amountPaise < minPaise) return `Minimum is ${formatFixed(minPaise / 100, "INR")}`;
        if (amountPaise > maxPaise) return `Maximum is ${formatFixed(maxPaise / 100, "INR")}`;
        return null;
    }, [amountPaise, minPaise, maxPaise]);

    const canSubmit = amountPaise > 0 && !validationError && !submitting;

    const handleSubmit = async () => {
        if (!canSubmit) return;

        setSubmitting(true);
        try {
            if (method === "upi") {
                const res = await walletApiClient.startUpiTopup(amountPaise);
                if (res.success) setSession(res.data);
            } else {
                const res = await walletApiClient.startCryptoTopup(amountPaise);
                if (res.success && res.data.invoiceUrl) {
                    // The provider hosts the payment page; we hand the customer over.
                    window.location.href = res.data.invoiceUrl;
                }
            }
        } catch (err) {
            toast.error(errorMessage(err, "Could not start the top-up. Please try again."));
        } finally {
            setSubmitting(false);
        }
    };

    if (session) {
        return (
            <UpiTopupPanel
                session={session}
                onDone={async () => {
                    await refresh();
                    router.push("/account/wallet");
                }}
                onCancel={() => setSession(null)}
            />
        );
    }

    const upiOn = settings?.upiTopupEnabled ?? false;
    const usdtOn = settings?.usdtTopupEnabled ?? false;

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <button
                onClick={() => router.push("/account/wallet")}
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-900"
            >
                <RiArrowLeftLine />
                Back to wallet
            </button>

            <h1 className="mt-4 text-lg font-semibold text-gray-900 sm:text-xl">Add Money</h1>
            <p className="mt-1 text-sm text-gray-500">
                Added in Indian Rupees. Balance can be spent on any order.
            </p>

            {/* Amount */}
            <div className="mt-5">
                <label htmlFor="topup-amount" className="text-sm font-medium text-gray-900">
                    Amount
                </label>

                <div className="mt-2 flex items-center rounded-xl border border-gray-200 px-3 focus-within:border-secondary">
                    <span className="text-gray-500">₹</span>
                    <input
                        id="topup-amount"
                        type="number"
                        inputMode="numeric"
                        min={minPaise / 100}
                        max={maxPaise / 100}
                        value={amountInr}
                        onChange={(e) => setAmountInr(e.target.value)}
                        placeholder="0"
                        className="w-full bg-transparent px-2 py-3 text-lg font-semibold text-gray-900 outline-none"
                    />
                </div>

                {validationError && (
                    <p className="mt-1.5 text-xs text-red-600">{validationError}</p>
                )}

                <div className="mt-3 flex flex-wrap gap-2">
                    {QUICK_AMOUNTS_INR.map((value) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setAmountInr(String(value))}
                            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                                Number(amountInr) === value
                                    ? "border-secondary bg-secondary/5 text-secondary"
                                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                            ₹{value}
                        </button>
                    ))}
                </div>
            </div>

            {/* Method */}
            <div className="mt-6">
                <p className="text-sm font-medium text-gray-900">Payment method</p>

                <div className="mt-2 space-y-2">
                    <MethodOption
                        selected={method === "upi"}
                        disabled={!upiOn}
                        onSelect={() => setMethod("upi")}
                        icon={<RiQrCodeLine className="text-xl" />}
                        title="UPI"
                        subtitle={upiOn ? "Scan a QR code, then enter your UTR" : "Currently unavailable"}
                    />

                    <MethodOption
                        selected={method === "usdt"}
                        disabled={!usdtOn}
                        onSelect={() => setMethod("usdt")}
                        icon={<RiCopperCoinLine className="text-xl" />}
                        title="Crypto (USDT)"
                        subtitle={
                            usdtOn
                                ? "Credited automatically once the payment settles"
                                : "Currently unavailable"
                        }
                    />
                </div>
            </div>

            <button
                onClick={handleSubmit}
                disabled={!canSubmit || (method === "upi" ? !upiOn : !usdtOn)}
                className="mt-6 w-full rounded-xl bg-secondary py-3 text-sm font-semibold text-white transition-colors hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {submitting ? "Starting…" : "Continue"}
            </button>

            <p className="mt-3 text-center text-xs text-gray-400">
                Wallet balance is store credit and cannot be withdrawn.
            </p>
        </div>
    );
}

function MethodOption({
    selected,
    disabled,
    onSelect,
    icon,
    title,
    subtitle,
}: {
    selected: boolean;
    disabled: boolean;
    onSelect: () => void;
    icon: React.ReactNode;
    title: string;
    subtitle: string;
}) {
    return (
        <button
            type="button"
            onClick={onSelect}
            disabled={disabled}
            className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                disabled
                    ? "cursor-not-allowed border-gray-200 opacity-50"
                    : selected
                        ? "border-secondary bg-secondary/5"
                        : "border-gray-200 hover:bg-gray-50"
            }`}
        >
            <span className={selected ? "text-secondary" : "text-gray-400"}>{icon}</span>
            <span className="min-w-0">
                <span className="block text-sm font-medium text-gray-900">{title}</span>
                <span className="block text-xs text-gray-500">{subtitle}</span>
            </span>
        </button>
    );
}
