"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Order } from "@/services/orders/types";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-toastify";
import DOMPurify from "isomorphic-dompurify";
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
import DeliveryCard from "@/components/user/orders/DeliveryCard";
import { useCurrency } from "@/context/CurrencyContext";

interface Props {
    order: Order;
}

function hasRichContent(html: string | undefined): boolean {
    if (!html) return false;

    const stripped = html.replace(/<[^>]*>/g, "").trim();
    return stripped.length > 0 || /<(img|table)\b/i.test(html);
}

export default function UserOrderDetailClient({ order: initialOrder }: Props) {
    const { formatPrice } = useCurrency();
    const [order] = useState(initialOrder);
    const adminMessage = order.adminNote?.trim() || "";
    const hasAdminMessage = hasRichContent(adminMessage);
    const sanitizedAdminMessage = useMemo(
        () => DOMPurify.sanitize(adminMessage),
        [adminMessage]
    );
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

    const productName = order.productSnapshot?.name ?? "Product";
    const gameName = order.game?.name ?? "Game";
    const orderAmount = formatPrice(order.amount, order.currency || "USD");
    const isPaymentDue = order.paymentStatus === "pending" && order.orderStatus !== "expired";
    const latestTracking = order.tracking[order.tracking.length - 1];

    return (
        <div className="min-h-screen bg-background pt-22 sm:pt-28 lg:pt-32 pb-16 sm:pb-20 px-3 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <Link href="/account" className="text-muted-foreground hover:text-secondary inline-flex items-center gap-2 mb-4 sm:mb-6 text-sm font-semibold transition">
                    <RiArrowLeftLine /> Back to My Account
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-5 lg:gap-8">

                    {/* Left Column - Main Details */}
                    <div className="space-y-4 sm:space-y-6">

                        {/* Order Header */}
                        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
                            <div className="p-3 sm:p-6">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                            <span className="rounded-full bg-secondary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-secondary sm:px-3 sm:py-1 sm:text-[11px]">
                                                Order {order.orderId}
                                            </span>
                                            <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider sm:px-3 sm:py-1 sm:text-[11px] ${getStatusStyles(order.orderStatus)}`}>
                                                {order.orderStatus}
                                            </span>
                                            {hasAdminMessage && (
                                                <Link
                                                    href="#admin-message"
                                                    aria-label="View order update"
                                                    title="View order update"
                                                    className="relative inline-flex h-7 w-7 items-center justify-center rounded-full border border-secondary/30 bg-secondary/10 text-secondary transition hover:bg-secondary hover:text-white focus:outline-none focus:ring-2 focus:ring-secondary/30 sm:h-8 sm:w-8"
                                                >
                                                    <RiNotification3Line className="h-4 w-4 sm:h-[17px] sm:w-[17px]" />
                                                    <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-green-500 ring-2 ring-card sm:right-1.5 sm:top-1.5 sm:h-2 sm:w-2" />
                                                </Link>
                                            )}
                                        </div>
                                        <h1 className="mt-2.5 text-lg font-extrabold leading-tight text-foreground sm:mt-4 sm:text-3xl">
                                            {productName}
                                        </h1>
                                        <p className="mt-0.5 text-xs font-medium text-muted-foreground sm:mt-1 sm:text-base">
                                            {gameName}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-secondary/15 bg-secondary/5 p-3 sm:min-w-[180px] sm:rounded-2xl sm:p-4 sm:text-right">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground sm:text-[11px]">
                                            Order Total
                                        </p>
                                        <p className="text-xl font-extrabold text-foreground sm:mt-1 sm:text-3xl">
                                            {orderAmount}
                                        </p>
                                        <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:mt-1 sm:text-xs">
                                            {order.paymentStatus} payment
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-3 grid gap-2 border-t border-border pt-3 sm:mt-5 sm:grid-cols-3 sm:gap-3 sm:pt-5">
                                    <div className="rounded-lg bg-muted/70 p-2.5 sm:rounded-xl sm:p-3">
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground sm:gap-2 sm:text-xs">
                                            <RiTimeLine className="text-secondary shrink-0" />
                                            Placed
                                        </div>
                                        <p className="mt-0.5 text-xs font-semibold text-foreground sm:mt-1 sm:text-sm" suppressHydrationWarning>
                                            {new Date(order.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-muted/70 p-2.5 sm:rounded-xl sm:p-3">
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground sm:gap-2 sm:text-xs">
                                            <RiWallet3Line className="text-secondary shrink-0" />
                                            Method
                                        </div>
                                        <p className="mt-0.5 text-xs font-semibold text-foreground sm:mt-1 sm:text-sm">
                                            {order.paymentMethod?.toUpperCase()}
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-muted/70 p-2.5 sm:rounded-xl sm:p-3">
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground sm:gap-2 sm:text-xs">
                                            <RiCheckboxCircleLine className="text-secondary shrink-0" />
                                            Latest
                                        </div>
                                        <p className="mt-0.5 text-xs font-semibold text-foreground capitalize sm:mt-1 sm:text-sm">
                                            {latestTracking?.status ?? order.orderStatus}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-border bg-muted/40 px-3 py-2.5 sm:px-6 sm:py-3">
                                <div className="flex items-center gap-2.5 sm:gap-3">
                                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border bg-card p-1 sm:h-12 sm:w-12 sm:rounded-xl">
                                        {order.game?.imageUrl ? (
                                            <Image
                                                src={order.game.imageUrl}
                                                alt={gameName}
                                                fill
                                                sizes="48px"
                                                className="rounded-lg object-cover p-1"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center rounded-lg bg-muted text-[10px] text-muted-foreground">No Img</div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-xs font-bold text-foreground sm:text-sm">
                                            {gameName}
                                        </p>
                                        <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground sm:mt-1 sm:text-xs">
                                            <RiMapPinLine className="text-secondary" />
                                            <span>Global delivery</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {order.delivery?.kind && (
                            <DeliveryCard delivery={order.delivery} />
                        )}

                        {hasAdminMessage && (
                            <motion.div
                                id="admin-message"
                                initial={{ opacity: 0, y: 14, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{
                                    opacity: { duration: 0.28, ease: "easeOut" },
                                    y: { duration: 0.28, ease: "easeOut" },
                                    scale: { duration: 0.28, ease: "easeOut" },
                                }}
                                className="relative scroll-mt-28 overflow-hidden rounded-2xl border border-secondary/25 bg-card shadow-soft"
                            >
                                <div
                                    aria-hidden="true"
                                    className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-secondary/70 to-transparent"
                                />

                                <div className="border-b border-secondary/10 bg-secondary/5 px-4 py-3 sm:px-6">
                                    <div className="flex items-center gap-2">
                                        <motion.span
                                            animate={{ scale: [1, 1.35, 1], opacity: [1, 0.7, 1] }}
                                            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                                            className="flex h-2.5 w-2.5 rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.5)]"
                                        />
                                        <p className="text-secondary text-xs font-bold uppercase tracking-wider">
                                            Order Update
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3 p-4 sm:gap-4 sm:p-6">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-white shadow-[0_0_14px_rgba(99,102,241,0.18)] sm:h-11 sm:w-11 sm:rounded-xl sm:shadow-[0_0_18px_rgba(99,102,241,0.22)]">
                                        <RiNotification3Line className="h-4 w-4 sm:h-5 sm:w-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="text-base font-bold text-foreground sm:text-lg">
                                            Update on your order
                                        </h2>
                                       
                                        <div
                                            className="rich-description break-words"
                                            dangerouslySetInnerHTML={{
                                                __html: sanitizedAdminMessage,
                                            }}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Complete Payment (for pending orders) */}
                        {isPaymentDue && (
                            <section className="rounded-2xl border border-secondary/20 bg-card p-4 shadow-soft sm:p-6">
                                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <h3 className="text-lg font-extrabold text-foreground">
                                            Complete payment
                                        </h3>
                                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                            Choose a payment method to move this order into processing.
                                        </p>
                                    </div>
                                    <span className="w-fit rounded-full border border-warning/20 bg-warning/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-warning">
                                        Payment pending
                                    </span>
                                </div>

                                {/* Payment Method Selector */}
                                <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1.5">
                                    <button
                                        onClick={() => setPaymentMethod("upi")}
                                        className={`rounded-xl py-3 text-sm font-bold transition ${
                                            paymentMethod === "upi"
                                                ? "bg-secondary text-white shadow-sm"
                                                : "text-muted-foreground hover:bg-card"
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
                                        className={`rounded-xl py-3 text-sm font-bold transition ${
                                            paymentMethod === "crypto"
                                                ? "bg-secondary text-white shadow-sm"
                                                : "text-muted-foreground hover:bg-card"
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
                            </section>
                        )}

                        {/* User Inputs / Game Details */}
                        <section className="rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-6">
                            <div className="mb-5 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 text-lg font-bold text-foreground">
                                    <RiFileListLine className="text-secondary" />
                                    <h2>Account details</h2>
                                </div>
                                <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                    {order.userInputs.length} fields
                                </span>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {order.userInputs.map((input, index) => (
                                    <div key={index} className="rounded-xl border border-border bg-muted/70 p-4">
                                        <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{input.label}</p>
                                        <p className="break-all text-base font-bold text-foreground">{input.value}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Order Tracking */}
                        <section className="rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-6">
                            <div className="mb-5 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 text-lg font-bold text-foreground">
                                    <RiCheckboxCircleLine className="text-secondary" />
                                    <h2>Order timeline</h2>
                                </div>
                                <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                    {order.tracking.length} updates
                                </span>
                            </div>
                            <div className="relative space-y-5 before:absolute before:left-[15px] before:top-3 before:bottom-3 before:w-px before:bg-border">
                                {order.tracking.map((track, index) => (
                                    <div key={index} className="relative flex gap-3">
                                        <div className={`relative z-10 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-4 border-card ${
                                            index === order.tracking.length - 1 ? "bg-secondary text-white" : "bg-muted text-muted-foreground"
                                        }`}>
                                            <RiCheckboxCircleLine size={16} />
                                        </div>
                                        <div className="min-w-0 flex-1 rounded-xl border border-border bg-muted/50 p-3">
                                            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                                                <p className="text-sm font-bold uppercase tracking-wide text-foreground">{track.status}</p>
                                                <p className="text-xs text-muted-foreground/70" suppressHydrationWarning>{new Date(track.at).toLocaleString()}</p>
                                            </div>
                                            <p className="mt-1 text-sm leading-6 text-muted-foreground">{track.message}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right Column - Sidebar */}
                    <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
                        {/* Game Info Card */}
                        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-5">
                            <div className="flex items-center gap-4 lg:block lg:text-center">
                                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-border bg-muted p-1 lg:mx-auto lg:mb-4 lg:h-24 lg:w-24">
                                    {order.game?.imageUrl ? (
                                        <Image
                                            src={order.game.imageUrl}
                                            alt={gameName}
                                            fill
                                            sizes="(min-width: 1024px) 96px, 80px"
                                            className="rounded-xl object-cover p-1"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No Img</div>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="truncate text-lg font-bold text-foreground">{gameName}</h3>
                                    <p className="mt-1 text-sm font-medium text-muted-foreground">{productName}</p>
                                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground lg:justify-center">
                                        <RiMapPinLine className="text-secondary" />
                                        <span>Global delivery</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Customer Support Card */}
                        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-5">
                            <div className="mb-2 flex items-center gap-2">
                                <RiCustomerService2Line className="text-secondary" />
                                <h3 className="font-bold text-foreground">Need help?</h3>
                            </div>
                            <p className="mb-4 text-sm leading-6 text-muted-foreground">
                                Share your order ID with support if anything looks wrong.
                            </p>
                            <Link
                                href="/contact"
                                className="block w-full rounded-xl bg-secondary py-3 text-center text-sm font-bold text-white transition hover:opacity-90"
                            >
                                Contact Support
                            </Link>
                        </div>
                    </aside>

                </div>
            </div>
        </div>
    );
}
