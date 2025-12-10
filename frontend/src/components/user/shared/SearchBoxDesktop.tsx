"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { RiSearchLine } from "react-icons/ri";
import { gamesApiClient } from "@/services/games";

export default function SearchBoxDesktop() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [query, setQuery] = useState(searchParams.get("search") || "");
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const wrapperRef = useRef<HTMLDivElement | null>(null);

    // Detect Click Outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setDrawerOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Debounced Search
    const handleSearch = useDebouncedCallback(async (value: string) => {
        if (!value.trim()) {
            setDrawerOpen(false);
            setResults([]);
            return;
        }

        setLoading(true);
        setDrawerOpen(true);

        try {
            const res = await gamesApiClient.list({
                page: 1,
                limit: 6,
                search: value,
            });

            setResults(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, 800);

    return (
        <div ref={wrapperRef} className="relative w-72">
            {/* Search Input */}
            <div
                className="
                    relative w-full rounded-xl bg-white/5 border border-white/10 
                    transition-all group overflow-hidden
                    hover:border-secondary
                "
            >
                {/* Icon */}
                <RiSearchLine
                    size={20}
                    className="
                        absolute left-3 top-1/2 -translate-y-1/2 
                        text-gray-400 transition-all group-hover:text-secondary
                    "
                />

                {/* Input */}
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        handleSearch(e.target.value);
                    }}
                    placeholder="Search games..."
                    className="
                        w-full bg-transparent pl-10 pr-3 py-2 text-sm 
                        text-white placeholder-gray-400 focus:outline-none
                    "
                />
            </div>

            {/* Drawer Panel */}
            <div
                className={`
                    absolute left-0 w-full mt-2 rounded-xl z-40
                    overflow-hidden backdrop-blur-xl
                    border border-white/10 bg-primary
                    shadow-[0px_0px_25px_rgba(0,0,0,0.4)]
                    transition-all duration-300
                    ${
                        drawerOpen
                            ? "max-h-96 opacity-100 translate-y-0"
                            : "max-h-0 opacity-0 -translate-y-2"
                    }
                `}
            >
                {/* Loading Animation */}
                {loading && (
                    <div className="p-4 animate-pulse space-y-3">
                        <div className="h-4 bg-white/10 rounded"></div>
                        <div className="h-4 bg-white/10 rounded"></div>
                        <div className="h-4 bg-white/10 rounded"></div>
                    </div>
                )}

                {/* No Results */}
                {!loading && drawerOpen && results.length === 0 && (
                    <div className="p-4 text-gray-400 text-sm text-center">
                        No results found
                    </div>
                )}

                {/* Results */}
                <div className="max-h-80 overflow-y-auto custom-scroll">
                    {results.map((item) => (
                        <button
                            key={item._id}
                            onClick={() => router.push(`/games/${item.slug}`)}
                            className="
                                w-full flex items-center gap-3 px-4 py-3
                                text-gray-200 transition-all
                                hover:bg-white/5 group
                            "
                        >
                            {/* Thumbnail */}
                            <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="
                                    w-12 h-12 object-cover rounded-lg
                                    group-hover:scale-105 transition-all
                                "
                            />

                            {/* Text */}
                            <div className="text-start">
                                <p className="text-sm font-semibold text-white">
                                    {item.name}
                                </p>
                                <p className="text-xs">{item.category}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
