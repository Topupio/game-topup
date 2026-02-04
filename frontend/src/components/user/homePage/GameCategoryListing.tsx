import { CategoryGameSection } from "@/lib/types/game";
import GameCardsBox from "./GameCardsBox";
import Link from "next/link";
import { RiLayoutGridFill, RiArrowRightSLine } from "react-icons/ri";

const GameCategoryListing = ({ categories }: { categories: CategoryGameSection[] }) => {
    return (
        <div className="mt-16 lg:mt-24 relative">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary shadow-[0_0_20px_rgba(var(--secondary),0.1)]">
                        <RiLayoutGridFill size={28} />
                    </div>
                    <div>
                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
                            Explore Categories
                        </h2>
                        <p className="text-gray-500 text-xs lg:text-sm font-medium">Find your favorite games and top-up options</p>
                    </div>
                </div>

                <Link
                    href="/categories"
                    className="hidden sm:flex items-center gap-2 text-sm text-gray-500 hover:text-secondary transition-colors group"
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