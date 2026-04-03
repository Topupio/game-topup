"use client";

import { useState } from "react";
import { RegionPricing } from "@/lib/types/game";
import { useCurrency } from "@/context/CurrencyContext";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import PayPalCheckout from "./PayPalCheckout";
import NowPaymentsCheckout from "./NowPaymentsCheckout";
import UpiQrDetailsModal from "./UpiQrDetailsModal";
import { FaPaypal, FaBitcoin, FaEthereum } from "react-icons/fa";
import { SiTether } from "react-icons/si";
import { IoQrCode } from "react-icons/io5";

interface PendingOrder {
    _id: string;
    orderId: string;
}

interface PaymentModalProps {
    pendingOrder: PendingOrder;
    selectedPricing: RegionPricing;
    qty: number;
    onClose: () => void;
}

export default function PaymentModal({
    pendingOrder,
    selectedPricing,
    qty,
    onClose,
}: PaymentModalProps) {
    const [paymentMethod, setPaymentMethod] = useState<"upi" | "paypal" | "crypto">("upi");
    const [isUpiDetailsOpen, setIsUpiDetailsOpen] = useState(false);
    const { currency: displayCurrency, formatPrice, rates } = useCurrency();
    const router = useRouter();

    const nativeTotal = selectedPricing.discountedPrice * qty;
    const nativeCurrency = selectedPricing.currency;
    const isNonUSD = displayCurrency !== "USD";
    const fromRate = rates[nativeCurrency] || 1;
    const usdAmount = isNonUSD ? (nativeTotal / fromRate).toFixed(2) : null;

    const handleClose = () => {
        onClose();
        toast.info("Order saved. You can pay later from My Orders.");
    };

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
                <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-foreground">
                            Complete Payment
                        </h3>
                        <button
                            onClick={handleClose}
                            className="text-muted-foreground hover:text-foreground transition text-xl leading-none"
                        >
                            &times;
                        </button>
                    </div>

                    <div className="mb-4 p-3 bg-muted rounded-xl text-sm">
                        <div className="flex justify-between text-muted-foreground">
                            <span>Order</span>
                            <span className="text-foreground font-mono text-xs">
                                {pendingOrder.orderId}
                            </span>
                        </div>
                        <div className="flex justify-between mt-1">
                            <span className="text-muted-foreground">Total</span>
                            <span className="text-foreground font-bold">
                                {formatPrice(nativeTotal, nativeCurrency)}
                            </span>
                        </div>
                        {isNonUSD && paymentMethod !== "upi" && (
                            <>
                                <div className="border-t border-border my-2" />
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        You pay (USD)
                                    </span>
                                    <span className="font-bold text-secondary">
                                        ~${usdAmount}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>

                    {isNonUSD && paymentMethod === "paypal" && (
                        <p className="text-xs text-muted-foreground mb-4 text-center">
                            PayPal processes all payments in USD
                        </p>
                    )}

                    {/* Payment Method Selector */}
                    <fieldset className="mb-5">
                        <legend className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                            Payment Method
                        </legend>
                        <div className="flex flex-col gap-2.5">
                            {([
                                {
                                    id: "upi" as const,
                                    label: "UPI QR",
                                    description: "Scan & pay with any UPI app",
                                    icon: <IoQrCode className="text-2xl shrink-0" style={{ color: "#4CAF50" }} />,
                                },
                                {
                                    id: "paypal" as const,
                                    label: "PayPal",
                                    description: "Pay with PayPal account or card",
                                    icon: <FaPaypal className="text-2xl shrink-0" style={{ color: "#0070BA" }} />,
                                },
                                {
                                    id: "crypto" as const,
                                    label: "Cryptocurrency",
                                    description: "BTC, ETH, USDT & 100+ coins",
                                    icon: (
                                        <span className="flex items-center gap-1 shrink-0 w-[60px] justify-center">
                                            <FaBitcoin className="text-lg" style={{ color: "#F7931A" }} />
                                            <FaEthereum className="text-lg" style={{ color: "#627EEA" }} />
                                            <SiTether className="text-lg" style={{ color: "#26A17B" }} />
                                        </span>
                                    ),
                                },
                            ]).map((opt) => (
                                <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => setPaymentMethod(opt.id)}
                                    className={`relative flex items-center gap-3 w-full p-3.5 rounded-xl text-left transition-all duration-200 border-2 ${
                                        paymentMethod === opt.id
                                            ? "border-secondary bg-secondary/5 shadow-sm"
                                            : "border-border bg-card hover:border-muted-foreground/30 hover:bg-muted/50"
                                    }`}
                                >
                                    <span
                                        className={`shrink-0 w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center transition-colors duration-200 ${
                                            paymentMethod === opt.id
                                                ? "border-secondary"
                                                : "border-muted-foreground/40"
                                        }`}
                                    >
                                        {paymentMethod === opt.id && (
                                            <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
                                        )}
                                    </span>
                                    {opt.icon}
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-sm font-semibold text-foreground">
                                            {opt.label}
                                        </span>
                                        <span className="text-xs text-muted-foreground mt-0.5">
                                            {opt.description}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </fieldset>

                    {paymentMethod === "upi" ? (
                        <div className="space-y-3">
                            <p className="text-xs text-muted-foreground text-center">
                                Proceed to open a dedicated UPI payment window with QR and payment details.
                            </p>
                            <button
                                type="button"
                                onClick={() => setIsUpiDetailsOpen(true)}
                                className="w-full bg-secondary hover:opacity-90 text-white font-semibold py-3 px-4 rounded-md transition"
                            >
                                Proceed to Buy
                            </button>
                        </div>
                    ) : paymentMethod === "paypal" ? (
                        <PayPalCheckout
                            orderId={pendingOrder._id}
                            amount=""
                            symbol=""
                            onSuccess={() => {
                                toast.success("Payment successful!");
                                router.push(`/orders/${pendingOrder._id}`);
                            }}
                            onCancel={() => {
                                onClose();
                                toast.info(
                                    "Payment cancelled. You can pay later from My Orders."
                                );
                            }}
                            onError={() => {
                                onClose();
                                toast.error(
                                    "Payment failed. Please try again from My Orders."
                                );
                            }}
                        />
                    ) : (
                        <NowPaymentsCheckout
                            orderId={pendingOrder._id}
                            amount=""
                            symbol=""
                            onSuccess={() => {
                                toast.success("Payment initiated!");
                                router.push(`/orders/${pendingOrder._id}`);
                            }}
                            onCancel={() => {
                                onClose();
                                toast.info(
                                    "Payment cancelled. You can pay later from My Orders."
                                );
                            }}
                            onError={() => {
                                onClose();
                                toast.error(
                                    "Failed to create crypto payment. Please try again."
                                );
                            }}
                        />
                    )}
                </div>
            </div>

            {isUpiDetailsOpen && (
                <UpiQrDetailsModal
                    orderId={pendingOrder._id}
                    orderReference={pendingOrder.orderId}
                    onClose={() => setIsUpiDetailsOpen(false)}
                    onUtrSubmitted={() => router.push(`/orders/${pendingOrder._id}`)}
                />
            )}
        </>
    );
}
