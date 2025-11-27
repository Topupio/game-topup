"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Game } from "@/lib/types/game";
import { gamesApiClient } from "@/services/games";
import { toast } from 'react-toastify'
import GamesToolbar from "@/components/admin/games/GamesToolbar";
import SearchBox from "@/components/admin/shared/SearchBox";
import GamesTable from "@/components/admin/games/GamesTable";

const AdminGamePage = ({ initialItems }: { initialItems: Game[] }) => {
    const router = useRouter();

    const [items, setItems] = useState(initialItems);
    const [search, setSearch] = useState("");

    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();
        if (!q) return items;
        return items.filter(i =>
            `${i.name} ${i.slug}`.toLowerCase().includes(q)
        );
    }, [search, items]);

    /** EDIT */
    const handleEdit = (index: number, item: Game) => {
        console.log('object id: ', item)
        router.push(`/admin/games/${item._id}`);
    };

    /** DELETE */
    const handleDelete = async (index: number, item: Game) => {
        if (!confirm("Are you sure you want to delete this game?")) return;

        try {
            await gamesApiClient.remove(item._id);

            setItems(prev => prev.filter((_, i) => i !== index));
            toast.success("Game deleted");
        } catch {
            toast.error("Failed to delete game");
        }
    };

    /** TOGGLE STATUS */
    const handleToggle = (index: Number, item: Game) => {
        const newStatus = item.status === "active" ? "inactive" : "active";

        setItems(prev =>
            prev.map((it, i) =>
                i === index ? { ...it, status: newStatus } : it
            )
        );
    };

    return (
        <div className="p-6 w-full">
            <GamesToolbar />

            <SearchBox value={search} onChange={setSearch} />

            <GamesTable
                items={filtered}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggle={handleToggle}
            />
        </div>
    )
}

export default AdminGamePage;