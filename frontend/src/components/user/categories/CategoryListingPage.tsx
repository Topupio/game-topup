"use client";

import { useState } from "react";
import { RiFilter3Line } from "react-icons/ri";
import FilterSection from "@/components/user/categories/FilterSection";
import { Game } from "@/services/games";
import GamesList from "./GameList";
import Pagination from "./Pagination";
import Drawer from "../shared/Drawer";

interface CategoryListingPageProps {
    games: Game[];
    currentPage: number;
    totalPages: number;
}

const CategoryListingPage = ({ games, currentPage, totalPages }: CategoryListingPageProps) => {
    const [openMobileFilters, setOpenMobileFilters] = useState(false);

    return (
        <div className="max-w-7xl mx-auto px-4 lg:px-0 pt-24 lg:pt-20 pb-16 flex flex-col lg:flex-row gap-10">

            {/* Sidebar – Desktop */}
            <aside
                className="hidden lg:block w-72 sticky top-24 h-fit backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6"
            >
                <FilterSection />
            </aside>

            {/* Mobile Filters Drawer */}
            <Drawer
                isOpen={openMobileFilters}
                onClose={() => setOpenMobileFilters(false)}
                title="Filters"
            >
                <FilterSection />
            </Drawer>

            {/* Main Content */}
            <div className="flex-1">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-white tracking-wide">
                            Games
                        </h2>

                        {/* Mobile Filter Button */}
                        <button
                            onClick={() => setOpenMobileFilters(true)}
                            className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-black font-semibold shadow-md w-fit"
                        >
                            <RiFilter3Line size={20} /> Filters
                        </button>
                    </div>
                </div>

                {/* Games Grid */}
                <GamesList games={games} />

                {/* Pagination */}
                <Pagination currentPage={currentPage} totalPages={totalPages} />
            </div>
        </div>
    );
}

export default CategoryListingPage;