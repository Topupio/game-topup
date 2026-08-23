"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Order } from "@/services/orders/types";
import { OrderState, isLoginTopup, orderCategoryLabel } from "../lib/orderState";
import { RiCheckLine, RiGlobalLine } from "react-icons/ri";

interface Props {
    order: Order;
    state: OrderState;
    amountLabel: string;
}

const PILL: Record<OrderState, { label: string; className: string; pulse: boolean }> = {
    awaiting_payment: {
        label: "Payment pending",
        className: "border-amber-400/40 bg-amber-400/15 text-amber-300",
        pulse: true,
    },
    verifying: {
        label: "Verifying",
        className: "border-sky-400/40 bg-sky-400/15 text-sky-300",
        pulse: true,
    },
    processing: {
        label: "Delivering",
        className: "border-indigo-300/40 bg-indigo-300/15 text-indigo-200",
        pulse: true,
    },
    delivered: {
        label: "Delivered",
        className: "border-emerald-300/40 bg-emerald-300/15 text-emerald-200",
        pulse: false,
    },
    closed: {
        label: "Closed",
        className: "border-white/20 bg-white/10 text-slate-300",
        pulse: false,
    },
};

/** Short caption under the amount, explaining what the money is doing. */
function amountCaption(order: Order, state: OrderState): string | null {
    const method = order.paymentMethod?.toUpperCase();
    const upi = order.paymentInfo?.paymentGatewayResponse?.upi;
    const converted =
        upi && upi.originalCurrency && upi.originalCurrency !== upi.currency
            ? `Converted from ${upi.originalCurrency} ${upi.originalAmount}`
            : null;

    switch (state) {
        case "awaiting_payment":
            return [converted, method].filter(Boolean).join(" · ") || null;
        case "verifying":
            return `Paid via ${method ?? "UPI"} · awaiting confirmation`;
        case "processing":
            return isLoginTopup(order)
                ? `Payment confirmed · login required to deliver`
                : `Paid via ${method ?? "UPI"} · delivery in progress`;
        case "delivered":
            return `Paid via ${method ?? "UPI"}`;
        default:
            return method ? `${method} · ${order.orderStatus}` : null;
    }
}

export default function OrderHero({ order, state, amountLabel }: Props) {
    const delivered = state === "delivered";
    const pill =
        state === "processing" && isLoginTopup(order)
            ? {
                  label: "Action needed",
                  className: "border-amber-400/40 bg-amber-400/15 text-amber-300",
                  pulse: true,
              }
            : PILL[state];
    const productName = order.productSnapshot?.name ?? "Product";
    const gameName = order.game?.name ?? "Game";
    const caption = amountCaption(order, state);
    const qty = order.productSnapshot?.qty ?? order.quantity ?? 1;
    const categoryLabel = orderCategoryLabel(order);

    return (
        <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className={`relative overflow-hidden rounded-2xl p-4 text-white shadow-soft sm:p-6 ${
                delivered
                    ? "bg-[linear-gradient(130deg,#052e1b_0%,#065f36_55%,#16a34a_100%)]"
                    : "bg-[linear-gradient(130deg,#101832_0%,#1e1b4b_60%,#312e81_100%)]"
            }`}
        >
            {/* Soft corner glow. Decorative only, and it must never eat pointer events. */}
            <span
                aria-hidden="true"
                className={`pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full ${
                    delivered
                        ? "bg-[radial-gradient(closest-side,rgba(34,197,94,0.45),transparent_70%)]"
                        : "bg-[radial-gradient(closest-side,rgba(99,102,241,0.5),transparent_70%)]"
                }`}
            />

            <div className="relative flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-300/80">
                            Order {order.orderId}
                        </p>
                        {categoryLabel && (
                            <span className="rounded-full border border-white/20 bg-white/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-100 sm:px-2 sm:text-[10px]">
                                {categoryLabel}
                            </span>
                        )}
                    </div>
                    <h1 className="mt-1 truncate text-lg font-extrabold leading-snug tracking-tight sm:mt-1.5 sm:text-2xl">
                        {productName}
                    </h1>
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-300/80 sm:mt-1 sm:gap-1.5 sm:text-sm">
                        <RiGlobalLine className="shrink-0" />
                        <span className="truncate">{gameName}</span>
                        <span aria-hidden="true" className="shrink-0">·</span>
                        <span className="shrink-0">Qty {qty}</span>
                    </p>
                </div>

                <span
                    className={`flex w-fit shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider sm:px-2.5 sm:py-1 sm:text-[10px] ${pill.className}`}
                >
                    {pill.pulse ? (
                        <motion.span
                            animate={{ opacity: [1, 0.25, 1] }}
                            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                            className="h-1.5 w-1.5 rounded-full bg-current"
                        />
                    ) : (
                        <RiCheckLine className="h-3 w-3" />
                    )}
                    {pill.label}
                </span>
            </div>

            <div className="relative mt-4 flex items-end justify-between gap-3 border-t border-white/10 pt-3 sm:mt-6 sm:pt-4">
                <div className="min-w-0">
                    <p className="text-[26px] font-extrabold leading-none tracking-tight tabular-nums sm:text-3xl">{amountLabel}</p>
                    {caption && (
                        <p className="mt-1.5 truncate text-[11px] font-medium text-slate-300/75 sm:text-xs">
                            {caption}
                        </p>
                    )}
                </div>

                {order.game?.imageUrl ? (
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-white/15 bg-white/10 sm:h-14 sm:w-14">
                        <Image
                            src={order.game.imageUrl}
                            alt={gameName}
                            fill
                            sizes="56px"
                            className="object-cover"
                        />
                    </div>
                ) : null}
            </div>
        </motion.section>
    );
}
