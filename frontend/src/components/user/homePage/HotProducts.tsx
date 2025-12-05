"use client";

import { Game } from "@/lib/types/game";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import { FreeMode } from "swiper/modules";

interface Props {
    games: Game[];
}

export default function HotProducts({ games }: Props) {
    return (
        <div className="mt-8 lg:mt-14">
            <h2 className="text-2xl font-semibold text-white mb-4">Hot Products</h2>

            <Swiper
                slidesPerView="auto"
                spaceBetween={20}
                freeMode={true}
                modules={[FreeMode]}
            >
                {games.map((game) => (
                    <SwiperSlide
                        key={game._id}
                        className="!w-[85%] sm:!w-[60%] lg:!w-[30%]"
                    >
                        <SingleProduct game={game} />
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}

const SingleProduct = ({ game }: { game: Game }) => {
    return (
        <div className="group relative mt-1 rounded-xl p-5 bg-white/5 backdrop-blur-xl border border-white/10 hover:border-secondary transition-all duration-300 overflow-hidden hover:-translate-y-1">
            <div className="flex items-center gap-5 text-white">
                <img
                    src={game.imageUrl ?? "/placeholder.png"}
                    alt={game.name}
                    className="relative z-10 lg:w-24 w-20 lg:h-24 h-20 object-cover rounded-lg"
                />

                <div className="flex flex-col lg:flex-row justify-between w-full lg:h-24 h-20 ">
                    <div className="flex flex-col justify-between">
                        <p className="text-lg uppercase">{game.name}</p>
                        <p className="hidden lg:block">500 Uc</p>
                        <p>ajam</p>
                    </div>

                    <div className="flex items-end justify-end">
                        <button className="px-4 py-1 rounded-full bg-tertiary font-semibold lg:text-md text-sm">
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};