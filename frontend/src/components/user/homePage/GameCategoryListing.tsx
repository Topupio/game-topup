import GameCardsBox from "./GameCardsBox";
import Link from "next/link";
import { IoChevronForwardSharp } from "react-icons/io5";

const GameCategoryListing = () => {
    return (
        <div className="mt-10">
            <div className='flex justify-between my-1'>
                <h2 className='text-2xl font-semibold text-white mb-4'>
                    All Categories
                </h2>

                <Link
                    href="/categories"
                    className="text-sm text-white hover:underline flex items-center"
                >
                    <p>
                        View All
                    </p>
                    <IoChevronForwardSharp size={16} className="inline-block ml-1" />
                </Link>
            </div>

            <div className="grid lg:grid-cols-2 grid-cols-1 gap-5">
                <GameCardsBox
                    title="Recommended Games"
                />

                <GameCardsBox
                    title="New Releases"
                />

                <GameCardsBox
                    title="Recommended Games"
                />

                <GameCardsBox
                    title="New Releases"
                />

            </div>
        </div>
    )
}

export default GameCategoryListing;