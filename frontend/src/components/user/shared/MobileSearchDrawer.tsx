"use client";

import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { Game, gamesApiClient } from "@/services/games";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { RiSearchLine } from "react-icons/ri";
import { IoChevronBack } from "react-icons/io5";

export default function MobileSearchDrawer() {
    const router = useRouter();

    const [query, setQuery] = useState("");
    const [debouncedQuery] = useDebounce(query, 700); // <--- DEBOUNCED VALUE

    const [page, setPage] = useState(1);
    const [data, setData] = useState<Game[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(1);

    // ---- FETCH DATA ----
    const fetchGames = async (reset = false) => {
        if (!debouncedQuery) {
            setData([]);
            return;
        }

        setLoading(true);

        try {
            const response = await gamesApiClient.list({
                search: debouncedQuery,
                page: reset ? 1 : page,
                limit: 6,
            });

            const result: Game[] = response.data || [];
            const total = response.totalPages || 1;

            if (reset) {
                setData(result);
                setPage(1);
            } else {
                setData((prev) => [...prev, ...result]);
            }

            setTotalPages(total);
        } catch (err) {
            console.error("Search failed:", err);
        }

        setLoading(false);
    };

    // ---- TRIGGER ON DEBOUNCED SEARCH ----
    useEffect(() => {
        fetchGames(true); // run fresh search
    }, [debouncedQuery]);

    // ---- PAGINATION ----
    useEffect(() => {
        if (page > 1) fetchGames(false);
    }, [page]);

    const loadMore = () => {
        if (page < totalPages) {
            setPage((prev) => prev + 1);
        }
    };

    return (
        <div className="flex flex-col min-h-[90vh] text-white">

            {/* HEADER + BACK BUTTON */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
                >
                    <IoChevronBack size={18} />
                </button>

                <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-xl px-4 py-2 w-full">
                    <RiSearchLine size={20} className="text-gray-300" />

                    <input
                        type="text"
                        placeholder="Search games..."
                        className="w-full bg-transparent outline-none text-white placeholder-gray-400"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto space-y-6 pb-20">
                {data.map((game: Game) => (
                    <div
                        key={game._id}
                        className="flex gap-4 pb-4 border-b border-white/10 cursor-pointer"
                        onClick={() => router.push(`/games/${game.slug}`)}
                    >
                        <div className="h-14 w-14 bg-white/10 rounded-xl flex items-center justify-center overflow-hidden">
                            <Image
                                src={game.imageUrl}
                                alt={game.name}
                                width={56}
                                height={56}
                                className="object-cover h-full w-full"
                            />
                        </div>

                        <div className="flex flex-col">
                            <p className="font-semibold text-md">{game.name}</p>
                            <p className="text-sm text-gray-400">{game.category || ""}</p>
                        </div>
                    </div>
                ))}

                {/* NO RESULTS */}
                {debouncedQuery.length > 0 && !loading && data.length === 0 && (
                    <p className="text-center text-gray-400 mt-10">
                        No results found
                    </p>
                )}

                {/* LOAD MORE */}
                {page < totalPages && !loading && data.length > 0 && (
                    <button
                        onClick={loadMore}
                        className="w-full py-3 rounded bg-white/10 hover:bg-white/20 transition"
                    >
                        Load More
                    </button>
                )}

                {/* LOADING */}
                {loading && (
                    <p className="text-center text-gray-400">Loading...</p>
                )}
            </div>

            {/* FOOTER */}
            <footer className="text-center text-gray-500 text-sm py-4">
                ©2005–2025 apptopup.com All Rights Reserved.
            </footer>
        </div>
    );
}