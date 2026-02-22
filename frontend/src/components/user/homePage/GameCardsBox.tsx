import { Game } from "@/lib/types/game";
import SingleGameCard from "./SingleGameCard";
import Link from "next/link";
import { RiArrowRightSLine } from "react-icons/ri";

interface GameCardsBoxProps {
    title: string;
    games: Game[];
}

const GameCardsBox = ({ title, games }: GameCardsBoxProps) => {
    return (
        <div className="rounded-2xl p-6 bg-card border border-border hover:border-border transition-colors">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-foreground font-bold text-lg lg:text-xl capitalize tracking-tight">
                        {title}
                    </h2>
                    <div className="h-1 w-12 bg-secondary rounded-full mt-1" />
                </div>

                <Link
                    href={`/categories?category=${title}&page=1`}
                    className="flex items-center sm:gap-2 gap-1 text-xs text-muted-foreground hover:text-secondary transition-colors group"
                >
                    View All <RiArrowRightSLine className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            <div className="grid lg:grid-cols-2 grid-cols-1 gap-2">
                {games.map((game) => (
                    <SingleGameCard key={game._id} game={game} />
                ))}
            </div>
        </div>
    );
}

export default GameCardsBox;