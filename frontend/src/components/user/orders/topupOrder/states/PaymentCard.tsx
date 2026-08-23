"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import UpiQrCheckout from "@/components/user/gameDetails/UpiQrCheckout";
import NowPaymentsCheckout from "@/components/user/gameDetails/NowPaymentsCheckout";
import { Order } from "@/services/orders/types";

interface Props {
    order: Order;
    onUtrSubmitted: () => void;
}

/**
 * The expanded "complete payment" card for an order with nothing paid yet. Keeps the
 * UPI/crypto toggle from the original layout — only the framing changed.
 */
export default function PaymentCard({ order, onUtrSubmitted }: Props) {
    const [method, setMethod] = useState<"upi" | "crypto">(
        order.paymentMethod === "nowpayments" ? "crypto" : "upi"
    );

    return (
        <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="rounded-2xl border border-secondary/20 bg-card p-5 shadow-soft sm:p-6"
        >
            <h2 className="text-lg font-extrabold leading-tight tracking-tight text-foreground sm:text-xl">
                Complete payment
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                Pay with any UPI app or crypto. Your top-up starts the moment we verify it.
            </p>

            <div className="mb-5 mt-4 grid grid-cols-2 gap-1.5 rounded-xl bg-muted p-1">
                {(["upi", "crypto"] as const).map((option) => (
                    <button
                        key={option}
                        type="button"
                        onClick={() => setMethod(option)}
                        aria-pressed={method === option}
                        className={`rounded-lg py-2.5 text-xs font-bold tracking-tight transition sm:text-sm ${
                            method === option
                                ? "bg-secondary text-white shadow-sm"
                                : "text-muted-foreground hover:bg-card"
                        }`}
                    >
                        {option === "upi" ? "UPI QR" : "Crypto"}
                    </button>
                ))}
            </div>

            {method === "upi" ? (
                <UpiQrCheckout orderId={order._id} onUtrSubmitted={onUtrSubmitted} />
            ) : (
                <NowPaymentsCheckout
                    orderId={order._id}
                    amount=""
                    symbol=""
                    onSuccess={() => {
                        toast.success("Payment initiated!");
                        window.location.reload();
                    }}
                    onError={() => {
                        toast.error("Failed to create crypto payment. Please try again.");
                    }}
                    onCancel={() => {
                        toast.info("Payment cancelled.");
                    }}
                />
            )}
        </motion.section>
    );
}
