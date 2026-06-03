"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Order } from "@/services/orders/types";
import Link from "next/link";
import { toast } from "react-toastify";
import {
    RiArrowLeftLine,
    RiTimeLine,
    RiCheckboxCircleLine,
    RiMapPinLine,
    RiWallet3Line,
    RiFileListLine,
    RiCustomerService2Line,
    RiNotification3Line,
} from "react-icons/ri";
// import PayPalCheckout from "@/components/user/gameDetails/PayPalCheckout";
import NowPaymentsCheckout from "@/components/user/gameDetails/NowPaymentsCheckout";
import UpiQrCheckout from "@/components/user/gameDetails/UpiQrCheckout";
import { useCurrency } from "@/context/CurrencyContext";

interface Props {
    order: Order;
}

export default function UserOrderDetailClient({ order: initialOrder }: Props) {
    const { formatPrice } = useCurrency();
    const [order] = useState(initialOrder);
    const adminMessage = order.adminNote?.trim();
    const [paymentMethod, setPaymentMethod] = useState<"upi" | "crypto">(() => {
        if (initialOrder.paymentMethod === "upi") return "upi";
        if (initialOrder.paymentMethod === "nowpayments") return "crypto";
        // return "paypal";
        return "upi";
    });

    const getStatusStyles = (status: string) => {
        switch (status) {
            case "completed": return "bg-success/10 text-success border-success/20";
            case "processing": return "bg-secondary/10 text-secondary border-secondary/20";
            case "expired": return "bg-gray-100 text-gray-600 border-gray-200";
            case "cancelled":
            case "failed": return "bg-danger/10 text-danger border-danger/20";
            default: return "bg-warning/10 text-warning border-warning/20";
        }
    };

    return (
        <div className="min-h-screen bg-background pt-32 pb-20 px-4 lg:px-0">
            <div className="max-w-7xl mx-auto">
                <Link href="/account" className="text-muted-foreground hover:text-secondary flex items-center gap-2 mb-8 transition w-fit">
                    <RiArrowLeftLine /> Back to My Account
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column - Main Details */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Order Header */}
                        <div className="bg-card border border-border p-6 rounded-2xl shadow-soft">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                                <div className="space-y-1 w-full">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <span className="text-secondary font-bold tracking-wider uppercase text-sm">
                                            Order {order.orderId}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            {adminMessage && (
                                                <Link
                                                    href="#admin-message"
                                                    aria-label="View admin message"
                                                    title="View admin message"
                                                    className="relative inline-flex h-8 w-8 items-center justify-center rounded-full border border-secondary/30 bg-secondary/10 text-secondary transition hover:bg-secondary hover:text-white focus:outline-none focus:ring-2 focus:ring-secondary/30"
                                                >
                                                    <RiNotification3Line size={17} />
                                                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger ring-2 ring-card" />
                                                </Link>
                                            )}
                                            <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusStyles(order.orderStatus)}`}>
                                                {order.orderStatus.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between mt-4">
                                        <h2 className="text-xl sm:text-2xl font-bold text-foreground leading-tight">
                                            {order.productSnapshot?.name ?? "Product"}
                                        </h2>
                                        <span className="text-xl sm:text-2xl font-bold text-foreground">
                                            {formatPrice(order.amount, order.currency || "USD")}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Meta info */}
                            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-6 text-sm text-muted-foreground border-t border-border pt-5">
                                <div className="flex items-center gap-2">
                                    <RiTimeLine className="text-secondary shrink-0" />
                                    <span suppressHydrationWarning>Placed on: {new Date(order.createdAt).toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <RiWallet3Line className="text-secondary shrink-0" />
                                    <span>Payment: {order.paymentMethod?.toUpperCase()}</span>
                                </div>
                            </div>
                        </div>

                        {adminMessage && (
                            <motion.div
                                id="admin-message"
                                initial={{ opacity: 0, y: 14, scale: 0.98 }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                    scale: 1,
                                    boxShadow: [
                                        "0 0 20px rgba(99,102,241,0.14)",
                                        "0 0 34px rgba(99,102,241,0.24)",
                                        "0 0 20px rgba(99,102,241,0.14)",
                                    ],
                                }}
                                transition={{
                                    opacity: { duration: 0.28, ease: "easeOut" },
                                    y: { duration: 0.28, ease: "easeOut" },
                                    scale: { duration: 0.28, ease: "easeOut" },
                                    boxShadow: { duration: 2.8, repeat: Infinity, ease: "easeInOut" },
                                }}
                                className="relative scroll-mt-28 overflow-hidden rounded-2xl border border-secondary/30 bg-card shadow-[0_0_28px_rgba(99,102,241,0.18)]"
                            >
                                <motion.div
                                    aria-hidden="true"
                                    animate={{ opacity: [0.35, 0.85, 0.35] }}
                                    transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                                    className="pointer-events-none absolute inset-0 rounded-2xl border border-secondary/50 shadow-[0_0_22px_rgba(99,102,241,0.28)]"
                                />
                                <div
                                    aria-hidden="true"
                                    className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-secondary/70 to-transparent"
                                />

                                <div className="border-b border-secondary/10 bg-secondary/5 px-5 py-3 sm:px-6">
                                    <div className="flex items-center gap-2">
                                        <motion.span
                                            animate={{ scale: [1, 1.35, 1], opacity: [1, 0.7, 1] }}
                                            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                                            className="flex h-2.5 w-2.5 rounded-full bg-danger shadow-[0_0_12px_rgba(239,68,68,0.5)]"
                                        />
                                        <p className="text-secondary text-xs font-bold uppercase tracking-wider">
                                            Admin message
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-5 sm:p-6">
                                    <motion.div
                                        animate={{ y: [0, -2, 0] }}
                                        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                                        className="w-11 h-11 rounded-xl bg-secondary text-white flex items-center justify-center shrink-0 shadow-[0_0_18px_rgba(99,102,241,0.28)]"
                                    >
                                        <RiNotification3Line size={20} />
                                    </motion.div>
                                    <div className="min-w-0">
                                        <h2 className="text-foreground font-bold text-lg mb-1">
                                            You have received a message from the admin
                                        </h2>
                                        <p className="text-muted-foreground text-xs mb-3">
                                            Please review this update for your order.
                                        </p>
                                        <p className="text-muted-foreground text-sm leading-6 whitespace-pre-line break-words">
                                            {adminMessage}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Complete Payment (for pending orders) */}
                        {order.paymentStatus === "pending" && order.orderStatus !== "expired" && (
                            <div className="bg-secondary/5 border border-secondary/20 p-6 rounded-2xl">
                                <h3 className="text-foreground font-bold text-lg mb-2">
                                    Complete Your Payment
                                </h3>
                                <p className="text-muted-foreground text-sm mb-4">
                                    Your order is awaiting payment. Complete it now to start processing.
                                </p>

                                {/* Payment Method Selector */}
                                <div className="flex gap-2 mb-4">
                                    <button
                                        onClick={() => setPaymentMethod("upi")}
                                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition border ${
                                            paymentMethod === "upi"
                                                ? "bg-secondary text-white border-secondary"
                                                : "bg-muted text-muted-foreground border-border hover:border-secondary/50"
                                        }`}
                                    >
                                        UPI QR
                                    </button>
                                    {/*
                                    <button
                                        onClick={() => setPaymentMethod("paypal")}
                                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition border ${
                                            paymentMethod === "paypal"
                                                ? "bg-secondary text-white border-secondary"
                                                : "bg-muted text-muted-foreground border-border hover:border-secondary/50"
                                        }`}
                                    >
                                        PayPal
                                    </button>
                                    */}
                                    <button
                                        onClick={() => setPaymentMethod("crypto")}
                                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition border ${
                                            paymentMethod === "crypto"
                                                ? "bg-secondary text-white border-secondary"
                                                : "bg-muted text-muted-foreground border-border hover:border-secondary/50"
                                        }`}
                                    >
                                        Crypto
                                    </button>
                                </div>

                                {paymentMethod === "upi" ? (
                                    <UpiQrCheckout orderId={order._id} onUtrSubmitted={() => window.location.reload()} />
                                ) : /*
                                paymentMethod === "paypal" ? (
                                    <>
                                        {(order.currency || "USD") !== "USD" && (
                                            <p className="text-xs text-muted-foreground mb-4 text-center">
                                                PayPal processes all payments in USD
                                            </p>
                                        )}
                                        <PayPalCheckout
                                            orderId={order._id}
                                            amount=""
                                            symbol=""
                                            onSuccess={() => {
                                                toast.success("Payment successful!");
                                                window.location.reload();
                                            }}
                                            onError={() => {
                                                toast.error("Payment failed. Please try again.");
                                            }}
                                            onCancel={() => {
                                                toast.info("Payment cancelled.");
                                            }}
                                        />
                                    </>
                                ) : */ (
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
                            </div>
                        )}

                        {/* User Inputs / Game Details */}
                        <div className="bg-card border border-border p-6 rounded-2xl shadow-soft">
                            <div className="flex items-center gap-2 mb-6 text-foreground font-bold text-lg">
                                <RiFileListLine className="text-secondary" />
                                <h2>Account Details</h2>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {order.userInputs.map((input, index) => (
                                    <div key={index} className="bg-muted p-4 rounded-xl border border-border">
                                        <p className="text-muted-foreground text-xs mb-1 uppercase tracking-wider">{input.label}</p>
                                        <p className="text-foreground font-semibold break-all">{input.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Order Tracking */}
                        <div className="bg-card border border-border p-6 rounded-2xl shadow-soft">
                            <div className="flex items-center gap-2 mb-6 text-foreground font-bold text-lg">
                                <RiCheckboxCircleLine className="text-secondary" />
                                <h2>Order Timeline</h2>
                            </div>
                            <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-border">
                                {order.tracking.map((track, index) => (
                                    <div key={index} className="relative pl-8">
                                        <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-card ${index === order.tracking.length - 1 ? "bg-secondary" : "bg-muted-foreground/40"}`} />
                                        <div>
                                            <p className="text-foreground font-semibold text-sm uppercase tracking-wide">{track.status}</p>
                                            <p className="text-muted-foreground text-sm">{track.message}</p>
                                            <p className="text-muted-foreground/60 text-xs mt-1" suppressHydrationWarning>{new Date(track.at).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6">
                        {/* Game Info Card */}
                        <div className="bg-card border border-border p-6 rounded-2xl shadow-soft text-center">
                            <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden mb-4 border border-border bg-muted p-1">
                                {order.game?.imageUrl ? (
                                    <img src={order.game.imageUrl} alt={order.game.name} className="w-full h-full object-cover rounded-xl" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No Img</div>
                                )}
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-1">{order.game?.name}</h3>
                            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                <RiMapPinLine className="text-secondary" />
                                <span>Global Delivery</span>
                            </div>
                        </div>

                        {/* Customer Support Card */}
                        <div className="bg-card border border-border p-6 rounded-2xl shadow-soft">
                            <div className="flex items-center gap-2 mb-2">
                                <RiCustomerService2Line className="text-secondary" />
                                <h3 className="text-foreground font-bold">Need Help?</h3>
                            </div>
                            <p className="text-muted-foreground text-sm mb-4">
                                If you have any issues with your order, please contact our support team with your Order ID.
                            </p>
                            <Link
                                href="/contact"
                                className="block w-full text-center bg-secondary text-white font-semibold py-2.5 rounded-xl hover:opacity-90 transition"
                            >
                                Contact Support
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
