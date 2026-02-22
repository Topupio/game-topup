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
    const [results, setResults] = useState<{ _id: string; slug: string; name: string; imageUrl: string | null; category: string }[]>([]);
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
        <div ref={wrapperRef} className="relative w-64">
            {/* Search Input */}
            <div className="relative w-full rounded-lg bg-muted/70 border border-border transition-all group overflow-hidden hover:border-secondary/40 focus-within:border-secondary focus-within:ring-2 focus-within:ring-ring/20">
                {/* Icon */}
                <RiSearchLine
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-secondary"
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
                    className="w-full bg-transparent pl-9 pr-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none"
                />
            </div>

            {/* Dropdown Panel */}
            <div
                className={`absolute left-0 w-full mt-2 rounded-xl z-40 overflow-hidden bg-card border border-border shadow-lg transition-all duration-300 ${
                    drawerOpen
                        ? "max-h-96 opacity-100 translate-y-0"
                        : "max-h-0 opacity-0 -translate-y-2 pointer-events-none"
                }`}
            >
                {/* Loading */}
                {loading && (
                    <div className="p-4 space-y-3">
                        <div className="h-4 bg-muted rounded animate-pulse"></div>
                        <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
                        <div className="h-4 bg-muted rounded animate-pulse w-1/2"></div>
                    </div>
                )}

                {/* No Results */}
                {!loading && drawerOpen && results.length === 0 && (
                    <div className="p-4 text-muted-foreground text-sm text-center">
                        No results found
                    </div>
                )}

                {/* Results */}
                <div className="max-h-80 overflow-y-auto">
                    {results.map((item) => (
                        <button
                            key={item._id}
                            onClick={() => {
                                router.push(`/games/${item.slug}`);
                                setDrawerOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-foreground transition-all hover:bg-muted/50 group"
                        >
                            {/* Thumbnail */}
                            <img
                                src={item.imageUrl ?? undefined}
                                alt={item.name}
                                className="w-10 h-10 object-cover rounded-lg group-hover:scale-105 transition-transform"
                            />

                            {/* Text */}
                            <div className="text-start">
                                <p className="text-sm font-semibold text-foreground">
                                    {item.name}
                                </p>
                                <p className="text-xs text-muted-foreground">{item.category}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
