"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { AdminOrderQueue, Order, ListOrderResponse, OrderParams } from "@/services/orders/types";
import { ordersApiClient } from "@/services/orders/ordersApi.client";
import { toast } from "react-toastify";
import OrdersToolbar from "./OrdersToolbar";
import OrdersTable from "./OrdersTable";
import Pagination from "@/components/admin/shared/Pagination";
import { useDebounce } from "use-debounce";
import SearchBox from "@/components/admin/shared/SearchBox";
import { RiRefreshLine } from "react-icons/ri";

type Props = {
    initialData: ListOrderResponse;
    initialQueue?: AdminOrderQueue;
};

export default function AdminOrderPage({ initialData, initialQueue = "completed" }: Props) {
    const [orders, setOrders] = useState<Order[]>(initialData.data.orders);
    const [loading, setLoading] = useState(false);

    // Filter State
    const [search, setSearch] = useState("");
    const [queue, setQueue] = useState<AdminOrderQueue>(initialQueue);

    // Debounce search
    const [debouncedSearch] = useDebounce(search, 500);

    // Pagination State
    const [page, setPage] = useState(initialData.data.pagination.page);
    const [limit, setLimit] = useState(initialData.data.pagination.limit);
    const [totalPages, setTotalPages] = useState(initialData.data.pagination.totalPages);
    const [totalItems, setTotalItems] = useState(initialData.data.pagination.total);

    const fetchData = useCallback(async (signal?: AbortSignal) => {
        setLoading(true);
        const params: OrderParams = {
            page,
            limit,
            search: debouncedSearch || undefined,
            ...(queue === "upi_review" ? { queue: "upi_review" } : { status: queue || undefined }),
        };

        try {
            const res = await ordersApiClient.adminGetOrders(params, signal);

            if (res.success) {
                setOrders(res.data.orders);
                setTotalPages(res.data.pagination.totalPages);
                setTotalItems(res.data.pagination.total);
            }
        } catch (error: unknown) {
            const requestError = error as { name?: string; code?: string };

            if (requestError.name !== "CanceledError" && requestError.code !== "ERR_CANCELED") {
                console.error(error);
                toast.error("Failed to fetch orders");
            }
        }

        if (!signal?.aborted) {
            setLoading(false);
        }
    }, [page, limit, debouncedSearch, queue]);

    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        const controller = new AbortController();
        void Promise.resolve().then(() => {
            if (!controller.signal.aborted) {
                fetchData(controller.signal);
            }
        });

        return () => controller.abort();
    }, [fetchData]);

    const handleClearFilters = () => {
        setSearch("");
        setQueue("completed");
        setPage(1);
    };

    return (
        <div className="w-full">
            <OrdersToolbar
                actions={
                    <button
                        disabled={loading}
                        onClick={() => fetchData()}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 shadow-sm"
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

                {(search || queue !== "completed") && (
                    <button
                        onClick={handleClearFilters}
                        className="text-sm text-gray-500 hover:text-red-500 transition"
                    >
                        Clear Filters
                    </button>
                )}
            </div>

            <div className={`transition-opacity ${loading ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
                <OrdersTable
                    items={orders}
                    activeQueue={queue}
                    onQueueChange={(nextQueue) => {
                        setQueue(nextQueue);
                        setPage(1);
                    }}
                />

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
