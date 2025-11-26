"use client";

import { useState, useMemo } from "react";
import { Game } from "@/lib/types/game";
import GamesToolbar from "@/components/admin/games/GamesToolbar";
import SearchBox from "@/components/admin/games/SearchBox";
import GamesTable from "@/components/admin/games/GamesTable";

const AdminGamePage = ({ initialItems }: { initialItems: Game[] }) => {
    const [items, setItems] = useState(initialItems);
    const [search, setSearch] = useState("");

    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();
        if (!q) return items;
        return items.filter(i =>
            `${i.name} ${i.slug}`.toLowerCase().includes(q)
        );
    }, [search, items]);
    return (
        <div className="p-6 w-full">
            <GamesToolbar />

            <SearchBox value={search} onChange={setSearch} />

            <GamesTable
                items={filtered}
                onEdit={(idx) => {}}
                onDelete={(idx) => {}}
                onToggle={(idx) => {
                    setItems(items =>
                        items.map((it, i) =>
                            i === idx
                                ? { ...it, status: it.status === "active" ? "inactive" : "active" }
                                : it
                        )
                    );
                }}
            />
        </div>
    )
}

export default AdminGamePage