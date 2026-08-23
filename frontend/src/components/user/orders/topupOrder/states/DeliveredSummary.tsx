"use client";

import { motion } from "framer-motion";
import { RiCheckboxCircleFill } from "react-icons/ri";
import { Order } from "@/services/orders/types";
import { formatDateTime, formatDuration } from "../lib/formatDateTime";
import { isPassword } from "../shared/AccountDetails";

interface Props {
    order: Order;
    amountLabel: string;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-0.5 border-b border-border py-3 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <span className="text-[11px] font-semibold text-muted-foreground sm:text-xs">
                {label}
            </span>
            <span className="break-all text-xs font-bold tracking-tight text-foreground sm:text-right sm:text-sm">
                {value}
            </span>
        </div>
    );
}

/**
 * Post-delivery receipt-style recap. Every row comes off the order — the delivery
 * timestamp is taken from the last tracking entry, since UID top-ups never get a
 * structured `delivery` object.
 */
export default function DeliveredSummary({ order, amountLabel }: Props) {
    const deliveredAt = order.tracking[order.tracking.length - 1]?.at;
    const duration = formatDuration(order.createdAt, deliveredAt);
    const placed = formatDateTime(order.createdAt);
    const delivered = formatDateTime(deliveredAt);

    return (
        <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: "easeOut", delay: 0.06 }}
            className="rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-5"
        >
            <div className="mb-2 flex items-center gap-2">
                <RiCheckboxCircleFill className="text-success" />
                <h2 className="text-base font-bold tracking-tight text-foreground sm:text-lg">
                    Delivery summary
                </h2>
            </div>

            <div>
                {/* No password here — this is a receipt, not the login form. */}
                {order.userInputs
                    .filter((input) => !isPassword(input.fieldKey))
                    .map((input, index) => (
                        <Row key={index} label={input.label} value={String(input.value)} />
                    ))}

                <Row
                    label="Payment"
                    value={`${order.paymentMethod?.toUpperCase() ?? "—"} · ${amountLabel}`}
                />

                {placed && (
                    <Row
                        label="Placed"
                        value={<span suppressHydrationWarning>{placed} UTC</span>}
                    />
                )}

                {delivered && (
                    <Row
                        label="Delivered"
                        value={
                            <span suppressHydrationWarning>
                                {delivered} UTC{duration ? ` (${duration})` : ""}
                            </span>
                        }
                    />
                )}
            </div>
        </motion.section>
    );
}
