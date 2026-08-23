"use client";

import { RiCheckboxCircleLine } from "react-icons/ri";
import { Order } from "@/services/orders/types";
import { formatDateTime } from "../lib/formatDateTime";

interface Props {
    tracking: Order["tracking"];
}

export default function OrderTimeline({ tracking }: Props) {
    if (!tracking.length) return null;

    // Newest first — the current state of the order is what people came to read.
    const rows = [...tracking].reverse();

    return (
        <section className="rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <RiCheckboxCircleLine className="text-secondary" />
                    <h2 className="text-base font-bold tracking-tight text-foreground sm:text-lg">
                        Order timeline
                    </h2>
                </div>
                <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {tracking.length} {tracking.length === 1 ? "update" : "updates"}
                </span>
            </div>

            <ol className="space-y-3.5">
                {rows.map((row, index) => {
                    const latest = index === 0;
                    return (
                        <li key={`${row.at}-${index}`} className="flex gap-3">
                            <span
                                className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                                    latest ? "bg-secondary ring-4 ring-secondary/15" : "bg-success"
                                }`}
                            />
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold capitalize tracking-tight text-foreground sm:text-sm">
                                    {row.status}
                                </p>
                                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
                                    {row.message}
                                </p>
                                <p
                                    className="mt-1 text-[10px] font-medium text-muted-foreground/70"
                                    suppressHydrationWarning
                                >
                                    {formatDateTime(row.at)} UTC
                                </p>
                            </div>
                        </li>
                    );
                })}
            </ol>
        </section>
    );
}
