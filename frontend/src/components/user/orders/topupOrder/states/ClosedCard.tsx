"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { RiTimeLine, RiCloseCircleLine, RiRefund2Line, RiErrorWarningLine } from "react-icons/ri";
import { Order, OrderStatus } from "@/services/orders/types";

interface Props {
    order: Order;
}

type Copy = {
    icon: typeof RiTimeLine;
    title: string;
    body: string;
    tone: "muted" | "danger" | "violet";
};

const COPY: Partial<Record<OrderStatus, Copy>> = {
    expired: {
        icon: RiTimeLine,
        title: "This order expired",
        body: "We didn't receive payment in time, so the order was closed. Nothing was charged — place a new order to top up.",
        tone: "muted",
    },
    cancelled: {
        icon: RiCloseCircleLine,
        title: "This order was cancelled",
        body: "The order was cancelled and will not be delivered. If you were charged, contact support and we'll sort it out.",
        tone: "muted",
    },
    failed: {
        icon: RiErrorWarningLine,
        title: "This order failed",
        body: "Something went wrong while processing this order. If your payment went through, contact support with your order ID and we'll fix it.",
        tone: "danger",
    },
    refunded: {
        icon: RiRefund2Line,
        title: "This order was refunded",
        body: "The full amount has been returned to your wallet. You can use that balance on your next top-up.",
        tone: "violet",
    },
};

const TONE = {
    muted: { wrap: "border-border bg-card", icon: "bg-muted text-muted-foreground" },
    danger: { wrap: "border-danger/25 bg-card", icon: "bg-danger/10 text-danger" },
    violet: { wrap: "border-violet-200 bg-card", icon: "bg-violet-100 text-violet-700" },
};

export default function ClosedCard({ order }: Props) {
    const copy = COPY[order.orderStatus] ?? COPY.cancelled!;
    const tone = TONE[copy.tone];
    const Icon = copy.icon;
    const refunded = order.orderStatus === "refunded";

    return (
        <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className={`rounded-2xl border p-4 shadow-soft sm:p-5 ${tone.wrap}`}
        >
            <div className="flex gap-3.5 sm:gap-4">
                <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 ${tone.icon}`}
                >
                    <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                    <h2 className="text-base font-bold tracking-tight text-foreground sm:text-lg">{copy.title}</h2>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                        {copy.body}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <Link
                            href={refunded ? "/account/wallet" : "/contact"}
                            className="rounded-xl bg-secondary px-4 py-2.5 text-xs font-bold tracking-tight text-white transition hover:opacity-90"
                        >
                            {refunded ? "View wallet" : "Contact support"}
                        </Link>
                        <Link
                            href="/account"
                            className="rounded-xl border border-border px-4 py-2.5 text-xs font-bold tracking-tight text-foreground transition hover:bg-muted"
                        >
                            My orders
                        </Link>
                    </div>
                </div>
            </div>
        </motion.section>
    );
}
