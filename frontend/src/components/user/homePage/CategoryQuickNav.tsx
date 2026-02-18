"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
    RiApps2Fill,
    RiGamepadFill,
    RiLoginBoxFill,
    RiSmartphoneFill,
    RiCoupon3Fill,
    RiSparklingFill,
} from "react-icons/ri";

/* ── icon + color mapping per category ── */
const CATEGORY_META: Record<
    string,
    {
        icon: React.ElementType;
        gradient: string;
        iconBg: string;
        hoverBorder: string;
        label: string;
    }
> = {
    "uid instant top-up": {
        icon: RiGamepadFill,
        gradient: "from-indigo-500 to-violet-500",
        iconBg: "bg-indigo-500/10",
        hoverBorder: "hover:border-indigo-400/50",
        label: "Top Up",
    },
    "login top-up": {
        icon: RiLoginBoxFill,
        gradient: "from-amber-400 to-orange-500",
        iconBg: "bg-amber-500/10",
        hoverBorder: "hover:border-amber-400/50",
        label: "Game Coins",
    },
    "live apps top-up": {
        icon: RiSmartphoneFill,
        gradient: "from-pink-500 to-rose-500",
        iconBg: "bg-pink-500/10",
        hoverBorder: "hover:border-pink-400/50",
        label: "Live Apps",
    },
    "gift cards": {
        icon: RiCoupon3Fill,
        gradient: "from-emerald-400 to-teal-500",
        iconBg: "bg-emerald-500/10",
        hoverBorder: "hover:border-emerald-400/50",
        label: "Gift Cards",
    },
    "ai & subscriptions": {
        icon: RiSparklingFill,
        gradient: "from-cyan-400 to-blue-500",
        iconBg: "bg-cyan-500/10",
        hoverBorder: "hover:border-cyan-400/50",
        label: "Subscriptions",
    },
};

const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 260, damping: 22 } },
};

interface CategoryQuickNavProps {
    categories: string[];
}

export default function CategoryQuickNav({ categories }: CategoryQuickNavProps) {
    return (
        <section className="mt-8 lg:mt-12">
            {/* Section Header */}
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary shadow-[0_0_20px_rgba(var(--secondary),0.1)]">
                    <RiApps2Fill className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                    <h2 className="text-lg sm:text-2xl font-bold text-gray-900 tracking-tight">
                        Browse Categories
                    </h2>
                    <p className="text-gray-500 text-xs sm:text-sm font-normal">
                        Quick access to all categories
                    </p>
                </div>
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 sm:gap-3"
            >
                {categories.map((cat) => {
                    const meta = CATEGORY_META[cat];
                    if (!meta) return null;
                    const Icon = meta.icon;

                    return (
                        <motion.div key={cat} variants={itemVariants}>
                            <Link
                                href={`/categories?category=${encodeURIComponent(cat)}&page=1`}
                                className={`
                                    flex flex-col sm:flex-row items-center justify-center sm:justify-start
                                    gap-1.5 sm:gap-2.5 group
                                    px-3 py-3 sm:px-4 sm:py-2.5
                                    bg-card border border-border rounded-xl
                                    hover:border-secondary/40 hover:shadow-md hover:-translate-y-0.5
                                    transition-all duration-300 cursor-pointer
                                `}
                            >
                                {/* Gradient icon */}
                                <div
                                    className={`
                                        w-8 h-8 sm:w-9 sm:h-9 shrink-0
                                        rounded-lg sm:rounded-xl flex items-center justify-center
                                        bg-gradient-to-br ${meta.gradient}
                                        shadow-sm
                                        group-hover:scale-110 group-hover:shadow-md
                                        transition-all duration-300
                                    `}
                                >
                                    <Icon className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-white" />
                                </div>

                                {/* Label */}
                                <span className="text-[11px] sm:text-sm font-semibold text-foreground group-hover:text-secondary transition-colors whitespace-nowrap">
                                    {meta.label}
                                </span>
                            </Link>
                        </motion.div>
                    );
                })}
            </motion.div>
        </section>
    );
}
