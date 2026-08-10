"use client";

import { useState } from "react";
import axios from "axios";
import { paymentsApiClient } from "@/services/payments/paymentsApi.client";

interface Props {
    orderId: string;
    amount: string;
    symbol: string;
    onSuccess: () => void;
    onError: (error: unknown) => void;
    onCancel: () => void;
}

export default function NowPaymentsCheckout({
    orderId,
    amount,
    symbol,
    onError,
}: Props) {
    const [isLoading, setIsLoading] = useState(false);

    const handlePayWithCrypto = async () => {
        setIsLoading(true);
        try {
            const res = await paymentsApiClient.createNowPaymentsInvoice(orderId);
            if (res.success && res.invoiceUrl) {
                // Redirect to NOWPayments hosted checkout page
                window.location.href = res.invoiceUrl;
            } else {
                onError(new Error(res.message || "Failed to create crypto payment invoice"));
            }
        } catch (err) {
            // Non-2xx responses reject, so the server's reason lives on the error,
            // not on `res`. Surface it (AMOUNT_TOO_LOW, expired order, already paid,
            // gateway failure) instead of a generic message.
            const serverMessage = axios.isAxiosError(err)
                ? (err.response?.data as { message?: string; code?: string } | undefined)
                      ?.message
                : undefined;
            onError(serverMessage ? new Error(serverMessage) : err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {(symbol || amount) && (
                <div className="text-center">
                    <p className="text-muted-foreground text-sm">
                        Pay{" "}
                        <span className="text-foreground font-bold text-lg">
                            {symbol}
                            {amount}
                        </span>{" "}
                        with Cryptocurrency
                    </p>
                </div>
            )}

            <button
                onClick={handlePayWithCrypto}
                disabled={isLoading}
                className="w-full bg-secondary hover:opacity-90 text-white font-semibold py-3 px-4 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isLoading ? (
                    <>
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Creating invoice...
                    </>
                ) : (
                    "Pay with Cryptocurrency"
                )}
            </button>

            <p className="text-xs text-muted-foreground text-center">
                You will be redirected to NOWPayments to complete your payment with BTC, ETH, USDT, TRX, and other cryptocurrencies.
            </p>
        </div>
    );
}
