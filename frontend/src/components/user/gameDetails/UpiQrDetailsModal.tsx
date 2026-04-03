"use client";

import { useEffect, useRef } from "react";
import { RiCloseLine } from "react-icons/ri";
import UpiQrCheckout from "./UpiQrCheckout";

interface Props {
    orderId: string;
    orderReference: string;
    onClose: () => void;
    onUtrSubmitted?: () => void;
}

export default function UpiQrDetailsModal({
    orderId,
    orderReference,
    onClose,
    onUtrSubmitted,
}: Props) {
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    // Lock body scroll while modal is open
    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, []);

    // Auto-focus the close button for keyboard accessibility
    useEffect(() => {
        closeButtonRef.current?.focus();
    }, []);

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="upi-modal-title"
            className="fixed inset-0 z-[60] flex items-center justify-center px-4"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                aria-hidden="true"
                onClick={onClose}
            />

            {/* Modal card */}
            <div className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl">
                {/* Sticky header */}
                <div className="flex items-start justify-between border-b border-border px-6 py-4">
                    <div>
                        <h3
                            id="upi-modal-title"
                            className="text-base font-bold text-foreground"
                        >
                            Pay via UPI
                        </h3>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            Order reference:&nbsp;
                            <span className="font-mono font-medium text-foreground">
                                {orderReference}
                            </span>
                        </p>
                    </div>

                    <button
                        ref={closeButtonRef}
                        type="button"
                        onClick={onClose}
                        aria-label="Close payment modal"
                        className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
                    >
                        <RiCloseLine className="text-xl" />
                    </button>
                </div>

                {/* Scrollable content */}
                <div className="max-h-[calc(90vh-68px)] overflow-y-auto px-6 py-5">
                    <UpiQrCheckout orderId={orderId} onUtrSubmitted={onUtrSubmitted} />
                </div>
            </div>
        </div>
    );
}
