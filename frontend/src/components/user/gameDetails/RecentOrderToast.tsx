"use client";

import { useEffect, useMemo, useState } from "react";
import { RiCloseLine, RiShoppingBag3Line, RiVerifiedBadgeLine } from "react-icons/ri";
import { ordersApiClient } from "@/services/orders/ordersApi.client";
import { PublicRecentOrder } from "@/services/orders/types";

const SESSION_KEY = "recent-order-toast-seen";

function getRelativeTime(createdAt: string) {
    const created = new Date(createdAt).getTime();
    if (Number.isNaN(created)) return "recently";

    const diffMs = Date.now() - created;
    const minutes = Math.max(1, Math.floor(diffMs / 60000));

    if (minutes < 60) return `${minutes} min ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;

    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? "" : "s"} ago`;
}

export default function RecentOrderToast() {
    const [orders, setOrders] = useState<PublicRecentOrder[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (sessionStorage.getItem(SESSION_KEY) === "true") return;

        const controller = new AbortController();

        ordersApiClient
            .getRecentPublicOrders(5, controller.signal)
            .then((res) => {
                if (res.data.length > 0) {
                    setOrders(res.data);
                    window.setTimeout(() => setVisible(true), 1800);
                    sessionStorage.setItem(SESSION_KEY, "true");
                }
            })
            .catch(() => {
                // Social proof is optional; checkout should never depend on it.
            });

        return () => controller.abort();
    }, []);

    useEffect(() => {
        if (!visible || orders.length <= 1) return;

        const interval = window.setInterval(() => {
            setActiveIndex((current) => (current + 1) % orders.length);
        }, 12000);

        return () => window.clearInterval(interval);
    }, [orders.length, visible]);

    useEffect(() => {
        if (!visible) return;

        const timeout = window.setTimeout(() => setVisible(false), 7000);
        return () => window.clearTimeout(timeout);
    }, [activeIndex, visible]);

    const activeOrder = orders[activeIndex];
    const orderLabel = useMemo(() => {
        if (!activeOrder) return "";
        return activeOrder.gameName
            ? `${activeOrder.productName} for ${activeOrder.gameName}`
            : activeOrder.productName;
    }, [activeOrder]);

    if (!activeOrder || !visible) return null;

    return (
        <div className="fixed bottom-24 left-4 right-4 z-[55] mx-auto max-w-sm lg:bottom-6 lg:left-6 lg:right-auto">
            <div className="rounded-2xl border border-border bg-card/95 p-3.5 shadow-2xl shadow-black/20 backdrop-blur">
                <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                        <RiShoppingBag3Line className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="mb-0.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase text-green-500">
                            <RiVerifiedBadgeLine className="h-3.5 w-3.5" />
                            Verified recent order
                        </div>
                        <p className="text-sm font-semibold leading-snug text-foreground">
                            A customer ordered {orderLabel}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {getRelativeTime(activeOrder.createdAt)} · Secure digital delivery
                        </p>
                    </div>

                    <button
                        type="button"
                        aria-label="Hide recent order"
                        onClick={() => setVisible(false)}
                        className="h-7 w-7 shrink-0 rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    >
                        <RiCloseLine className="mx-auto h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
