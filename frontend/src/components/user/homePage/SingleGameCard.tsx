"use client";

import { Game } from "@/lib/types/game";
import Link from "next/link";
import { motion } from "framer-motion";
import { RiArrowRightSLine } from "react-icons/ri";

const SingleGameCard = ({ game }: { game: Game }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            whileHover={{ x: 5 }}
            transition={{ duration: 0.3 }}
            className="group relative"
        >
            <Link
                href={`/games/${game.slug}`}
                className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 border border-border hover:bg-muted hover:border-secondary/30 transition-all duration-300 group"
            >
                <div className="relative shrink-0">
                    <img
                        src={game.imageUrl ?? "/placeholder.png"}
                        alt={game.name}
                        className="w-16 h-16 lg:w-20 lg:h-20 object-cover rounded-lg shadow-lg group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-secondary/10 blur-xl opacity-0 group-hover:opacity-40 transition-opacity rounded-full" />
                </div>

                <div className="flex flex-col flex-1 min-w-0">
                    <h3 className="text-foreground font-bold text-sm lg:text-base truncate group-hover:text-secondary transition-colors">
                        {game.name}
                    </h3>
                    <p className="text-muted-foreground text-[11px] uppercase tracking-wide mt-1">
                        {game.topupType}
                    </p>
                    <div className="flex items-center gap-1 text-secondary text-[10px] font-bold mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        View Products <RiArrowRightSLine size={12} />
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

export default SingleGameCard;