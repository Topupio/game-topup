"use client";

import { Game } from "@/lib/types/game";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import { FreeMode } from "swiper/modules";
import Link from "next/link";
import { RiFlashlightFill, RiArrowRightSLine } from "react-icons/ri";
import GameCard from "../components/GameCard";

interface Props {
    games: Game[];
}

export default function HotGames({ games }: Props) {
    if (!games || games.length === 0) return null;

    return (
        <div className="mt-8 lg:mt-16 relative">
            <div className="flex items-center justify-between sm:mb-6 mb-4">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-tertiary/10 border border-tertiary/20 flex items-center justify-center text-tertiary">
                        <RiFlashlightFill className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Hot Games</h2>
                        <p className="text-gray-500 text-xs sm:text-sm font-normal">Top-up your favourite games</p>
                    </div>
                </div>

                <Link
                    href="/categories"
                    className="flex items-center sm:gap-2 gap-1 text-sm text-gray-500 hover:text-secondary transition-colors group"
                >
                    View All <RiArrowRightSLine className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            <Swiper
                slidesPerView="auto"
                spaceBetween={20}
                freeMode={true}
                modules={[FreeMode]}
                className="!overflow-visible"
            >
                {games.map((game) => (
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
}
