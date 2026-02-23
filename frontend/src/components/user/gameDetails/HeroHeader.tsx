"use client";

import { useMemo } from "react";
import {
    RiFlashlightFill,
    RiShieldCheckFill,
    RiTimeFill,
    RiStarFill,
    RiStarHalfFill,
} from "react-icons/ri";

interface HeroHeaderProps {
    imageUrl: string;
    title: string;
    subtitle?: string;
}

/** Simple seeded hash so every game gets a stable, unique rating */
function seededRandom(seed: string) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = (hash << 5) - hash + seed.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

function generateStats(title: string) {
    const hash = seededRandom(title);
    const rating = +(4.0 + (hash % 11) / 10).toFixed(1);
    const reviews = 1500 + (hash % 1500);
    const soldTiers = ["1k+", "2k+", "3k+", "5k+"];
    const sold = soldTiers[hash % soldTiers.length];
    return { rating, reviews, sold };
}

function StarRating({ rating, size = "md" }: { rating: number; size?: "sm" | "md" }) {
    const fullStars = Math.floor(rating);
    const hasHalf = rating - fullStars >= 0.3;
    const stars = [];
    const cls = size === "sm" ? "w-3.5 h-3.5 text-amber-400" : "w-4 h-4 text-amber-400";

    for (let i = 0; i < fullStars; i++) {
        stars.push(<RiStarFill key={`f${i}`} className={cls} />);
    }
    if (hasHalf) {
        stars.push(<RiStarHalfFill key="h" className={cls} />);
    }

    return <div className="flex items-center gap-0.5">{stars}</div>;
}

export default function HeroHeader({ imageUrl, title, subtitle }: HeroHeaderProps) {
    const stats = useMemo(() => generateStats(title), [title]);

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-center sm:justify-end gap-2.5 sm:gap-3 mb-2">
                    <div className="flex items-center gap-1.5 shrink-0">
                        <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        <span className="text-[13px] sm:text-sm font-[500] text-foreground">
                            Trustpilot
                        </span>
                    </div>
                    <div className="w-px h-4 bg-border shrink-0" />
                    <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                            <svg key={i} className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                        ))}
                    </div>
                    <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                        <span className="ext-sm font-medium text-emerald-500">
                            Excellent
                        </span>
                        <span className="text-[11px] sm:text-xs text-muted-foreground">
                            ·
                        </span>
                        <span className="text-[14px] sm:text-sm text-muted-foreground">
                            {stats.reviews.toLocaleString()} reviews
                        </span>
                    </div>
                </div>
            {/* Hero Card */}
            <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-sm">
                {/* Trustpilot */}
                
                {/* Mobile: stacked layout, sm+: side-by-side */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-5">
                    {/* Game Icon + Title row on mobile */}
                    <div className="flex items-center gap-3 sm:block">
                        <div className="shrink-0">
                            <img
                                src={imageUrl || "/placeholder-game.png"}
                                alt={title}
                                className="w-16 h-16 sm:w-32 sm:h-32 aspect-square object-cover rounded-xl sm:rounded-2xl shadow-lg border border-border"
                            />
                        </div>
                        {/* Title + category visible beside icon on mobile only */}
                        <div className="min-w-0 sm:hidden">
                            <h1 className="text-xl font-bold text-foreground leading-tight line-clamp-2">
                                {title}
                            </h1>
                            {subtitle && (
                                <p className="text-muted-foreground text-xs capitalize mt-0.5">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Game Info */}
                    <div className="min-w-0 space-y-2">
                        {/* Title — hidden on mobile (shown beside icon above) */}
                        <h1 className="hidden sm:block text-2xl font-bold text-foreground truncate">
                            {title}
                        </h1>

                        {/* Trust Badges */}
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                            <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
                                <RiFlashlightFill className="w-3 h-3" />
                                <span className="sm:hidden text-sm">Instant</span>
                                <span className="hidden sm:inline">Instant Delivery</span>
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                                <RiShieldCheckFill className="w-3 h-3" />
                                <span className="sm:hidden text-sm">Secure</span>
                                <span className="hidden sm:inline">Secure Payment</span>
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
                                <RiTimeFill className="w-3 h-3" />
                                <span className="sm:hidden text-sm">24/7</span>
                                <span className="hidden sm:inline">24/7 Support</span>
                            </span>
                        </div>

                        {/* Stars + Sold */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <div className="flex items-center gap-1">
                                <StarRating rating={stats.rating} />
                                <span className="text-sm font-semibold text-foreground">
                                    {stats.rating}
                                </span>
                            </div>
                            <span className="sm:text-xs text-sm font-medium text-emerald-400">
                                {stats.sold} Sold
                            </span>
                        </div>

                        {/* Category — hidden on mobile (shown beside icon above) */}
                        {subtitle && (
                            <p className="hidden sm:block text-muted-foreground text-sm capitalize">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}
