"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import DOMPurify from "isomorphic-dompurify";
import { RiNotification3Line } from "react-icons/ri";

interface Props {
    /** Raw admin note HTML. Sanitized here, never trusted by callers. */
    message: string;
}

/** True when the note has text or an image/table worth rendering, not just empty markup. */
export function hasRichContent(html: string | undefined): boolean {
    if (!html) return false;

    const stripped = html.replace(/<[^>]*>/g, "").trim();
    return stripped.length > 0 || /<(img|table)\b/i.test(html);
}

export default function AdminMessageCard({ message }: Props) {
    const sanitized = useMemo(() => DOMPurify.sanitize(message), [message]);

    return (
        <motion.div
            id="admin-message"
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="relative scroll-mt-28 overflow-hidden rounded-2xl border border-secondary/25 bg-card shadow-soft"
        >
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-secondary/70 to-transparent"
            />

            <div className="border-b border-secondary/10 bg-secondary/5 px-4 py-2.5 sm:px-5">
                <div className="flex items-center gap-2">
                    <motion.span
                        animate={{ opacity: [1, 0.4, 1] }}
                        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                        className="h-2 w-2 shrink-0 rounded-full bg-success"
                    />
                    <p className="text-secondary text-[10px] font-bold uppercase tracking-wider">
                        Order Update
                    </p>
                </div>
            </div>

            <div className="flex gap-3 p-4 sm:gap-4 sm:p-5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-white sm:h-9 sm:w-9">
                    <RiNotification3Line className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                    <h2 className="text-base font-bold tracking-tight text-foreground sm:text-lg">
                        Update on your order
                    </h2>
                    <div
                        className="rich-description break-words"
                        dangerouslySetInnerHTML={{ __html: sanitized }}
                    />
                </div>
            </div>
        </motion.div>
    );
}
