"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
    RiApps2Fill,
} from "react-icons/ri";
import { categoryToSlug } from "@/lib/constants/checkoutTemplates";

function GamepadIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 512 512"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient id="gp-bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4B5563" />
                    <stop offset="100%" stopColor="#111827" />
                </linearGradient>
                <radialGradient id="gp-btnGrad" cx="40%" cy="40%" r="70%">
                    <stop offset="0%" stopColor="#A78BFA" />
                    <stop offset="100%" stopColor="#6D28D9" />
                </radialGradient>
                <linearGradient id="gp-shimmerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="white" stopOpacity={0} />
                    <stop offset="50%" stopColor="white" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="white" stopOpacity={0} />
                </linearGradient>
                <mask id="gp-mask">
                    <path d="M467.51,248.83c-18.4-83.18-45.69-136.24-89.43-149.17A91.5,91.5,0,0,0,352,96c-26.89,0-48.11,16-96,16s-69.15-16-96-16a99.09,99.09,0,0,0-27.2,3.66C89,112.59,61.94,165.7,43.33,248.83c-19,84.91-15.56,152,21.58,164.88,26,9,49.25-9.61,71.27-37,25-31.2,55.79-40.8,119.82-40.8s93.62,9.6,118.66,40.8c22,27.41,46.11,45.79,71.42,37.16C487.1,399.86,486.52,334.74,467.51,248.83Z" fill="white" />
                </mask>
            </defs>
            <path d="M467.51,248.83c-18.4-83.18-45.69-136.24-89.43-149.17A91.5,91.5,0,0,0,352,96c-26.89,0-48.11,16-96,16s-69.15-16-96-16a99.09,99.09,0,0,0-27.2,3.66C89,112.59,61.94,165.7,43.33,248.83c-19,84.91-15.56,152,21.58,164.88,26,9,49.25-9.61,71.27-37,25-31.2,55.79-40.8,119.82-40.8s93.62,9.6,118.66,40.8c22,27.41,46.11,45.79,71.42,37.16C487.1,399.86,486.52,334.74,467.51,248.83Z" fill="url(#gp-bodyGrad)" />
            <circle cx="292" cy="224" r="20" fill="url(#gp-btnGrad)" />
            <circle cx="336" cy="268" r="20" fill="url(#gp-btnGrad)" />
            <circle cx="336" cy="180" r="20" fill="url(#gp-btnGrad)" />
            <circle cx="380" cy="224" r="20" fill="url(#gp-btnGrad)" />
            <line x1="160" y1="176" x2="160" y2="272" stroke="#9CA3AF" strokeLinecap="round" strokeWidth="32" />
            <line x1="208" y1="224" x2="112" y2="224" stroke="#9CA3AF" strokeLinecap="round" strokeWidth="32" />
            <rect x="-600" y="0" width="300" height="512" fill="url(#gp-shimmerGrad)" mask="url(#gp-mask)">
                <animate attributeName="x" from="-600" to="700" dur="4s" repeatCount="indefinite" />
            </rect>
        </svg>
    );
}

function GameCoinIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 160 160"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <radialGradient id="goldBase" cx="40%" cy="35%" r="70%">
                    <stop offset="0%" stopColor="#FFF3A3" />
                    <stop offset="60%" stopColor="#FFC83D" />
                    <stop offset="100%" stopColor="#E6A500" />
                </radialGradient>
                <radialGradient id="innerRim" cx="50%" cy="50%" r="60%">
                    <stop offset="0%" stopColor="#FFD86B" />
                    <stop offset="100%" stopColor="#D99800" />
                </radialGradient>
                <linearGradient id="shine" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="white" stopOpacity={0} />
                    <stop offset="50%" stopColor="white" stopOpacity={0.7} />
                    <stop offset="100%" stopColor="white" stopOpacity={0} />
                </linearGradient>
                <mask id="coinMask">
                    <circle cx="80" cy="80" r="70" fill="white" />
                </mask>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            <ellipse cx="80" cy="130" rx="45" ry="10" fill="#000" opacity={0.2} />
            <ellipse cx="80" cy="95" rx="70" ry="20" fill="#C88E00" />
            <circle cx="80" cy="80" r="70" fill="url(#goldBase)" stroke="#B67D00" strokeWidth="6" />
            <circle cx="80" cy="80" r="55" fill="url(#innerRim)" stroke="#D99800" strokeWidth="3" />
            <text
                x="80"
                y="100"
                textAnchor="middle"
                fontSize="60"
                fontFamily="Arial"
                fontWeight="bold"
                fill="#C07F00"
                filter="url(#glow)"
            >
                $
            </text>
            <rect
                x="-160"
                y="0"
                width="160"
                height="160"
                fill="url(#shine)"
                mask="url(#coinMask)"
            >
                <animate
                    attributeName="x"
                    from="-160"
                    to="160"
                    dur="2.5s"
                    repeatCount="indefinite"
                />
            </rect>
        </svg>
    );
}

function GiftCardIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="35 45 250 120"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient id="gc-bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFD76A" />
                    <stop offset="100%" stopColor="#E0A91F" />
                </linearGradient>
                <linearGradient id="gc-ribbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FF5E62" />
                    <stop offset="100%" stopColor="#FF9966" />
                </linearGradient>
                <linearGradient id="gc-panelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="100%" stopColor="#F3F3F3" />
                </linearGradient>
                <linearGradient id="gc-shimmerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="white" stopOpacity={0} />
                    <stop offset="50%" stopColor="white" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="white" stopOpacity={0} />
                </linearGradient>
                <filter id="gc-shadow" x="-20%" y="-20%" width="140%" height="160%">
                    <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#000" floodOpacity={0.25} />
                </filter>
                <mask id="gc-cardMask">
                    <rect x="40" y="50" width="240" height="110" rx="20" fill="white" />
                </mask>
            </defs>
            <ellipse cx="160" cy="180" rx="110" ry="10" fill="#000" opacity={0.2} />
            <rect x="40" y="50" width="240" height="110" rx="20" fill="url(#gc-bodyGrad)" filter="url(#gc-shadow)" />
            <rect x="60" y="70" width="200" height="70" rx="12" fill="url(#gc-panelGrad)" />
            <rect x="40" y="92" width="240" height="26" fill="url(#gc-ribbonGrad)" />
            <rect x="140" y="50" width="26" height="110" fill="url(#gc-ribbonGrad)" />
            <path d="M153 92 C120 70, 100 110, 140 110 C100 110, 120 150, 153 118 Z" fill="url(#gc-ribbonGrad)" />
            <path d="M167 92 C200 70, 220 110, 180 110 C220 110, 200 150, 167 118 Z" fill="url(#gc-ribbonGrad)" />
            <circle cx="160" cy="105" r="10" fill="#FF5E62" />
            <rect x="-150" y="50" width="120" height="110" fill="url(#gc-shimmerGrad)" mask="url(#gc-cardMask)">
                <animate attributeName="x" from="-150" to="350" dur="4s" repeatCount="indefinite" />
            </rect>
        </svg>
    );
}

function SubscriptionIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 160 160"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient id="sub-purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#C084FC" />
                    <stop offset="50%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#6D28D9" />
                </linearGradient>
                <linearGradient id="sub-shimmerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="white" stopOpacity={0} />
                    <stop offset="50%" stopColor="white" stopOpacity={0.7} />
                    <stop offset="100%" stopColor="white" stopOpacity={0} />
                </linearGradient>
                <mask id="sub-sparkleMask">
                    <path d="M70 30 C80 55,100 75,125 85 C100 95,80 115,70 140 C60 115,40 95,15 85 C40 75,60 55,70 30 Z" fill="white" />
                    <path d="M130 20 C135 32,145 42,158 47 C145 52,135 62,130 75 C125 62,115 52,102 47 C115 42,125 32,130 20 Z" fill="white" />
                    <path d="M130 95 C135 107,145 117,158 122 C145 127,135 137,130 150 C125 137,115 127,102 122 C115 117,125 107,130 95 Z" fill="white" />
                </mask>
            </defs>
            <path d="M70 30 C80 55,100 75,125 85 C100 95,80 115,70 140 C60 115,40 95,15 85 C40 75,60 55,70 30 Z" fill="url(#sub-purpleGrad)" />
            <path d="M130 20 C135 32,145 42,158 47 C145 52,135 62,130 75 C125 62,115 52,102 47 C115 42,125 32,130 20 Z" fill="url(#sub-purpleGrad)" />
            <path d="M130 95 C135 107,145 117,158 122 C145 127,135 137,130 150 C125 137,115 127,102 122 C115 117,125 107,130 95 Z" fill="url(#sub-purpleGrad)" />
            <rect x="-120" y="0" width="120" height="160" fill="url(#sub-shimmerGrad)" mask="url(#sub-sparkleMask)">
                <animate attributeName="x" from="-120" to="200" dur="4s" repeatCount="indefinite" />
            </rect>
        </svg>
    );
}

function LiveAppsIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 160 160"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient id="la-liveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FF5F6D" />
                    <stop offset="100%" stopColor="#D90429" />
                </linearGradient>
                <linearGradient id="la-shimmerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="white" stopOpacity={0} />
                    <stop offset="50%" stopColor="white" stopOpacity={0.7} />
                    <stop offset="100%" stopColor="white" stopOpacity={0} />
                </linearGradient>
                <mask id="la-iconMask">
                    <circle cx="80" cy="80" r="60" fill="white" />
                </mask>
            </defs>
            <circle cx="80" cy="80" r="60" fill="url(#la-liveGrad)" />
            <polygon points="70,55 115,80 70,105" fill="white" />
            <rect x="-120" y="0" width="120" height="160" fill="url(#la-shimmerGrad)" mask="url(#la-iconMask)">
                <animate attributeName="x" from="-120" to="200" dur="4s" repeatCount="indefinite" />
            </rect>
        </svg>
    );
}

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
        icon: GamepadIcon,
        gradient: "from-indigo-500 to-violet-500",
        iconBg: "bg-indigo-500/10",
        hoverBorder: "hover:border-indigo-400/50",
        label: "Top Up",
    },
    "login top-up": {
        icon: GameCoinIcon,
        gradient: "from-amber-400 to-orange-500",
        iconBg: "bg-amber-500/10",
        hoverBorder: "hover:border-amber-400/50",
        label: "Game Coins",
    },
    "live apps top-up": {
        icon: LiveAppsIcon,
        gradient: "from-pink-500 to-rose-500",
        iconBg: "bg-pink-500/10",
        hoverBorder: "hover:border-pink-400/50",
        label: "Live Apps",
    },
    "gift cards": {
        icon: GiftCardIcon,
        gradient: "from-emerald-400 to-teal-500",
        iconBg: "bg-emerald-500/10",
        hoverBorder: "hover:border-emerald-400/50",
        label: "Gift Cards",
    },
    "ai & subscriptions": {
        icon: SubscriptionIcon,
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
                className="grid grid-cols-5 gap-1 sm:gap-3"
            >
                {categories.map((cat) => {
                    const meta = CATEGORY_META[cat];
                    if (!meta) return null;
                    const Icon = meta.icon;

                    return (
                        <motion.div key={cat} variants={itemVariants}>
                            <Link
                                href={`/categories?category=${categoryToSlug(cat)}&page=1`}
                                className={`
                                    flex flex-col items-center gap-1.5 group
                                    py-2 cursor-pointer
                                    sm:flex-row sm:justify-start sm:gap-2.5
                                    sm:px-4 sm:py-2.5
                                    sm:bg-card sm:border sm:border-border sm:rounded-xl
                                    sm:hover:border-secondary/40 sm:hover:shadow-md sm:hover:-translate-y-0.5
                                    transition-all duration-300
                                `}
                            >
                                {/* Gradient icon */}
                                {Icon === GamepadIcon || Icon === GameCoinIcon || Icon === GiftCardIcon || Icon === SubscriptionIcon || Icon === LiveAppsIcon ? (
                                    <div className="w-11 h-11 sm:w-9 sm:h-9 shrink-0 flex items-center justify-center overflow-visible group-hover:scale-110 transition-all duration-300">
                                        <Icon className={Icon === GiftCardIcon ? "w-14 h-9 sm:w-[80px] sm:h-[50px]" : "w-14 h-14 sm:w-14 sm:h-14"} />
                                    </div>
                                ) : (
                                    <div
                                        className={`
                                            w-11 h-11 sm:w-9 sm:h-9 shrink-0
                                            rounded-full sm:rounded-xl flex items-center justify-center
                                            bg-gradient-to-br ${meta.gradient}
                                            shadow-sm
                                            group-hover:scale-110 group-hover:shadow-md
                                            transition-all duration-300
                                        `}
                                    >
                                        <Icon className="w-5 h-5 sm:w-[18px] sm:h-[18px] text-white" />
                                    </div>
                                )}

                                {/* Label */}
                                <span className="text-[10px] leading-tight sm:text-sm font-medium sm:font-semibold text-foreground group-hover:text-secondary transition-colors text-center sm:text-left">
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
