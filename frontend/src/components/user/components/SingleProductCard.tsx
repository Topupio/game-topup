"use client";

import { Product } from "@/lib/types/product";
import Link from "next/link";
import { motion } from "framer-motion";
import { RiArrowRightSLine } from "react-icons/ri";

export default function SingleProductCard({ product }: { product: Product }) {
    // Calculate discount percentage
    const hasDiscount = product.discountedPrice < product.price;
    const discountPercent = hasDiscount
        ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
        : 0;

    // Use game info from populated gameId
    const game = product.gameId as any; // backend populate provides the object
    const gameSlug = game?.slug || "#";

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
                <div className="mt-3 space-y-0.5">
                    <h3 className="text-foreground font-semibold text-sm truncate group-hover:text-secondary transition-colors">
                        {product.name}
                    </h3>
                    <p className="text-muted-foreground text-[11px] uppercase tracking-wider">
                        {game?.name || "Game"}
                    </p>
                </div>

                {/* Price & CTA */}
                <div className="mt-3 flex items-center justify-between px-1">
                    <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Starting from</p>
                        <span className="text-secondary font-bold text-lg leading-tight">
                            ${product.discountedPrice}
                        </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center group-hover:bg-secondary transition-colors duration-300">
                        <RiArrowRightSLine className="text-secondary group-hover:text-white transition-colors duration-300" size={18} />
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
