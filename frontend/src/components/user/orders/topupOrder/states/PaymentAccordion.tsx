"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RiBankCardLine, RiArrowDownSLine, RiAlertLine } from "react-icons/ri";
import UpiQrCheckout from "@/components/user/gameDetails/UpiQrCheckout";

interface Props {
    orderId: string;
    onUtrSubmitted?: () => void;
}

/**
 * The payment QR, collapsed behind a disclosure.
 *
 * Shown in the `verifying` state, where the customer has already told us they paid. The
 * QR still needs to be reachable — they may have paid the wrong amount, or not actually
 * paid at all — but showing it expanded reads as "your payment failed" and is what makes
 * people pay twice.
 */
export default function PaymentAccordion({ orderId, onUtrSubmitted }: Props) {
    const [open, setOpen] = useState(false);

    return (
        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                aria-expanded={open}
                className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-muted/40 sm:px-5"
            >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                    <RiBankCardLine className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                    <span className="block text-xs font-bold leading-snug tracking-tight text-foreground sm:text-sm">
                        Haven&apos;t paid yet, or paid the wrong amount?
                    </span>
                    <span className="mt-1 block text-[11px] leading-snug text-muted-foreground sm:text-xs">
                        Re-open the UPI QR and payment details
                    </span>
                </span>
                <motion.span
                    aria-hidden="true"
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="shrink-0 text-muted-foreground"
                >
                    <RiArrowDownSLine className="h-5 w-5" />
                </motion.span>
            </button>

            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        key="body"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.24, ease: "easeOut" }}
                        className="overflow-hidden"
                    >
                        <div className="border-t border-border p-4 sm:p-5">
                            <div className="mb-4 flex gap-2.5 rounded-xl border border-warning/30 bg-warning/10 p-3 text-[11px] leading-relaxed text-warning sm:text-xs">
                                <RiAlertLine className="mt-0.5 h-4 w-4 shrink-0" />
                                <p>
                                    Already paid? Don&apos;t pay again — just wait for verification.
                                    Only use this if your payment didn&apos;t go through.
                                </p>
                            </div>

                            <UpiQrCheckout orderId={orderId} onUtrSubmitted={onUtrSubmitted} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
