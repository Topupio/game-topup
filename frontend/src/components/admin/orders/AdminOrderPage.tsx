"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Order, ListOrderResponse, OrderStatus } from "@/services/orders/types";
import { ordersApiClient } from "@/services/orders/ordersApi.client";
import { toast } from "react-toastify";
import OrdersToolbar from "./OrdersToolbar";
import OrdersTable from "./OrdersTable";
import Pagination from "@/components/admin/shared/Pagination";
import { useDebounce } from "use-debounce";
import SearchBox from "@/components/admin/shared/SearchBox";
import { RiRefreshLine, RiFilter3Line } from "react-icons/ri";

export default function AdminOrderPage({ initialData }: { initialData: ListOrderResponse }) {
    const [orders, setOrders] = useState<Order[]>(initialData.data.orders);
    const [loading, setLoading] = useState(false);

    // Filter State
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<OrderStatus | "">("");

    // Debounce search
    const [debouncedSearch] = useDebounce(search, 500);

    // Pagination State
    const [page, setPage] = useState(initialData.data.pagination.page);
    const [limit, setLimit] = useState(initialData.data.pagination.limit);
    const [totalPages, setTotalPages] = useState(initialData.data.pagination.totalPages);
    const [totalItems, setTotalItems] = useState(initialData.data.pagination.total);

    const fetchData = useCallback(async (signal?: AbortSignal) => {
        setLoading(true);
        try {
            const res = await ordersApiClient.adminGetOrders({
                page,
                limit,
                search: debouncedSearch || undefined,
                status: status || undefined,
            }, signal);

            if (res.success) {
                setOrders(res.data.orders);
                setTotalPages(res.data.pagination.totalPages);
                setTotalItems(res.data.pagination.total);
            }
        } catch (error: any) {
            if (error.name !== 'CanceledError' && error.code !== "ERR_CANCELED") {
                console.error(error);
                toast.error("Failed to fetch orders");
            }
        } finally {
            if (!signal?.aborted) {
                setLoading(false);
            }
        }
    }, [page, limit, debouncedSearch, status]);

    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        const controller = new AbortController();
        fetchData(controller.signal);

        return () => controller.abort();
    }, [fetchData]);

    const handleClearFilters = () => {
        setSearch("");
        setStatus("");
        setPage(1);
    };

    return (
        <div className="w-full">
            <OrdersToolbar
                actions={
                    <button
                        disabled={loading}
                        onClick={() => fetchData()}
                        className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-foreground hover:bg-muted transition disabled:opacity-50 shadow-sm"
                    >
                        <RiRefreshLine className={loading ? "animate-spin" : ""} /> Refresh
                    </button>
                }
            />

            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <SearchBox
                    value={search}
                    onChange={setSearch}
                    placeholder="Search Order ID, Email or Player ID..."
                    className="w-full md:w-96"
                />

                <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2 shadow-sm">
                    <RiFilter3Line className="text-muted-foreground" />
                    <select
                        className="bg-transparent text-sm focus:outline-none cursor-pointer pr-4 text-foreground"
                        value={status}
                        onChange={(e) => {
                            const value = e.target.value as '' | OrderStatus;
                            setStatus(value);
                            setPage(1);
                        }}
                    >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="failed">Failed</option>
                    </select>
                </div>

                {(search || status) && (
                    <button
                        onClick={handleClearFilters}
                        className="text-sm text-muted-foreground hover:text-red-500 transition"
                    >
                        Clear Filters
                    </button>
                )}
            </div>

            <div className={`transition-opacity ${loading ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
                <OrdersTable items={orders} />

                {orders.length > 0 && (
                    <div className="mt-6">
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
                )}
            </div>
        </div>
    );
}
