import GameCard from "../components/GameCard";
import { Game } from "@/lib/types/game";
import { RiGamepadLine } from "react-icons/ri";

export default function GamesList({ games }: { games: Game[] }) {
    if (!games || games.length === 0) {
        return (
            <div className="w-full flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mb-4">
                    <RiGamepadLine className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">No games found</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                    There are no games available in this category yet. Try selecting a different category or check back later.
                </p>
            </div>
        );
    }

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