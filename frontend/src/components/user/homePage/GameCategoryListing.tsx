import { div } from "framer-motion/client";
import GameCardsBox from "./GameCardsBox";

const GameCategoryListing = () => {
    return (
        <div className="mt-10">
            <div className='flex justify-between my-1'>
                <h2 className='text-2xl font-semibold text-white mb-4'>
                    All Categories
                </h2>
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