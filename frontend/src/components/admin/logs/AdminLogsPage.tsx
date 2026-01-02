"use client";

import { useState, useCallback, useEffect } from "react";
import { adminLogsApiClient } from "@/services/adminLogs/adminLogsApi.client";
import LogsTable from "./LogsTable";
import LogsToolbar from "./LogsToolbar";
import Pagination from "@/components/admin/shared/Pagination";
import { toast } from "react-toastify";

// Define locally if not exported from types yet to avoid errors during build time if types.ts isn't perfect
interface AdminLogResponseData {
    logs: any[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

interface Props {
    initialData: AdminLogResponseData;
}

export default function AdminLogsPage({ initialData }: Props) {
    const [items, setItems] = useState(initialData.logs);
    const [page, setPage] = useState(initialData.pagination.page);
    const [limit, setLimit] = useState(initialData.pagination.limit);
    const [totalPages, setTotalPages] = useState(initialData.pagination.totalPages);
    const [totalItems, setTotalItems] = useState(initialData.pagination.total);
    const [loading, setLoading] = useState(false);

    // Filters state
    const [filters, setFilters] = useState<{
        module?: string;
        action?: string;
        startDate?: string;
        endDate?: string;
    }>({});

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await adminLogsApiClient.list({
                page,
                limit,
                ...filters
            });

            if (res.success && res.data) {
                setItems(res.data.logs);
                setTotalPages(res.data.pagination.totalPages);
                setTotalItems(res.data.pagination.total);
            }
        } catch (error) {
            console.error("Failed to fetch logs:", error);
            toast.error("Failed to fetch logs");
        } finally {
            setLoading(false);
        }
    }, [page, limit, filters]);

    // Initial fetch not needed as we have initialData, but we need to fetch on filter/page change
    // Using a ref or just simple effect logic to avoid double fetch on mount is good practice, 
    // but here we just rely on dependency change. 
    // Since initial state is set from props, we only want to fetch when dependencies change.
    // However, fast refresh or strict mode might trigger it. 
    // We'll skip the FIRST render if it matches initial data? No, simpler to just fetch.

    // Better approach: Effect only runs on change.
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        if (!isMounted) {
            setIsMounted(true);
            return;
        }
        fetchData();
    }, [page, limit, filters, fetchData]); // isMounted is not a dependency

    const handleFilterChange = useCallback((newFilters: any) => {
        setFilters(newFilters);
        setPage(1); // Reset to page 1 on filter change
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Activity Logs</h1>
            </div>

            <LogsToolbar onFilterChange={handleFilterChange} />

            <div className={`transition-opacity ${loading ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
                <LogsTable items={items} />

                <div className="mt-4">
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
        </div>
    );
}
