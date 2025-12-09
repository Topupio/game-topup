'use client';

import { useState } from "react";
import { RiArrowDownSLine, RiFilter3Line } from "react-icons/ri";
import FilterSection from "@/components/user/categories/FilterSection";
import GameCard from "@/components/user/categories/GameCard";
import { Game } from "@/services/games";
import GamesList from "./GameList";

const CategoryListingPage = ({ games }: { games: Game[] }) => {
    const [openMobileFilters, setOpenMobileFilters] = useState(false);

    return (
        <div className="max-w-7xl mx-auto px-4 lg:px-0 py-20 flex flex-col lg:flex-row gap-10">

            {/* Sidebar – Desktop */}
            <aside
                className="hidden lg:block w-72 sticky top-24 h-fit backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6"
            >
                <FilterSection />
            </aside>

            {/* Mobile Filter Button */}
            <button
                onClick={() => setOpenMobileFilters(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-black font-semibold shadow-md w-fit"
            >
                <RiFilter3Line size={20} /> Filters
            </button>

            {/* Mobile Filters Drawer */}
            {openMobileFilters && (
                <div className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-xl z-50 flex justify-end">
                    <div className="w-72 h-full bg-white/10 border-l border-white/20 p-6">
                        <button
                            onClick={() => setOpenMobileFilters(false)}
                            className="text-white text-sm underline mb-4"
                        >
                            Close
                        </button>
                        <FilterSection />
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                    <h2 className="text-2xl font-bold text-white tracking-wide">
                        Game Utilities
                    </h2>

                    {/* Sorting */}
                    <div className="relative group w-full sm:w-auto">
                        <select
                            className="w-full sm:w-auto bg-white/5 border border-white/10 text-white px-4 py-2 rounded-xl backdrop-blur-lg appearance-none pr-10 hover:border-secondary/60 transition-all"
                        >
                            <option value="popular">Most Popular</option>
                            <option value="new">Newest</option>
                        </select>

                        <RiArrowDownSLine
                            className="absolute right-3 top-3 text-white/70 pointer-events-none"
                        />
                    </div>
                </div>

                {/* Products Grid */}
                <GamesList games={games} />
            </div>
        </div>
    );
}

export default CategoryListingPage;