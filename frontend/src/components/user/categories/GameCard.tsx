import { Game } from "@/services/games";
import Link from "next/link";


const GameCard = ({ game }: { game: Game }) => {
    return (
        <Link
            href={`/games/${game.slug}`}
            className="group relative rounded-2xl overflow-hidden bg-card border border-border hover:border-secondary/40 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer block p-3"
        >
            {/* IMAGE */}
            <div className="relative w-full h-40 overflow-hidden rounded-xl mb-3">
                <img
                    src='https://shop.ldrescdn.com/rms/ld-space/process/img/e34aafc23c304614aa073a79e898bc031764664280.webp?x-oss-process=image/resize,m_lfit,w_688,h_688/format,webp'
                    alt={game.name}
                    className="w-full h-full object-cover rounded-xl transform group-hover:scale-105 transition-transform duration-500"
                />
            </div>

            {/* GAME NAME */}
            <h3 className="text-foreground font-semibold text-sm group-hover:text-secondary transition-colors duration-200 truncate">
                {game.name}
            </h3>
        </Link>
    )
}

export default GameCard;
