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
        <div className="max-w-7xl mx-auto px-4 lg:px-6 pt-24 lg:pt-20 pb-16 flex flex-col lg:flex-row gap-8">

            {/* Sidebar – Desktop */}
            <aside className="hidden lg:block w-64 shrink-0 sticky top-24 h-fit bg-card border border-border rounded-2xl p-5 shadow-sm">
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
            <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-foreground">
                        Games
                    </h2>

                    {/* Mobile Filter Button */}
                    <button
                        onClick={() => setOpenMobileFilters(true)}
                        className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-white text-sm font-medium shadow-sm"
                    >
                        <RiFilter3Line size={18} /> Filters
                    </button>
                </div>

                {/* Games Grid */}
                <GamesList games={games} />

                {/* Pagination – only when there are results */}
                {games.length > 0 && (
                    <Pagination currentPage={currentPage} totalPages={totalPages} />
                )}
            </div>
        </div>
    );
}

export default CategoryListingPage;

