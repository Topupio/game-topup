"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "use-debounce";
import ProductToolbar from './ProductToolbar';
import SearchBox from '../shared/SearchBox';
import { productsApiClient } from "@/services/products";
import { Product, ProductsListResponse } from '@/lib/types/product';
import ProductTable from "./ProductTable";
import { toast } from "react-toastify";
import Pagination from "../shared/Pagination";
import FilterDropdown from "../shared/FilterDropdown";
import { gamesApiClient, Game } from "@/services/games";

const AdminProductListing = ({ initialData }: { initialData: ProductsListResponse }) => {
    const router = useRouter();

    const [items, setItems] = useState<Product[]>(initialData.data);
    const [search, setSearch] = useState("");
    const [debouncedSearch] = useDebounce(search, 900);
    const [page, setPage] = useState(initialData.page);
    const [limit, setLimit] = useState(initialData.limit);
    const [totalPages, setTotalPages] = useState(initialData.totalPages);
    const [totalItems, setTotalItems] = useState(initialData.total);
    const [loading, setLoading] = useState(false);
    const [games, setGames] = useState<Game[]>([]);
    const [selectedGameId, setSelectedGameId] = useState("");

    /** FETCH DATA */
    const fetchData = useCallback(async (p: number, l: number, s: string, g: string) => {
        setLoading(true);
        try {
            const res = await productsApiClient.list({
                page: p,
                limit: l,
                search: s,
                gameId: g
            });
            setItems(res.data);
            setTotalPages(res.totalPages);
            setTotalItems(res.total);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch products");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData(page, limit, debouncedSearch, selectedGameId);
    }, [page, limit, debouncedSearch, selectedGameId, fetchData]);

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const res = await gamesApiClient.list({ status: 'active', limit: 100 });
                setGames(res.data);
            } catch (error) {
                console.error("Failed to fetch games", error);
            }
        };
        fetchGames();
    }, []);

    const handleEdit = (index: number, item: Product) => {
        router.push(`/admin/products/${item._id}`);
    }

    const handleDelete = async (index: number, item: Product) => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        try {
            await productsApiClient.remove(item._id);
            setItems(prev => prev.filter(i => i._id !== item._id));
            setTotalItems(prev => prev - 1);
            toast.success("Product deleted");
        } catch (error) {
            toast.error("Failed to delete product");
        }
    }

    return (
        <div className='p-6 w-full space-y-4'>
            <ProductToolbar />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="w-full md:max-w-md">
                    <SearchBox
                        value={search}
                        onChange={(val) => {
                            setSearch(val);
                            setPage(1);
                        }}
                        placeholder="Search products..."
                    />
                </div>
                <div className="flex items-center gap-2">
                    <FilterDropdown
                        options={games.map(g => ({ label: g.name, value: g._id }))}
                        value={selectedGameId}
                        onChange={(val) => {
                            setSelectedGameId(val);
                            setPage(1);
                        }}
                        placeholder="Filter by Game: All"
                        className="w-full md:w-72"
                    />
                </div>
            </div>

            <div className={`transition-opacity ${loading ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
                <ProductTable
                    items={items}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />

                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    limit={limit}
                    onPageChange={setPage}
                    onLimitChange={(l) => {
                        setLimit(l);
                        setPage(1);
                    }}
                />
            </div>
        </div>
    )
}

export default AdminProductListing;
