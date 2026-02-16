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
    // Rating between 4.0 and 5.0 (one decimal)
    const rating = +(4.0 + (hash % 11) / 10).toFixed(1);
    // Review count around 1,500 - 3,000
    const reviews = 1500 + (hash % 1500);
    // Sold count: modest tiers
    const soldTiers = ["1k+", "2k+", "3k+", "5k+"];
    const sold = soldTiers[hash % soldTiers.length];
    return { rating, reviews, sold };
}

function StarRating({ rating }: { rating: number }) {
    const fullStars = Math.floor(rating);
    const hasHalf = rating - fullStars >= 0.3;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
        stars.push(<RiStarFill key={`f${i}`} className="w-4 h-4 text-amber-400" />);
    }
    if (hasHalf) {
        stars.push(<RiStarHalfFill key="h" className="w-4 h-4 text-amber-400" />);
    }

    return <div className="flex items-center gap-0.5">{stars}</div>;
}

export default function HeroHeader({ imageUrl, title, subtitle }: HeroHeaderProps) {
    const stats = useMemo(() => generateStats(title), [title]);

    return (
        <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 mx-4 lg:mx-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
                {/* Left: Icon + Info */}
                <div className="flex items-center gap-4 sm:gap-5 flex-1 min-w-0">
                    {/* Game Icon */}
                    <div className="shrink-0">
                        <img
                            src={imageUrl || "/placeholder-game.png"}
                            alt={title}
                            className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-2xl shadow-lg border border-border"
                        />
                    </div>

                    {/* Game Info */}
                    <div className="min-w-0 space-y-2">
                        <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">
                            {title}
                        </h1>

                        {/* Trust Badges */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium">
                                <RiFlashlightFill className="w-3 h-3" />
                                Fast
                            </span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                                <RiShieldCheckFill className="w-3 h-3" />
                                Safe
                            </span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium">
                                <RiTimeFill className="w-3 h-3" />
                                24/7
                            </span>
                        </div>

                        {/* Category */}
                        {subtitle && (
                            <p className="text-muted-foreground text-sm capitalize">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>

                {/* Right: Trustpilot Rating & Stats */}
                <div className="shrink-0 flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1.5 border-t sm:border-t-0 sm:border-l border-border pt-3 sm:pt-0 sm:pl-6">
                    <img
                        src="/trustpilot-logo.png"
                        alt="Trustpilot"
                        className="h-16 sm:h-20 object-contain"
                    />
                    <div className="flex items-center gap-2">
                        <StarRating rating={stats.rating} />
                        <span className="text-lg font-bold text-foreground">
                            {stats.rating}
                        </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                        {stats.reviews.toLocaleString()} reviews
                    </span>
                    <span className="text-xs font-medium text-emerald-400">
                        {stats.sold} Sold
                    </span>
                </div>
            </div>
        </div>
    );
}
