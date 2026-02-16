"use client";

import { Game } from "@/lib/types/game";
import Link from "next/link";
import { motion } from "framer-motion";
import { RiArrowRightSLine, RiStarFill, RiStarHalfFill } from "react-icons/ri";
import { useMemo } from "react";

export default function SingleGameCardCarousel({ game }: { game: Game }) {
    // Get the cheapest active variant pricing (first region)
    const pricing = useMemo(() => {
        const activeVariants = game.variants.filter((v) => v.status === "active");
        if (activeVariants.length === 0) return null;

        let cheapestPrice = Infinity;
        let cheapestDiscounted = Infinity;

        for (const variant of activeVariants) {
            const rp = variant.regionPricing[0];
            if (!rp) continue;
            if (rp.discountedPrice < cheapestDiscounted) {
                cheapestPrice = rp.price;
                cheapestDiscounted = rp.discountedPrice;
            }
        }

        if (cheapestDiscounted === Infinity) return null;
        return { price: cheapestPrice, discountedPrice: cheapestDiscounted };
    }, [game.variants]);

    const hasDiscount = pricing ? pricing.discountedPrice < pricing.price : false;
    const discountPercent = hasDiscount
        ? Math.round(((pricing!.price - pricing!.discountedPrice) / pricing!.price) * 100)
        : 0;

    // Deterministic rating between 4.0 and 5.0 based on game ID
    const rating = useMemo(() => {
        const id = game._id || game.name || "";
        let hash = 0;
        for (let i = 0; i < id.length; i++) {
            hash = ((hash << 5) - hash) + id.charCodeAt(i);
            hash |= 0;
        }
        const normalized = Math.abs(hash % 11) / 10;
        return (4.0 + normalized).toFixed(1);
    }, [game._id, game.name]);

    const renderStars = () => {
        const ratingNum = parseFloat(rating);
        const fullStars = Math.floor(ratingNum);
        const hasHalfStar = ratingNum % 1 >= 0.5;
        const stars = [];

        for (let i = 0; i < fullStars; i++) {
            stars.push(<RiStarFill key={`full-${i}`} className="text-amber-400" size={12} />);
        }
        if (hasHalfStar) {
            stars.push(<RiStarHalfFill key="half" className="text-amber-400" size={12} />);
        }

        return stars;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative h-full rounded-2xl p-3 bg-card border border-border shadow-sm hover:border-secondary/30 hover:shadow-md transition-all duration-300"
        >
            <Link href={`/games/${game.slug}`} className="block">
                {/* Image */}
                <div className="relative overflow-hidden rounded-xl aspect-square">
                    <img
                        src={game.imageUrl ?? "/placeholder.png"}
                        alt={game.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {hasDiscount && (
                        <div className="absolute top-2 left-2 z-10 bg-secondary text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                            -{discountPercent}%
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="mt-3 space-y-1">
                    <h3 className="text-foreground font-semibold text-sm sm:text-base truncate group-hover:text-secondary transition-colors">
                        {game.name}
                    </h3>

                    {/* Star Rating */}
                    <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-0.5">
                            {renderStars()}
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">{rating}</span>
                    </div>
                </div>

                {/* Price & CTA */}
                <div className="mt-3 flex items-center justify-between px-1">
                    {pricing ? (
                        <div className="flex items-center gap-2">
                            <span className="text-secondary font-bold text-lg">
                                ${pricing.discountedPrice}
                            </span>
                            {hasDiscount && (
                                <span className="text-muted-foreground text-sm line-through">
                                    ${pricing.price}
                                </span>
                            )}
                        </div>
                    ) : (
                        <span className="text-muted-foreground text-sm">View options</span>
                    )}
                    <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center group-hover:bg-secondary transition-colors duration-300">
                        <RiArrowRightSLine className="text-secondary group-hover:text-white transition-colors duration-300" size={18} />
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
