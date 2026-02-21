"use client";

import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { paymentsApiClient } from "@/services/payments/paymentsApi.client";

interface Props {
    orderId: string;
    amount: string;
    symbol: string;
    onSuccess: () => void;
    onError: (error: any) => void;
    onCancel: () => void;
}

export default function PayPalCheckout({
    orderId,
    amount,
    symbol,
    onSuccess,
    onError,
    onCancel,
}: Props) {
    const [{ isPending, isRejected }] = usePayPalScriptReducer();

    if (isPending) {
        return (
            <div className="flex items-center justify-center py-8">
                <span className="w-6 h-6 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                <span className="ml-3 text-muted-foreground text-sm">
                    Loading payment options...
                </span>
            </div>
        );
    }

    if (isRejected) {
        return (
            <div className="text-center py-6">
                <p className="text-red-400 text-sm">
                    Failed to load payment options. Please refresh and try
                    again.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="text-center">
                <p className="text-muted-foreground text-sm">
                    Pay{" "}
                    <span className="text-foreground font-bold text-lg">
                        {symbol}
                        {amount}
                    </span>{" "}
                    via PayPal
                </p>
            </div>

            <PayPalButtons
                style={{
                    layout: "vertical",
                    color: "gold",
                    shape: "rect",
                    label: "paypal",
                    tagline: false,
                }}
                createOrder={async () => {
                    const res =
                        await paymentsApiClient.createPayPalOrder(orderId);
                    if (!res.success || !res.paypalOrderId) {
                        throw new Error("Failed to create PayPal order");
                    }
                    return res.paypalOrderId;
                }}
                onApprove={async (data) => {
                    const res = await paymentsApiClient.capturePayPalOrder(
                        data.orderID,
                        orderId
                    );
                    if (res.success) {
                        onSuccess();
                    } else {
                        onError(
                            new Error(res.message || "Payment capture failed")
                        );
                    }
                }}
                onError={(err) => {
                    console.error("PayPal error:", err);
                    onError(err);
                }}
                onCancel={() => onCancel()}
            />
        </div>
    );
}
