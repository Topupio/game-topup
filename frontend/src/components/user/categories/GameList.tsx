"use client";

import { useState } from "react";
import GameCard from "./GameCard";
import { Game } from "@/lib/types/game";

export default function GamesList({ games }: { games: Game[] }) {

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 12;

    const totalPages = Math.ceil(games.length / pageSize);

    const indexOfLast = currentPage * pageSize;
    const indexOfFirst = indexOfLast - pageSize;
    const currentGames = games.slice(indexOfFirst, indexOfLast);

    return (
        <div className="w-full">

            {/* GAMES GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-6 gap-4">
                {currentGames.map((game: Game) => (
                    <GameCard key={game.slug} game={game} />
                ))}
            </div>

            {/* PAGINATION */}
            <Pagination
                totalPages={totalPages}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
            />
        </div>
    );
}

function Pagination({ totalPages, currentPage, setCurrentPage }: any) {
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="flex justify-center items-center gap-2 mt-10">

            <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p: number) => p - 1)}
                className={`px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white
                    ${currentPage === 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-white/10"}`}
            >
                Prev
            </button>

            <div className="flex gap-2">
                {pageNumbers.map((num) => (
                    <button
                        key={num}
                        onClick={() => setCurrentPage(num)}
                        className={`
                            w-10 h-10 rounded-lg text-sm font-medium 
                            border border-white/10 backdrop-blur-xl 
                            flex items-center justify-center
                            transition-all
                            ${currentPage === num
                                ? "bg-secondary text-black border-secondary shadow-lg"
                                : "bg-white/5 text-white hover:bg-white/10"
                            }
                        `}
                    >
                        {num}
                    </button>
                ))}
            </div>

            <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p: number) => p + 1)}
                className={`px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white
                    ${currentPage === totalPages ? "opacity-40 cursor-not-allowed" : "hover:bg-white/10"}`}
            >
                Next
            </button>

        </div>
    );
}
