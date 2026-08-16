"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { walletApiClient } from "@/services/wallet/walletApi.client";
import { useWallet } from "@/context/WalletContext";
import type { WalletPaymentQuote } from "@/services/wallet/types";
import { formatFixed } from "@/lib/utils/money";

/**
 * Pay for an order from the wallet.
 *
 * The amount comes from the server's quote, never from converting the displayed price
 * here. Client-side rates can be stale, and showing one figure while charging another
 * is exactly the kind of mismatch that generates support tickets.
 */
export default function WalletCheckout({
    orderId,
    onSuccess,
    onError,
}: {
    orderId: string;
    onSuccess: () => void;
    onError?: () => void;
}) {
    const { refresh } = useWallet();
    const [quote, setQuote] = useState<WalletPaymentQuote | null>(null);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const res = await walletApiClient.quotePayment(orderId);
                if (!cancelled && res.success) setQuote(res.data);
            } catch {
                if (!cancelled) setQuote(null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [orderId]);

    const handlePay = async () => {
        setPaying(true);
        try {
            const res = await walletApiClient.payWithWallet(orderId);
            if (res.success) {
                await refresh();
                toast.success("Paid from wallet");
                onSuccess();
            }
        } catch (err) {
            const message =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                "Payment failed. Please try again.";
            toast.error(message);
            onError?.();
        } finally {
            setPaying(false);
        }
    };

    if (loading) {
        return <div className="h-24 animate-pulse rounded-xl bg-muted" />;
    }

    if (!quote || !quote.available) {
        return (
            <p className="rounded-xl bg-muted px-3 py-3 text-center text-sm text-muted-foreground">
                Wallet payments are currently unavailable.
            </p>
        );
    }

    const shortfall = quote.shortfallPaise / 100;

    return (
        <div className="space-y-3">
            <div className="rounded-xl border border-border p-3.5">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Amount to pay</span>
                    <span className="font-semibold">
                        {formatFixed(quote.amountPaise / 100, "INR")}
                    </span>
                </div>

                <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Wallet balance</span>
                    <span className={quote.sufficient ? "" : "text-red-600"}>
                        {formatFixed(quote.balancePaise / 100, "INR")}
                    </span>
                </div>

                {quote.sufficient && (
                    <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-sm">
                        <span className="text-muted-foreground">Balance after</span>
                        <span>
                            {formatFixed((quote.balancePaise - quote.amountPaise) / 100, "INR")}
                        </span>
                    </div>
                )}
            </div>

            {quote.sufficient ? (
                <button
                    type="button"
                    onClick={handlePay}
                    disabled={paying}
                    className="w-full rounded-md bg-secondary px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {paying ? "Paying…" : `Pay ${formatFixed(quote.amountPaise / 100, "INR")}`}
                </button>
            ) : (
                <div className="space-y-2">
                    <p className="text-center text-sm text-muted-foreground">
                        You need {formatFixed(shortfall, "INR")} more to pay for this order.
                    </p>
                    <Link
                        href="/account/wallet/add"
                        className="block w-full rounded-md border-2 border-secondary px-4 py-3 text-center font-semibold text-secondary transition hover:bg-secondary/5"
                    >
                        Add money to wallet
                    </Link>
                </div>
            )}
        </div>
    );
}
