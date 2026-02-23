"use client";

import { RiAddLine, RiFileList3Line, RiUserSettingsLine } from "react-icons/ri";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function QuickActions() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleOpen = () => setIsOpen(!isOpen);

    const actions = [
        { label: "Add Game", icon: RiAddLine, href: "/admin/games/new", color: "bg-indigo-600 text-white" },
        { label: "Add Product", icon: RiAddLine, href: "/admin/products/new", color: "bg-indigo-600 text-white" },
        { label: "View Orders", icon: RiFileList3Line, href: "/admin/orders", color: "bg-card text-foreground" },
        { label: "Manage Users", icon: RiUserSettingsLine, href: "/admin/users", color: "bg-card text-foreground" },
    ];

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.8 },
        visible: { opacity: 1, y: 0, scale: 1 },
    };

    return (
        <div className="fixed bottom-8 right-8 flex flex-col items-end z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="flex flex-col gap-3 items-end mb-4"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                    >
                        {actions.map((action, index) => (
                            <motion.div key={index} variants={itemVariants}>
                                <Link
                                    href={action.href}
                                    className={`${action.color} p-3 rounded-full shadow-lg hover:shadow-xl transition flex items-center gap-2 group border border-border/50 backdrop-blur-sm`}
                                >
                                    <span className="text-sm font-medium px-2">{action.label}</span>
                                    <action.icon size={20} />
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                onClick={toggleOpen}
                className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg hover:shadow-2xl transition cursor-pointer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                animate={{ rotate: isOpen ? 45 : 0 }}
            >
                <RiAddLine size={28} />
            </motion.button>
        </div>
    );
}
