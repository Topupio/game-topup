"use client";

import { Product } from "@/lib/types/product";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import { FreeMode } from "swiper/modules";
import Link from "next/link";
import { motion } from "framer-motion";
import { RiFlashlightFill, RiArrowRightSLine } from "react-icons/ri";

interface Props {
    products: Product[];
}

export default function HotProducts({ products }: Props) {
    if (!products || products.length === 0) return null;

    return (
        <div className="mt-8 lg:mt-16 relative">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-tertiary/10 border border-tertiary/20 flex items-center justify-center text-tertiary">
                        <RiFlashlightFill size={24} className="animate-pulse" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Hot Products</h2>
                        <p className="text-gray-500 text-xs uppercase tracking-widest font-medium">Limited Time Deals</p>
                    </div>
                </div>

                <Link
                    href="/categories"
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-secondary transition-colors group"
                >
                    View All <RiArrowRightSLine className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            <Swiper
                slidesPerView="auto"
                spaceBetween={20}
                freeMode={true}
                modules={[FreeMode]}
            >
                {products.map((product) => (
                    <SwiperSlide
                        key={product._id}
                        className="!w-[45%] sm:!w-[35%] lg:!w-[22%] h-auto"
                    >
                        <SingleProduct product={product} />
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}

const SingleProduct = ({ product }: { product: Product }) => {
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
            className="group relative h-full rounded-2xl p-3 bg-white border border-gray-200 hover:border-secondary/30 transition-all duration-300 hover:shadow-sm "
        >
            <Link href={`/games/${gameSlug}`} className="block">
                {/* Image */}
                <div className="relative overflow-hidden rounded-xl bg-gray-50 p-3">
                    <img
                        src={product.imageUrl ?? "/placeholder.png"}
                        alt={product.name}
                        className="w-full h-28 object-contain transition-transform duration-500 group-hover:scale-110"
                    />
                    {hasDiscount && (
                        <div className="absolute top-2 left-2 z-10 bg-secondary text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                            -{discountPercent}%
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="mt-3 space-y-1 text-center">
                    <h3 className="text-gray-900 font-semibold text-sm tracking-wide truncate group-hover:text-secondary transition-colors">
                        {product.name}
                    </h3>
                    <p className="text-gray-500 text-[11px] uppercase tracking-wider">
                        {game?.name || "Game"}
                    </p>
                </div>

                {/* Price */}
                <div className="mt-3 text-center space-y-0.5">
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-secondary font-bold text-lg">
                            ${product.discountedPrice}
                        </span>
                        {hasDiscount && (
                            <span className="text-gray-400 text-xs line-through">
                                ${product.price}
                            </span>
                        )}
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};
