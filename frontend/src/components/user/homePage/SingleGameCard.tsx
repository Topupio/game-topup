"use client";

import { Game } from "@/lib/types/game";
import Link from "next/link";
import Image from "next/image";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { RiArrowRightSLine } from "react-icons/ri";
import { getGameUrl } from "@/lib/utils/getGameUrl";

type SingleGameCardProps = {
    game: Game;
    className?: string;
    variant?: "default" | "related";
};

const SingleGameCard = ({ game, className = "", variant = "default" }: SingleGameCardProps) => {
    if (variant === "related") {
        return (
            <div className={`group relative ${className}`}>
                <Link
                    href={getGameUrl(game)}
                    className="flex min-h-[4.75rem] items-center gap-3 rounded-xl border border-border bg-card p-2.5 shadow-sm transition-all duration-300 hover:border-secondary/30 hover:bg-muted/60 active:bg-muted active:scale-[0.99]"
                >
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border bg-muted shadow-sm">
                        <Image
                            src={game.imageUrl ?? "/placeholder.png"}
                            alt={game.name}
                            width={56}
                            height={56}
                            sizes="56px"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    </div>

                    <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-bold text-foreground transition-colors group-hover:text-secondary">
                            {game.name}
                        </h3>
                        <p className="mt-1 truncate text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                            {game.topupType || game.paymentCategory || game.category}
                        </p>
                    </div>

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-secondary transition-colors group-hover:bg-secondary group-hover:text-white">
                        <RiArrowRightSLine size={18} />
                    </div>
                </Link>
            </div>
        );
    }

    return (
        <LazyMotion features={domAnimation}>
            <m.div
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                whileHover={{ x: 5 }}
                transition={{ duration: 0.3 }}
                className={`group relative ${className}`}
            >
                <Link
                    href={getGameUrl(game)}
                    className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 border border-border hover:bg-muted hover:border-secondary/30 active:bg-muted active:scale-[0.99] transition-all duration-300 group"
                >
                    <div className="relative shrink-0">
                        <Image
                            src={game.imageUrl ?? "/placeholder.png"}
                            alt={game.name}
                            width={80}
                            height={80}
                            sizes="(min-width: 1024px) 80px, 64px"
                            className="w-16 h-16 lg:w-20 lg:h-20 object-cover rounded-lg shadow-lg group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-secondary/10 blur-xl opacity-0 group-hover:opacity-40 transition-opacity rounded-full" />
                    </div>

                    <div className="flex flex-col flex-1 min-w-0">
                        <h3 className="text-foreground font-bold text-sm lg:text-base truncate group-hover:text-secondary transition-colors">
                            {game.name}
                        </h3>
                        <p className="text-gray-500 text-[11px] uppercase tracking-wide mt-1">
                            {game.topupType}
                        </p>
                        <div className="flex items-center gap-1 text-secondary text-[11px] sm:text-[10px] font-bold mt-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            View Products <RiArrowRightSLine size={12} />
                        </div>
                    </div>
                </Link>
            </m.div>
        </LazyMotion>
    );
}

export default SingleGameCard;
