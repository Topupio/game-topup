import GameCard from "./GameCard";
import { Game } from "@/lib/types/game";

export default function GamesList({ games }: { games: Game[] }) {
    return (
        <div className="w-full">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-6 gap-4">
                {games.map((game: Game) => (
                    <GameCard key={game.slug} game={game} />
                ))}
            </div>
        </div>
    );
}