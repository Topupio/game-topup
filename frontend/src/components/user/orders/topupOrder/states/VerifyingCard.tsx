"use client";

import { motion } from "framer-motion";
import { RiShieldCheckLine, RiCheckboxCircleFill, RiSearchLine, RiFlashlightLine } from "react-icons/ri";
import { formatDateTime, groupUtr } from "../lib/formatDateTime";

interface Props {
    utrNumber: string;
    utrSubmittedAt?: string;
}

const MINI_STEPS = [
    { icon: RiCheckboxCircleFill, label: "UTR received", state: "done" as const },
    { icon: RiSearchLine, label: "Matching with bank", state: "now" as const },
    { icon: RiFlashlightLine, label: "Delivery", state: "todo" as const },
];

export default function VerifyingCard({ utrNumber, utrSubmittedAt }: Props) {
    const submittedAt = formatDateTime(utrSubmittedAt);

    return (
        <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="rounded-2xl border border-border bg-card p-5 text-center shadow-soft sm:p-6"
        >
            {/* Radar: concentric rings expanding out from a shield. */}
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center sm:h-24 sm:w-24">
                {[0, 0.8, 1.6].map((delay) => (
                    <motion.span
                        key={delay}
                        aria-hidden="true"
                        className="absolute inset-0 rounded-full border-2 border-secondary/50"
                        animate={{ scale: [0.7, 1.1], opacity: [0.7, 0] }}
                        transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut", delay }}
                    />
                ))}
                <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-white sm:h-16 sm:w-16">
                    <RiShieldCheckLine className="h-7 w-7 sm:h-8 sm:w-8" />
                </span>
            </div>

            <h2 className="mt-5 text-lg font-extrabold leading-tight tracking-tight text-foreground sm:text-xl">
                We&apos;re verifying your payment
            </h2>
            <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-muted-foreground sm:text-sm">
                Our team is matching your UTR against the bank statement. Delivery starts the
                moment it&apos;s confirmed — you don&apos;t need to do anything else.
            </p>

            {/* The UTR echoed back. Without this the customer has no proof we received it,
                which is what makes them pay a second time. */}
            <div className="mt-5 rounded-xl border border-border bg-muted/60 p-3 text-left sm:p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    UTR you submitted
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-bold tracking-tight tabular-nums text-foreground sm:text-base">
                        {groupUtr(utrNumber)}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-success">
                        <RiCheckboxCircleFill className="h-3 w-3" />
                        Received
                    </span>
                </div>
                {submittedAt && (
                    <p
                        className="mt-2 text-[11px] leading-relaxed text-muted-foreground sm:text-xs"
                        suppressHydrationWarning
                    >
                        Submitted {submittedAt} UTC
                    </p>
                )}
            </div>

            {/* What happens next. */}
            <ol className="mt-2.5 grid grid-cols-3 gap-2">
                {MINI_STEPS.map(({ icon: Icon, label, state }) => (
                    <li
                        key={label}
                        className={`rounded-xl border p-2.5 ${
                            state === "now"
                                ? "border-secondary/40 bg-secondary/5"
                                : "border-border bg-muted/40"
                        }`}
                    >
                        <Icon
                            className={`mx-auto h-4 w-4 ${
                                state === "todo" ? "text-muted-foreground" : "text-secondary"
                            } ${state === "done" ? "text-success" : ""}`}
                        />
                        <span
                            className={`mt-1.5 block text-[9px] font-bold leading-[1.3] tracking-tight sm:text-[10px] ${
                                state === "todo" ? "text-muted-foreground" : "text-foreground"
                            }`}
                        >
                            {label}
                        </span>
                    </li>
                ))}
            </ol>
        </motion.section>
    );
}
