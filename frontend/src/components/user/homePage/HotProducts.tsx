"use client";

import { Product } from "@/lib/types/product";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import { FreeMode } from "swiper/modules";
import Link from "next/link";
import { RiFlashlightFill, RiArrowRightSLine } from "react-icons/ri";
import SingleProductCard from "../components/SingleProductCard";

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
                        className="!w-[45%] sm:!w-[35%] lg:!w-[22%] h-a"
                    >
                        <SingleProductCard product={product} />
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}