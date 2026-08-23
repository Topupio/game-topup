"use client";

import { motion } from "framer-motion";
import { RiCheckLine } from "react-icons/ri";
import { Step } from "../lib/orderState";

interface Props {
    steps: Step[];
}

export default function OrderStepper({ steps }: Props) {
    return (
        <ol className="flex items-start">
            {steps.map((step, index) => {
                const done = step.state === "done";
                const now = step.state === "now";
                const reached = done || now;

                return (
                    <li key={step.label} className="relative flex flex-1 flex-col items-center">
                        {/* Connector to the previous step, drawn behind the dot. */}
                        {index > 0 && (
                            <span
                                aria-hidden="true"
                                className={`absolute right-1/2 top-[13px] h-[3px] w-full sm:top-[15px] ${
                                    reached ? "bg-success" : "bg-border"
                                }`}
                            />
                        )}

                        <span
                            className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full border-[3px] text-[10px] font-bold sm:h-8 sm:w-8 sm:text-xs ${
                                done
                                    ? "border-success bg-success text-white"
                                    : now
                                      ? "border-secondary bg-card text-secondary"
                                      : "border-border bg-card text-muted-foreground"
                            }`}
                        >
                            {/* A pulsing ring marks the step in progress. Sits outside the
                                dot so it does not shift the layout as it grows. */}
                            {now && (
                                <motion.span
                                    aria-hidden="true"
                                    className="absolute inset-0 rounded-full border-2 border-secondary"
                                    animate={{ scale: [1, 1.6], opacity: [0.55, 0] }}
                                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                                />
                            )}
                            {done ? <RiCheckLine className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : index + 1}
                        </span>

                        <span
                            className={`mt-2 px-0.5 text-center text-[9px] font-bold leading-[1.25] tracking-tight sm:mt-2.5 sm:text-[11px] ${
                                reached ? "text-foreground" : "text-muted-foreground"
                            }`}
                        >
                            {step.label}
                        </span>

                        {now && <span className="sr-only">(current step)</span>}
                    </li>
                );
            })}
        </ol>
    );
}
