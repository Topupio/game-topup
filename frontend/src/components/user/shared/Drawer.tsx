"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { RiCloseLine } from "react-icons/ri";

interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    side?: "left" | "right" | "bottom";
}

const Drawer = ({ isOpen, onClose, title, children, side = "right" }: DrawerProps) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!mounted) return null;

    const variants = {
        left: { x: "-100%" },
        right: { x: "100%" },
        bottom: { y: "100%" },
    };

    const drawerMotionProps = {
        initial: variants[side],
        animate: { x: 0, y: 0 },
        exit: variants[side],
        transition: { type: "spring" as const, damping: 25, stiffness: 200 },
    };

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Drawer Content */}
                    <motion.div
                        {...drawerMotionProps}
                        className={`relative h-full bg-primary border-white/10 shadow-2xl z-20 flex flex-col
                            ${side === "bottom" ? "w-full h-[80%] rounded-t-3xl border-t mt-auto" : "w-80 h-full border-l"}
                        `}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/5">
                            <h2 className="text-xl font-bold text-white tracking-tight">
                                {title || "Filters"}
                            </h2>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                            >
                                <RiCloseLine size={24} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto py-6">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
};

export default Drawer;
