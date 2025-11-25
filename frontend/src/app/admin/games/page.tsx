"use client";

import { useEffect, useMemo, useState } from "react";
import { gamesApi } from "@/services/gamesApi";
import GamesToolbar from "@/components/admin/games/GamesToolbar";
import SearchBox from "@/components/admin/games/SearchBox";
import GamesTable from "@/components/admin/games/GamesTable";
import { Game } from "@/lib/types/game";

export default function GamesPricingPage() {
    const [search, setSearch] = useState("");
    const [items, setItems] = useState<Game[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        const load = async () => {
            try {
                const games = await gamesApi.list();
                if (!mounted) return;
                // API returns list response with data: Game[]
                const rows = (games.data || []) as Game[];
                setItems(rows);
            } catch (e: any) {
                if (!mounted) return;
                setError(e?.message || "Failed to load games");
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => {
            mounted = false;
        };
    }, []);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return items;
        return items.filter((i) => `${i.name} ${i.slug}`.toLowerCase().includes(q));
    }, [items, search]);

    return (
        <div className="p-6 w-full">
            <GamesToolbar />

            <SearchBox value={search} onChange={setSearch} />

            {error && (
                <div className="mb-3 text-sm text-red-600">{error}</div>
            )}

            <GamesTable
                items={filtered}
                onEdit={(idx) => {/* TODO: route to edit */}}
                onDelete={(idx) => {/* TODO: confirm & delete */}}
                onToggle={(idx) => {
                    setItems((prev) => prev.map((it, i) =>
                        i === idx
                            ? { ...it, status: it.status === "active" ? "inactive" : "active" }
                            : it
                    ));
                }}
            />
            {loading && <div className="mt-3 text-sm text-gray-500">Loading...</div>}
        </div>
    );
}
