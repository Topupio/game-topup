"use client";

import { CategoryGameSection } from "@/lib/types/game";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import { FreeMode } from "swiper/modules";
import Link from "next/link";
import { RiLayoutGridFill, RiArrowRightSLine } from "react-icons/ri";
import GameCard from "../components/GameCard";
import { categoryToSlug } from "@/lib/constants/checkoutTemplates";

interface Props {
    categories: CategoryGameSection[];
}

export default function CategorySwiperSection({ categories }: Props) {
    if (!categories || categories.length === 0) return null;

    return (
        <div className="mt-8 sm:mt-16 relative">
            {/* Header Section */}
            <div className="flex items-center justify-between sm:mb-6 mb-4">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary shadow-[0_0_20px_rgba(var(--secondary),0.1)]">
                        <RiLayoutGridFill className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-2xl font-bold text-gray-900 tracking-tight">
                            Explore Categories
                        </h2>
                        <p className="text-gray-500 text-xs sm:text-sm font-normal">
                            Find your favorite games
                        </p>
                    </div>
                </div>

                <Link
                    href="/categories"
                    className="hidden sm:flex items-center sm:gap-2 gap-1 text-sm text-gray-500 hover:text-secondary transition-colors group"
                >
                    View All Categories{" "}
                    <RiArrowRightSLine className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            {/* Category Swiper Rows */}
            <div className="space-y-10 lg:space-y-14">
                {categories.map((category) => {
                    if (!category.games || category.games.length === 0) return null;

                    return (
                        <div key={category.category}>
                            {/* Category Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-base sm:text-lg font-bold text-gray-900 capitalize tracking-tight">
                                        {category.category}
                                    </h3>
                                    <div className="h-1 w-10 bg-secondary rounded-full mt-1" />
                                </div>
                                <Link
                                    href={`/categories?category=${categoryToSlug(category.category)}&page=1`}
                                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-secondary transition-colors group"
                                >
                                    View All{" "}
                                    <RiArrowRightSLine className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>

                            {/* Swiper */}
                            <Swiper
                                slidesPerView="auto"
                                spaceBetween={10}
                                breakpoints={{
                                    640: { spaceBetween: 20 },
                                }}
                                freeMode={true}
                                modules={[FreeMode]}
                                className="!overflow-visible"
                            >
                                {category.games.map((game) => (
                                    <SwiperSlide
                                        key={game._id}
                                        className="!w-[40%] sm:!w-[30%] lg:!w-[15%] pb-1"
                                    >
                                        <GameCard game={game} />
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>
                    );
                })}
            </div>

            {/* Mobile View All */}
            <div className="mt-8 flex justify-center sm:hidden">
                <Link
                    href="/categories"
                    className="flex items-center gap-2 text-sm text-secondary font-medium"
                >
                    View All Categories <RiArrowRightSLine />
                </Link>
            </div>
        </div>
    );
}
