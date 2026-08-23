"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Order } from "@/services/orders/types";
import Link from "next/link";
import Image from "next/image";
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
import DeliveryCard from "@/components/user/orders/DeliveryCard";
import AdminMessageCard, { hasRichContent } from "@/components/user/orders/AdminMessageCard";
import { useCurrency } from "@/context/CurrencyContext";
import { isTopupOrder, orderCategoryLabel } from "@/components/user/orders/topupOrder/lib/orderState";
import { formatDateTime } from "@/components/user/orders/topupOrder/lib/formatDateTime";
import TopupOrderDetail from "@/components/user/orders/topupOrder";

interface Props {
    order: Order;
}

/** Standard card entry — see ORDER_DETAILS_STYLE.md ("Motion"). */
const cardEntry = {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.28, ease: "easeOut" as const },
};

/**
 * Top-up templates (uid / live apps / login) get a state-driven layout of their own.
 * Gift cards and AI subscriptions hand over a code or credentials, so they keep the
 * generic order page below.
 */
export default function UserOrderDetailClient({ order }: Props) {
    if (isTopupOrder(order)) {
        return <TopupOrderDetail order={order} />;
    }

    return <GenericOrderDetail order={order} />;
}

function GenericOrderDetail({ order: initialOrder }: Props) {
    const { formatPrice } = useCurrency();
    const [order] = useState(initialOrder);
    const adminMessage = order.adminNote?.trim() || "";
    const hasAdminMessage = hasRichContent(adminMessage);
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
            case "expired": return "bg-muted text-muted-foreground border-border";
            case "refunded": return "bg-secondary/10 text-secondary border-secondary/20";
            case "cancelled":
            case "failed": return "bg-danger/10 text-danger border-danger/20";
            default: return "bg-warning/10 text-warning border-warning/20";
        }
    };

    const productName = order.productSnapshot?.name ?? "Product";
    const gameName = order.game?.name ?? "Game";
    const categoryLabel = orderCategoryLabel(order);
    const orderAmount = formatPrice(order.amount, order.currency || "USD");
    const isPaymentDue = order.paymentStatus === "pending" && order.orderStatus !== "expired";
    const latestTracking = order.tracking[order.tracking.length - 1];
    const placedAt = formatDateTime(order.createdAt);

    return (
        <div className="min-h-screen bg-background px-3 pb-16 pt-22 sm:px-6 sm:pb-20 sm:pt-28 lg:px-8 lg:pt-32">
            <div className="mx-auto max-w-7xl">
                <Link href="/account" className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-secondary sm:mb-6">
                    <RiArrowLeftLine className="shrink-0" /> Back to My Account
                </Link>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">

                    {/* Left Column - Main Details */}
                    <div className="space-y-3 sm:space-y-4">

                        {/* Order Header */}
                        <motion.section {...cardEntry} className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
                            <div className="p-4 sm:p-5">
                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                    <span className="rounded-full bg-secondary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-secondary">
                                        Order {order.orderId}
                                    </span>
                                    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${getStatusStyles(order.orderStatus)}`}>
                                        {order.orderStatus}
                                    </span>
                                    {categoryLabel && (
                                        <span className="rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                            {categoryLabel}
                                        </span>
                                    )}
                                    {hasAdminMessage && (
                                        <Link
                                            href="#admin-message"
                                            aria-label="View order update"
                                            title="View order update"
                                            className="relative inline-flex h-7 w-7 items-center justify-center rounded-full border border-secondary/30 bg-secondary/10 text-secondary transition hover:bg-secondary hover:text-white focus:outline-none focus:ring-2 focus:ring-secondary/30"
                                        >
                                            <RiNotification3Line className="h-4 w-4" />
                                            <span
                                                aria-hidden="true"
                                                className="pointer-events-none absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-success ring-2 ring-card"
                                            />
                                        </Link>
                                    )}
                                </div>

                                <h1 className="mt-3 text-xl font-extrabold leading-tight tracking-tight text-foreground sm:text-2xl">
                                    {productName}
                                </h1>
                                <p className="mt-1.5 text-xs font-medium text-muted-foreground sm:text-sm">
                                    {gameName}
                                </p>

                                {/* Amount: inline label/value strip on mobile, right-aligned block from sm. */}
                                <div className="mt-4 rounded-xl border border-secondary/15 bg-secondary/5 p-3 sm:p-3.5">
                                    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                            Order Total
                                        </p>
                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                            {order.paymentStatus} payment
                                        </p>
                                    </div>
                                    <p className="mt-1.5 text-xl font-extrabold tracking-tight tabular-nums text-foreground sm:text-2xl">
                                        {orderAmount}
                                    </p>
                                </div>

                                {/* 320px fits two columns, not three — the third tile spans the row. */}
                                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-4 sm:grid-cols-3 sm:gap-3">
                                    <div className="rounded-xl bg-muted/70 p-2.5 sm:p-3">
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                            <RiTimeLine className="shrink-0 text-secondary" />
                                            Placed
                                        </div>
                                        <p className="mt-1.5 text-[11px] font-semibold tabular-nums text-foreground sm:text-xs" suppressHydrationWarning>
                                            {placedAt}
                                        </p>
                                    </div>
                                    <div className="rounded-xl bg-muted/70 p-2.5 sm:p-3">
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                            <RiWallet3Line className="shrink-0 text-secondary" />
                                            Method
                                        </div>
                                        <p className="mt-1.5 break-words text-[11px] font-semibold text-foreground sm:text-xs">
                                            {order.paymentMethod?.toUpperCase()}
                                        </p>
                                    </div>
                                    <div className="col-span-2 rounded-xl bg-muted/70 p-2.5 sm:col-span-1 sm:p-3">
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                            <RiCheckboxCircleLine className="shrink-0 text-secondary" />
                                            Latest
                                        </div>
                                        <p className="mt-1.5 break-words text-[11px] font-semibold capitalize text-foreground sm:text-xs">
                                            {latestTracking?.status ?? order.orderStatus}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-border bg-muted/40 px-4 py-3 sm:px-5">
                                <div className="flex items-center gap-2.5 sm:gap-3">
                                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border bg-card p-1 sm:h-12 sm:w-12">
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
                                        <p className="truncate text-xs font-bold tracking-tight text-foreground sm:text-sm">
                                            {gameName}
                                        </p>
                                        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground sm:text-xs">
                                            <RiMapPinLine className="shrink-0 text-secondary" />
                                            <span>Global delivery</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.section>

                        {order.delivery?.kind && (
                            <DeliveryCard delivery={order.delivery} />
                        )}

                        {hasAdminMessage && <AdminMessageCard message={adminMessage} />}

                        {/* Complete Payment (for pending orders) */}
                        {isPaymentDue && (
                            <motion.section {...cardEntry} className="rounded-2xl border border-secondary/20 bg-card p-5 shadow-soft sm:p-6">
                                <div className="mb-5">
                                    <span className="inline-flex w-fit rounded-full border border-warning/20 bg-warning/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-warning">
                                        Payment pending
                                    </span>
                                    <h2 className="mt-3 text-lg font-extrabold leading-tight tracking-tight text-foreground sm:text-xl">
                                        Complete payment
                                    </h2>
                                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                                        Choose a payment method to move this order into processing.
                                    </p>
                                </div>

                                {/* Payment Method Selector */}
                                <div className="mb-4 grid grid-cols-2 gap-1.5 rounded-xl bg-muted p-1.5">
                                    <button
                                        type="button"
                                        aria-pressed={paymentMethod === "upi"}
                                        onClick={() => setPaymentMethod("upi")}
                                        className={`rounded-lg py-2.5 text-xs font-bold transition sm:text-sm ${
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
                                        type="button"
                                        aria-pressed={paymentMethod === "crypto"}
                                        onClick={() => setPaymentMethod("crypto")}
                                        className={`rounded-lg py-2.5 text-xs font-bold transition sm:text-sm ${
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
                            </motion.section>
                        )}

                        {/* User Inputs / Game Details */}
                        <motion.section {...cardEntry} className="rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-5">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <RiFileListLine className="shrink-0 text-secondary" />
                                    <h2 className="text-base font-bold tracking-tight text-foreground sm:text-lg">
                                        Account details
                                    </h2>
                                </div>
                                <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    {order.userInputs.length} fields
                                </span>
                            </div>
                            <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
                                {order.userInputs.map((input, index) => (
                                    <div key={index} className="rounded-xl border border-border bg-muted/60 p-3 sm:p-3.5">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{input.label}</p>
                                        <p className="mt-1.5 break-all text-sm font-bold tracking-tight text-foreground">{input.value}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.section>

                        {/* Order Tracking */}
                        <motion.section {...cardEntry} className="rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-5">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <RiCheckboxCircleLine className="shrink-0 text-secondary" />
                                    <h2 className="text-base font-bold tracking-tight text-foreground sm:text-lg">
                                        Order timeline
                                    </h2>
                                </div>
                                <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    {order.tracking.length} updates
                                </span>
                            </div>
                            <ol className="space-y-3.5">
                                {order.tracking.map((track, index) => (
                                    <li key={index} className="flex gap-3">
                                        <span
                                            aria-hidden="true"
                                            className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                                                index === order.tracking.length - 1
                                                    ? "bg-secondary ring-4 ring-secondary/15"
                                                    : "bg-success"
                                            }`}
                                        />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-bold capitalize tracking-tight text-foreground sm:text-sm">{track.status}</p>
                                            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground sm:text-xs">{track.message}</p>
                                            <p className="mt-1 text-[10px] font-medium tabular-nums text-muted-foreground/70" suppressHydrationWarning>
                                                {formatDateTime(track.at)} UTC
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </motion.section>
                    </div>

                    {/* Right Column - Sidebar */}
                    <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
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
                                        <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">No Img</div>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="truncate text-base font-bold tracking-tight text-foreground sm:text-lg">{gameName}</h3>
                                    <p className="mt-1 text-sm font-medium leading-snug text-muted-foreground">{productName}</p>
                                    <div className="mt-2.5 flex items-center gap-2 text-xs text-muted-foreground sm:text-sm lg:justify-center">
                                        <RiMapPinLine className="shrink-0 text-secondary" />
                                        <span>Global delivery</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Customer Support Card */}
                        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-5">
                            <div className="mb-1.5 flex items-center gap-2">
                                <RiCustomerService2Line className="shrink-0 text-secondary" />
                                <h3 className="text-base font-bold tracking-tight text-foreground">Need help?</h3>
                            </div>
                            <p className="mb-4 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                                Share your order ID with support if anything looks wrong.
                            </p>
                            <Link
                                href="/contact"
                                className="block w-full rounded-xl bg-secondary py-2.5 text-center text-sm font-bold text-white transition hover:opacity-90"
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
