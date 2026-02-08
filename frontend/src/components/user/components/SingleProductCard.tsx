"use client";

import { Product } from "@/lib/types/product";
import Link from "next/link";
import { motion } from "framer-motion";
import { RiArrowRightSLine, RiStarFill, RiStarHalfFill } from "react-icons/ri";
import { useMemo } from "react";

export default function SingleProductCard({ product }: { product: Product }) {
    // Calculate discount percentage
    const hasDiscount = product.discountedPrice < product.price;
    const discountPercent = hasDiscount
        ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
        : 0;

    // Use game info from populated gameId
    const game = product.gameId as any; // backend populate provides the object
    const gameSlug = game?.slug || "#";

    // Generate a deterministic rating between 4.0 and 5.0 based on product ID
    const rating = useMemo(() => {
        const productId = product._id || product.name || "";
        let hash = 0;
        for (let i = 0; i < productId.length; i++) {
            hash = ((hash << 5) - hash) + productId.charCodeAt(i);
            hash |= 0;
        }
        // Generate rating between 4.0 and 5.0 with one decimal
        const normalized = Math.abs(hash % 11) / 10; // 0.0 to 1.0
        return (4.0 + normalized).toFixed(1);
    }, [product._id, product.name]);

    // Render stars based on rating
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
            <Link href={`/games/${gameSlug}`} className="block">
                {/* Image */}
                <div className="relative overflow-hidden rounded-xl">
                    <img
                        src={product.imageUrl ?? "/placeholder.png"}
                        alt={product.name}
                        className="w-full h-36 object-cover transition-transform duration-500 group-hover:scale-105"
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
                       {game?.name || "Game"}
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
                    <div className="flex items-center gap-2">
                        <span className="text-secondary font-bold text-lg">
                            ${product.discountedPrice}
                        </span>
                        {hasDiscount && (
                            <span className="text-muted-foreground text-sm line-through">
                                ${product.price}
                            </span>
                        )}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center group-hover:bg-secondary transition-colors duration-300">
                        <RiArrowRightSLine className="text-secondary group-hover:text-white transition-colors duration-300" size={18} />
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
