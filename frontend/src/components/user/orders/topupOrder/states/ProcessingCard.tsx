"use client";

import { motion } from "framer-motion";
import { RiFlashlightFill } from "react-icons/ri";

/**
 * Payment is confirmed and fulfillment is underway. For API-fulfilled games this is the
 * window where `externalOrderPlacer` has handed the order to the provider; for the rest
 * an admin is topping it up by hand.
 */
export default function ProcessingCard() {
    return (
        <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="rounded-2xl border border-border bg-card p-5 text-center shadow-soft sm:p-6"
        >
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center sm:h-24 sm:w-24">
                {[0, 0.8, 1.6].map((delay) => (
                    <motion.span
                        key={delay}
                        aria-hidden="true"
                        className="absolute inset-0 rounded-full border-2 border-success/50"
                        animate={{ scale: [0.7, 1.1], opacity: [0.7, 0] }}
                        transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut", delay }}
                    />
                ))}
                <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-success text-white sm:h-16 sm:w-16">
                    <RiFlashlightFill className="h-7 w-7 sm:h-8 sm:w-8" />
                </span>
            </div>

            <h2 className="mt-5 text-lg font-extrabold leading-tight tracking-tight text-foreground sm:text-xl">
                Payment confirmed, delivering now
            </h2>
            <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-muted-foreground sm:text-sm">
                Your top-up is on its way to the account you gave us. Keep this page open, or
                check back in a minute. we&apos;ll update it as soon as it lands.
            </p>
        </motion.section>
    );
}
