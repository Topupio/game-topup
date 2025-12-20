"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Game, GamesListResponse } from "@/lib/types/game";
import { gamesApiClient } from "@/services/games";
import { toast } from 'react-toastify'
import GamesToolbar from "@/components/admin/games/GamesToolbar";
import SearchBox from "@/components/admin/shared/SearchBox";
import GamesTable from "@/components/admin/games/GamesTable";
import Pagination from "@/components/admin/shared/Pagination";

const AdminGamePage = ({ initialData }: { initialData: GamesListResponse }) => {
    const router = useRouter();

    const [items, setItems] = useState<Game[]>(initialData.data);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(initialData.page);
    const [limit, setLimit] = useState(initialData.limit);
    const [totalPages, setTotalPages] = useState(initialData.totalPages);
    const [totalItems, setTotalItems] = useState(initialData.total);
    const [loading, setLoading] = useState(false);

    /** FETCH DATA */
    const fetchData = useCallback(async (p: number, l: number, s: string) => {
        setLoading(true);
        try {
            const res = await gamesApiClient.list({
                page: p,
                limit: l,
                search: s
            });
            setItems(res.data);
            setTotalPages(res.totalPages);
            setTotalItems(res.total);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch games");
        } finally {
            setLoading(false);
        }
    }, []);

    // Effect for search, page or limit changes
    useEffect(() => {
        // Debounce search? For now just trigger
        fetchData(page, limit, search);
    }, [page, limit, search, fetchData]);

    /** EDIT */
    const handleEdit = (index: number, item: Game) => {
        router.push(`/admin/games/${item.slug}`);
    };

    /** DELETE */
    const handleDelete = async (index: number, item: Game) => {
        if (!confirm("Are you sure you want to delete this game?")) return;

        try {
            await gamesApiClient.remove(item._id);
            setItems(prev => prev.filter(i => i._id !== item._id));
            setTotalItems(prev => prev - 1);
            toast.success("Game deleted");
        } catch {
            toast.error("Failed to delete game");
        }
    };

    /** TOGGLE STATUS */
    const handleToggle = async (index: number, item: Game) => {
        const newStatus = item.status === "active" ? "inactive" : "active";

        try {
            // Assuming there's a patch/update endpoint for status
            await gamesApiClient.update(item.slug, { status: newStatus } as any);

            setItems(prev =>
                prev.map(it =>
                    it._id === item._id ? { ...it, status: newStatus } : it
                )
            );
            toast.success(`Game status updated to ${newStatus}`);
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    return (
        <div className="p-6 w-full space-y-4">
            <GamesToolbar />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="w-full md:max-w-md">
                    <SearchBox
                        value={search}
                        onChange={(val) => {
                            setSearch(val);
                            setPage(1); // Reset to page 1 on search
                        }}
                    />
                </div>
            </div>

            <div className={`transition-opacity ${loading ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
                <GamesTable
                    items={items}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggle={handleToggle}
                />

                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    limit={limit}
                    onPageChange={setPage}
                    onLimitChange={(l) => {
                        setLimit(l);
                        setPage(1); // Reset to page 1 on limit change
                    }}
                />
            </div>
        </div>
    )
}

export default AdminGamePage;
