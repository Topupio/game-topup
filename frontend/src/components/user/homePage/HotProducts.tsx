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
                        <h2 className="text-2xl font-bold text-white tracking-tight">Hot Products</h2>
                        <p className="text-gray-500 text-xs uppercase tracking-widest font-medium">Limited Time Deals</p>
                    </div>
                </div>

                <Link
                    href="/categories"
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-secondary transition-colors group"
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
                        className="!w-[85%] sm:!w-[45%] lg:!w-[30%] h-auto"
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
            className="group relative h-full rounded-2xl p-4 bg-white/[0.03] backdrop-blur-xl border border-white/5 hover:border-secondary/30 transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-white/[0.05]"
        >
            <Link href={`/games/${gameSlug}`} className="block">
                <div className="flex gap-4 items-start">
                    {/* Image Placeholder/Container */}
                    <div className="relative shrink-0">
                        <div className="absolute inset-0 bg-secondary/20 blur-xl opacity-0 group-hover:opacity-40 transition-opacity rounded-xl" />
                        <img
                            src={product.imageUrl ?? "/placeholder.png"}
                            alt={product.name}
                            className="relative z-10 w-20 h-20 lg:w-24 lg:h-24 object-cover rounded-xl shadow-lg transform group-hover:scale-105 transition-transform duration-500"
                        />
                        {hasDiscount && (
                            <div className="absolute -top-2 -right-2 z-20 bg-secondary text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg">
                                -{discountPercent}%
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex flex-col justify-between h-20 lg:h-24 w-full">
                        <div>
                            <h3 className="text-white font-bold text-sm lg:text-base line-clamp-1 group-hover:text-secondary transition-colors">
                                {product.name}
                            </h3>
                            <p className="text-gray-500 text-[11px] uppercase tracking-wide mt-0.5">
                                {game?.name || "Game"}
                            </p>
                        </div>

                        <div className="flex items-center justify-between mt-auto">
                            <div className="space-y-0.5">
                                {hasDiscount && (
                                    <span className="text-[10px] text-gray-500 line-through opacity-60">
                                        ${product.price}
                                    </span>
                                )}
                                <div className="text-secondary font-black text-lg">
                                    ${product.discountedPrice}
                                </div>
                            </div>

                            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-secondary group-hover:text-white group-hover:border-secondary transition-all">
                                <RiArrowRightSLine size={20} />
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};
