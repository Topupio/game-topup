"use client";

import { useState } from "react";
import { RiFilter3Line, RiArrowDownSLine } from "react-icons/ri";

export default function CategoryPage() {
    const [openMobileFilters, setOpenMobileFilters] = useState(false);

    return (
        <div className="max-w-7xl mx-auto px-4 lg:px-0 py-20 flex flex-col lg:flex-row gap-10">

            {/* Sidebar – Desktop */}
            <aside
                className="hidden lg:block w-72 sticky top-24 h-fit backdrop-blur-xl bg-white/5 
                border border-white/10 rounded-2xl p-6 
                shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            >
                <FilterSection />
            </aside>

            {/* Mobile Filter Button */}
            <button
                onClick={() => setOpenMobileFilters(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl
                bg-secondary text-black font-semibold shadow-md w-fit"
            >
                <RiFilter3Line size={20} /> Filters
            </button>

            {/* Mobile Filters Drawer */}
            {openMobileFilters && (
                <div className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-xl 
                z-50 flex justify-end">
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
                            className="w-full sm:w-auto bg-white/5 border border-white/10 text-white 
                            px-4 py-2 rounded-xl backdrop-blur-lg appearance-none pr-10
                            hover:border-secondary/60 transition-all"
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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <ProductCard key={i} />
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ---------------------------------------------- */
/* Filter Section */
/* ---------------------------------------------- */

function FilterSection() {
    return (
        <div className="space-y-8 text-white">

            <FilterGroup title="Top-Up Type">
                <PillItem label="Direct Top-up" />
                <PillItem label="Redeem Code" />
                <PillItem label="In-game Currency" />
            </FilterGroup>

            <FilterGroup title="Game Category">
                <PillItem label="Football" />
                <PillItem label="Shooting" />
                <PillItem label="Battle Royale" />
                <PillItem label="RPG" />
            </FilterGroup>

        </div>
    );
}

/* ---------------------------------------------- */
/* Filter UI Components */
/* ---------------------------------------------- */

function FilterGroup({ title, children }: any) {
    return (
        <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-secondary mb-3">
                {title}
            </h4>
            <div className="space-y-3">{children}</div>
        </div>
    );
}

function PillItem({ label }: { label: string }) {
    return (
        <button
            className="px-4 py-2 text-xs rounded-xl border border-white/10 bg-white/5 
            backdrop-blur-xl w-full text-left font-medium
            hover:border-secondary hover:text-secondary hover:shadow-[0_0_12px_rgba(255,120,0,0.6)]
            transition-all duration-300"
        >
            {label}
        </button>
    );
}

/* ---------------------------------------------- */
/* Product Card */
/* ---------------------------------------------- */

function ProductCard() {
    return (
        <div
            className="group rounded-xl p-4 border border-white/10 bg-white/5 backdrop-blur-xl
            hover:border-secondary hover:shadow-[0_0_20px_rgba(255,120,0,0.45)]
            transition-all duration-300 cursor-pointer"
        >
            <img
                src="/placeholder.png"
                className="rounded-lg w-full h-32 object-cover mb-3 
                group-hover:scale-105 transition-transform"
            />

            <div className="text-white font-semibold text-sm group-hover:text-secondary duration-300">
                500 UC Pack
            </div>

            <div className="text-gray-300 text-xs mt-1">Instant Delivery</div>

            <div className="mt-3 flex justify-between items-center">
                <span className="text-secondary font-bold">₹499</span>
                <button
                    className="px-3 py-1 text-xs rounded-lg bg-secondary text-black font-semibold 
                    hover:bg-tertiary transition"
                >
                    Buy
                </button>
            </div>
        </div>
    );
}
