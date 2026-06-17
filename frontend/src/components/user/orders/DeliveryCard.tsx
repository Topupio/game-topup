"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Delivery } from "@/services/orders/types";
import {
    RiFileCopyLine,
    RiEyeLine,
    RiEyeOffLine,
    RiKey2Line,
    RiCoupon3Line,
    RiCheckboxCircleLine,
    RiAlertLine,
} from "react-icons/ri";

interface Props {
    delivery: Delivery;
}

async function copy(value: string, label: string) {
    try {
        await navigator.clipboard.writeText(value);
        toast.success(`${label} copied`);
    } catch {
        toast.error(`Failed to copy ${label.toLowerCase()}`);
    }
}

const MONTHS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatDate(iso?: string) {
    if (!iso) return null;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    // Locale-independent format to avoid SSR/client hydration mismatch.
    return `${String(d.getUTCDate()).padStart(2, "0")} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function CredentialRow({ label, value, secret }: { label: string; value: string; secret?: boolean }) {
    const [revealed, setRevealed] = useState(false);
    const shown = secret && !revealed ? "•".repeat(Math.max(8, Math.min(value.length, 12))) : value;

    return (
        <div className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {label}
                </p>
                <p className="mt-1 break-all font-mono text-sm font-medium text-foreground">
                    {shown}
                </p>
            </div>
            {secret && (
                <button
                    type="button"
                    onClick={() => setRevealed((r) => !r)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition hover:border-secondary hover:text-secondary"
                    aria-label={revealed ? "Hide value" : "Show value"}
                >
                    {revealed ? <RiEyeOffLine /> : <RiEyeLine />}
                </button>
            )}
            <button
                type="button"
                onClick={() => copy(value, label)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition hover:border-secondary hover:text-secondary"
                aria-label={`Copy ${label}`}
            >
                <RiFileCopyLine />
            </button>
        </div>
    );
}

export default function DeliveryCard({ delivery }: Props) {
    const { kind, intro, items = [], code, steps = [], notice, validUntil, deliveredAt } = delivery;
    const deliveredOn = formatDate(deliveredAt);
    const validUntilOn = formatDate(validUntil);

    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft"
        >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border bg-muted/30 px-4 py-3 sm:px-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                    {kind === "credentials" ? <RiKey2Line className="text-lg" /> : <RiCoupon3Line className="text-lg" />}
                </div>
                <div className="min-w-0 flex-1">
                    <h2 className="text-base font-bold text-foreground">Your Delivery</h2>
                    {deliveredOn && (
                        <p className="text-xs text-muted-foreground" suppressHydrationWarning>
                            Delivered {deliveredOn}
                        </p>
                    )}
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-success/10 px-3 py-1.5 text-[11px] font-bold text-success">
                    <RiCheckboxCircleLine /> Delivered
                </span>
            </div>

            {/* Body */}
            <div className="space-y-4 p-4 sm:p-5">
                {intro && (
                    <p className="text-sm leading-relaxed text-muted-foreground">{intro}</p>
                )}

                {/* Credentials */}
                {kind === "credentials" && items.length > 0 && (
                    <div className="divide-y divide-border rounded-xl border border-border">
                        {items.map((item, i) => (
                            <CredentialRow
                                key={i}
                                label={item.label}
                                value={item.value}
                                secret={item.secret}
                            />
                        ))}
                    </div>
                )}

                {/* Redeem code */}
                {kind === "code" && code && (
                    <div className="rounded-xl border border-dashed border-secondary/40 bg-secondary/5 p-5 text-center">
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-secondary">
                            Redeem Code
                        </p>
                        <p className="mt-2 break-all font-mono text-lg font-bold tracking-wider text-foreground sm:text-xl">
                            {code}
                        </p>
                        <button
                            type="button"
                            onClick={() => copy(code, "Code")}
                            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-secondary px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                        >
                            <RiFileCopyLine /> Copy code
                        </button>
                    </div>
                )}

                {/* Steps */}
                {steps.length > 0 && (
                    <div>
                        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            {kind === "code" ? "How to redeem" : "How to get started"}
                        </p>
                        <ol className="space-y-2">
                            {steps.map((step, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-[11px] font-bold text-secondary">
                                        {i + 1}
                                    </span>
                                    <span className="leading-relaxed">{step}</span>
                                </li>
                            ))}
                        </ol>
                    </div>
                )}

                {/* Notice */}
                {(notice || validUntilOn) && (
                    <div className="flex items-start gap-2.5 rounded-xl border border-warning/30 bg-warning/10 p-3 text-sm leading-relaxed text-warning">
                        <RiAlertLine className="mt-0.5 shrink-0 text-base" />
                        <span>
                            {notice}
                            {validUntilOn && (
                                <>
                                    {notice ? " " : ""}Valid until <strong>{validUntilOn}</strong>.
                                </>
                            )}
                        </span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
