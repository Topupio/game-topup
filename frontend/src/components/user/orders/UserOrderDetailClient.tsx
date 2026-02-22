"use client";

import { useState } from "react";
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
} from "react-icons/ri";
import PayPalCheckout from "@/components/user/gameDetails/PayPalCheckout";

interface Props {
    order: Order;
}

export default function UserOrderDetailClient({ order: initialOrder }: Props) {
    const [order, setOrder] = useState(initialOrder);

    const getStatusStyles = (status: string) => {
        switch (status) {
            case "completed": return "bg-success/10 text-success border-success/20";
            case "processing": return "bg-secondary/10 text-secondary border-secondary/20";
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
                                        <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusStyles(order.orderStatus)}`}>
                                            {order.orderStatus.toUpperCase()}
                                        </span>
                                    </div>

                                    <div className="flex justify-between mt-4">
                                        <h2 className="text-xl sm:text-2xl font-bold text-foreground leading-tight">
                                            {order.productSnapshot?.name ?? "Product"}
                                        </h2>
                                        <span className="text-xl sm:text-2xl font-bold text-foreground">
                                            ₹{order.amount}
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

                        {/* Complete Payment (for pending orders) */}
                        {order.paymentStatus === "pending" && (
                            <div className="bg-secondary/5 border border-secondary/20 p-6 rounded-2xl">
                                <h3 className="text-foreground font-bold text-lg mb-2">
                                    Complete Your Payment
                                </h3>
                                <p className="text-muted-foreground text-sm mb-4">
                                    Your order is awaiting payment. Complete it now to start processing.
                                </p>
                                <PayPalCheckout
                                    orderId={order._id}
                                    amount={order.amount.toFixed(2)}
                                    symbol="$"
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
