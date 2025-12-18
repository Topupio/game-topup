import { Game } from "@/services/games";
import Link from "next/link";


const GameCard = ({ game }: { game: Game }) => {
    return (
        <Link
            href={`/games/${game.slug}`}
            className="group relative rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 hover:border-secondary/70 shadow-lg hover:shadow-secondary/30 transition-all duration-500 cursor-pointer block p-4"
        >
            {/* IMAGE */}
            <div className="relative w-full h-40 overflow-hidden rounded-xl mb-4">
                <img
                    src='https://shop.ldrescdn.com/rms/ld-space/process/img/e34aafc23c304614aa073a79e898bc031764664280.webp?x-oss-process=image/resize,m_lfit,w_688,h_688/format,webp'
                    alt={game.name}
                    className="w-full h-full object-cover rounded-xl transform group-hover:scale-110 transition-all duration-700"
                />

                {/* Soft gradient overlay */}
                <div
                    className="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent pointer-events-none"
                />
            </div>

            {/* GAME NAME */}
            <h3
                className="text-white font-semibold text-base group-hover:text-secondary transition-colors duration-300 truncate"
            >
                {game.name}
            </h3>

            {/* Hover glow ring */}
            <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-700 pointer-events-none bg-gradient-to-r from-secondary/15 via-transparent to-secondary/15"
            />
        </Link>
    )
}

export default GameCard;