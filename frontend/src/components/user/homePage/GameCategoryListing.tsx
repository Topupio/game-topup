import { CategoryGameSection } from "@/lib/types/game";
import GameCardsBox from "./GameCardsBox";
import Link from "next/link";
import { RiLayoutGridFill, RiArrowRightSLine } from "react-icons/ri";

const GameCategoryListing = ({ categories }: { categories: CategoryGameSection[] }) => {
    return (
        <div className="mt-16 lg:mt-24 relative">
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
                        <p className="text-gray-500 text-xs sm:text-sm   font-normal">Find your favorite games</p>
                    </div>
                </div>

                <Link
                    href="/categories"
                    className="hidden sm:flex items-center sm:gap-2 gap-1 text-sm text-gray-500 hover:text-secondary transition-colors group"
                >
                    View All Categories <RiArrowRightSLine className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            {/* Grid Layout */}
            <div className="grid lg:grid-cols-2 grid-cols-1 gap-6 lg:gap-8">
                {categories.map((category) => (
                    <GameCardsBox
                        key={category.category}
                        title={category.category}
                        games={category.games}
                    />
                ))}
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

export default GameCategoryListing;