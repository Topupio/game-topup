"use client";

import { motion } from "framer-motion";
import { RiCheckLine } from "react-icons/ri";
import { Order } from "@/services/orders/types";
import { formatDuration } from "../lib/formatDateTime";
import { orderCategoryLabel } from "../lib/orderState";

interface Props {
    order: Order;
    amountLabel: string;
}

/**
 * Success banner for a delivered order. Replaces OrderHero rather than sitting alongside
 * it — two heroes stacked would bury the stepper below the fold on a phone.
 */
export default function DeliveredHero({ order, amountLabel }: Props) {
    const productName = order.productSnapshot?.name ?? "Your top-up";
    const gameName = order.game?.name ?? "your account";
    const deliveredAt = order.tracking[order.tracking.length - 1]?.at;
    const duration = formatDuration(order.createdAt, deliveredAt);
    const categoryLabel = orderCategoryLabel(order);

    // The account the top-up landed in. Prefer the stable fieldKey over the label, which
    // admins can rewrite at runtime.
    const accountInput = order.userInputs.find(
        (input) =>
            input.fieldKey === "player_uid" ||
            input.fieldKey === "account_id" ||
            /uid|player id|account/i.test(input.label)
    );

    const stats = [
        duration ? { value: duration, label: "Delivery time" } : null,
        { value: amountLabel, label: `Paid via ${order.paymentMethod?.toUpperCase() ?? "UPI"}` },
        { value: order.orderId, label: "Order ID" },
    ].filter((stat): stat is { value: string; label: string } => stat !== null);

    return (
        <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="relative overflow-hidden rounded-2xl bg-[linear-gradient(130deg,#052e1b_0%,#065f36_55%,#16a34a_100%)] p-5 text-center text-white shadow-soft sm:p-6"
        >
            <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-[radial-gradient(closest-side,rgba(34,197,94,0.5),transparent_70%)]"
            />

            <motion.span
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.32, ease: "easeOut", delay: 0.1 }}
                className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/35 bg-white/15 sm:h-16 sm:w-16"
            >
                <RiCheckLine className="h-7 w-7 sm:h-8 sm:w-8" />
            </motion.span>

            {categoryLabel && (
                <span className="relative mx-auto mt-4 inline-block rounded-full border border-white/25 bg-white/15 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-50 sm:text-[10px]">
                    {categoryLabel}
                </span>
            )}

            <h1 className="relative mt-2.5 text-xl font-extrabold leading-tight tracking-tight sm:text-2xl">Delivered</h1>
            <p className="relative mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-emerald-100 sm:text-sm">
                {productName} landed in your {gameName} account
                {accountInput ? (
                    <>
                        {" "}
                        <b className="font-bold text-white">{String(accountInput.value)}</b>
                    </>
                ) : null}
                .
            </p>

            <dl className="relative mt-5 grid grid-cols-3 gap-2 border-t border-white/15 pt-4">
                {stats.map((stat) => (
                    <div key={stat.label} className="min-w-0">
                        <dt className="sr-only">{stat.label}</dt>
                        <dd className="truncate text-xs font-extrabold tabular-nums sm:text-sm">{stat.value}</dd>
                        <p className="mt-1 truncate text-[9px] font-semibold uppercase tracking-wide text-emerald-200/90 sm:text-[10px]">
                            {stat.label}
                        </p>
                    </div>
                ))}
            </dl>
        </motion.section>
    );
}
