"use client"

import { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface Game {
    id: string;
    name: string;
    icon: string;
    color: string;
    description: string;
}

const games: Game[] = [
    {
        id: "pubg",
        name: "PUBG",
        icon: "🎮",
        color: "from-yellow-500 to-orange-500",
        description: "Battle Royale Legend",
    },
    {
        id: "freefire",
        name: "Free Fire",
        icon: "🔥",
        color: "from-red-500 to-pink-500",
        description: "Fast-paced Action",
    },
    {
        id: "fifa",
        name: "FIFA 24",
        icon: "⚽",
        color: "from-green-500 to-emerald-500",
        description: "Ultimate Team",
    },
    {
        id: "mlbb",
        name: "Mobile Legends",
        icon: "⚔️",
        color: "from-purple-500 to-violet-500",
        description: "5v5 MOBA",
    },
    {
        id: "cod",
        name: "Call of Duty",
        icon: "💥",
        color: "from-blue-600 to-cyan-500",
        description: "FPS Classic",
    },
];

export default function HeroCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [autoPlay, setAutoPlay] = useState(true);

    useEffect(() => {
        if (!autoPlay) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % games.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [autoPlay]);

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
        setAutoPlay(false);
    };

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % games.length);
        setAutoPlay(false);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + games.length) % games.length);
        setAutoPlay(false);
    };

    return (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-slate-950 to-slate-900 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />

            <div className="max-w-7xl mx-auto relative z-10">

                {/* Main carousel */}
                <div className="relative mb-8 lg:mt-8">
                    <div className="relative overflow-hidden rounded-xl">
                        <div className="relative max-h-[80vh] lg:min-h-[60vh] min-h-[30vh]">
                            {games.map((game, index) => (
                                <div
                                    key={game.id}
                                    className={`absolute inset-0 transition-all duration-500 ease-out transform ${index === currentIndex
                                            ? "opacity-100 scale-100"
                                            : index < currentIndex
                                                ? "opacity-0 scale-95 translate-x-full"
                                                : "opacity-0 scale-95 -translate-x-full"
                                        }`}
                                >
                                    <div
                                        className={`h-full bg-gradient-to-br ${game.color} relative overflow-hidden`}
                                    >
                                        {/* Animated background pattern */}
                                        <div className="absolute inset-0 opacity-20">
                                            <div style={{
                                                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
                                                backgroundSize: '50px 50px'
                                            }} />
                                        </div>

                                        {/* Content */}
                                        <div className="relative h-full flex flex-col items-center justify-center text-white">
                                            <div className="text-8xl mb-4 drop-shadow-2xl">
                                                {game.icon}
                                            </div>
                                            <h3 className="text-4xl font-black mb-2">{game.name}</h3>
                                            <p className="text-lg opacity-90">{game.description}</p>
                                        </div>

                                        {/* Neon border effect */}
                                        <div className="absolute inset-0 pointer-events-none border-2 border-white/20 rounded-xl" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Navigation buttons */}
                        <button
                            onClick={prevSlide}
                            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all hover:scale-110"
                        >
                            <FaChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all hover:scale-110"
                        >
                            <FaChevronRight className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Dots indicator */}
                    <div className="flex justify-center gap-2 mt-8">
                        {games.map((game, index) => (
                            <button
                                key={game.id}
                                onClick={() => goToSlide(index)}
                                className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex
                                        ? "bg-gradient-neon w-8"
                                        : "bg-gray-600 w-2 hover:bg-gray-500"
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Quick game buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-12">
                    {games.map((game) => (
                        <button
                            key={game.id}
                            onClick={() => goToSlide(games.indexOf(game))}
                            className="group p-4 rounded-lg border-2 border-gray-700 hover:border-primary bg-slate-800/50 hover:bg-slate-800 transition-all duration-300"
                        >
                            <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                                {game.icon}
                            </div>
                            <div className="text-sm font-bold text-white">{game.name}</div>
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}
