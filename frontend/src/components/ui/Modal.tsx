"use client";

import { AnimatePresence, motion } from "framer-motion";

export default function Modal({ open, onClose, children }: any) {
    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 bg-black/40 z-40"
                        onClick={onClose}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />

                    {/* Modal Box */}
                    <motion.div
                        className="fixed top-1/2 left-1/2 w-[400px] -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg p-6 z-50"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: "spring", damping: 20 }}
                    >
                        {children}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
